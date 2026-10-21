import type { Ad, AdSet, Campaign, DailyRow, Dataset, Status } from '../shared/types';
import { toDay } from '../shared/analytics';

/**
 * Minimal Graph API client for one ad account.
 * Budgets come back in the currency's minor units ("offset"): kopecks, cents.
 * Currencies below have no minor unit in Meta's table (offset 1) — verify against
 * the Marketing API currency docs if you use one of them.
 */
const OFFSET_1 = new Set(['CLP', 'COP', 'CRC', 'HUF', 'ISK', 'IDR', 'JPY', 'KRW', 'PYG', 'TWD', 'VND']);

const PURCHASE = ['purchase', 'offsite_conversion.fb_pixel_purchase', 'omni_purchase'];
const LEAD = ['lead', 'offsite_conversion.fb_pixel_lead', 'onsite_conversion.lead_grouped'];

interface ActionStat {
  action_type: string;
  value?: string;
  '1d_click'?: string;
  '7d_click'?: string;
  '1d_view'?: string;
}

export class MetaError extends Error {}

export class MetaClient {
  private base: string;
  constructor(
    private token: string,
    private account: string,
    version = 'v23.0',
  ) {
    this.base = `https://graph.facebook.com/${version}`;
    if (!account.startsWith('act_')) this.account = `act_${account}`;
  }

  private async request(url: string, init?: RequestInit): Promise<any> {
    const res = await fetch(url, init);
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.error) {
      const e = body.error ?? {};
      throw new MetaError(e.error_user_msg || e.message || `Meta API ${res.status}`);
    }
    return body;
  }

  private url(path: string, params: Record<string, string> = {}): string {
    const u = new URL(`${this.base}/${path}`);
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
    u.searchParams.set('access_token', this.token);
    return u.toString();
  }

  private async all(path: string, params: Record<string, string>): Promise<any[]> {
    const out: any[] = [];
    let next: string | null = this.url(path, { limit: '500', ...params });
    while (next) {
      const page: any = await this.request(next);
      out.push(...(page.data ?? []));
      next = page.paging?.next ?? null;
    }
    return out;
  }

  async accountInfo(): Promise<{ name: string; currency: string; timezone: string }> {
    const r = await this.request(this.url(this.account, { fields: 'name,currency,timezone_name' }));
    return { name: r.name, currency: r.currency, timezone: r.timezone_name };
  }

  private toMajor(minor: string | undefined, currency: string): number | null {
    if (minor === undefined || minor === null || minor === '' || minor === '0') return null;
    return Number(minor) / (OFFSET_1.has(currency) ? 1 : 100);
  }

  private toMinor(major: number, currency: string): string {
    return String(Math.round(major * (OFFSET_1.has(currency) ? 1 : 100)));
  }

  async fetchDataset(currency: string, event: 'purchase' | 'lead', days = 90): Promise<Dataset> {
    const st = (s: string): Status => (s === 'ACTIVE' ? 'ACTIVE' : 'PAUSED');
    const campaigns: Campaign[] = (
      await this.all(`${this.account}/campaigns`, { fields: 'id,name,status,objective,daily_budget' })
    )
      .filter((c) => c.status !== 'DELETED' && c.status !== 'ARCHIVED')
      .map((c) => ({ id: c.id, name: c.name, status: st(c.status), objective: c.objective ?? '', dailyBudget: this.toMajor(c.daily_budget, currency) }));
    const ids = new Set(campaigns.map((c) => c.id));

    const adsets: AdSet[] = (await this.all(`${this.account}/adsets`, { fields: 'id,name,campaign_id,status,daily_budget' }))
      .filter((a) => ids.has(a.campaign_id))
      .map((a) => ({ id: a.id, campaignId: a.campaign_id, name: a.name, status: st(a.status), dailyBudget: this.toMajor(a.daily_budget, currency) }));

    const ads: Ad[] = (
      await this.all(`${this.account}/ads`, {
        fields: 'id,name,adset_id,campaign_id,status,effective_status,creative{title,object_type,thumbnail_url}',
      })
    )
      .filter((a) => ids.has(a.campaign_id))
      .map((a) => ({
        id: a.id,
        adsetId: a.adset_id,
        campaignId: a.campaign_id,
        name: a.name,
        status: st(a.status),
        review:
          a.effective_status === 'DISAPPROVED'
            ? 'rejected'
            : a.effective_status === 'PENDING_REVIEW' || a.effective_status === 'IN_PROCESS'
              ? 'pending'
              : 'approved',
        format: a.creative?.object_type === 'VIDEO' ? 'video' : 'image',
        headline: a.creative?.title || a.name,
        thumb: a.creative?.thumbnail_url ?? null,
      }));

    // Complete days only: today is still being counted.
    const until = toDay(Date.now() - 86_400_000);
    const since = toDay(Date.now() - days * 86_400_000);
    const raw = await this.all(`${this.account}/insights`, {
      level: 'ad',
      time_increment: '1',
      time_range: JSON.stringify({ since, until }),
      fields: 'ad_id,date_start,spend,impressions,clicks,actions,action_values',
      action_attribution_windows: JSON.stringify(['1d_click', '7d_click', '1d_view']),
    });

    const types = event === 'lead' ? LEAD : PURCHASE;
    const pick = (list: ActionStat[] | undefined) => {
      for (const t of types) {
        const hit = list?.find((x) => x.action_type === t);
        if (hit) return hit;
      }
      return undefined;
    };
    const n = (x: string | undefined) => (x ? Number(x) : 0);
    const rows: DailyRow[] = raw.map((r) => {
      const act = pick(r.actions);
      const val = pick(r.action_values);
      return {
        date: r.date_start,
        adId: r.ad_id,
        spend: Number(r.spend ?? 0),
        impressions: Number(r.impressions ?? 0),
        clicks: Number(r.clicks ?? 0),
        c1: n(act?.['1d_click']),
        c7: n(act?.['7d_click']),
        v1: n(act?.['1d_view']),
        val1: n(val?.['1d_click']),
        val7: n(val?.['7d_click']),
        valV1: n(val?.['1d_view']),
      };
    });

    return { campaigns, adsets, ads, rows };
  }

  async setStatus(id: string, status: Status) {
    await this.request(`${this.base}/${id}`, {
      method: 'POST',
      body: new URLSearchParams({ status, access_token: this.token }),
    });
  }

  async setDailyBudget(id: string, major: number, currency: string) {
    await this.request(`${this.base}/${id}`, {
      method: 'POST',
      body: new URLSearchParams({ daily_budget: this.toMinor(major, currency), access_token: this.token }),
    });
  }
}
