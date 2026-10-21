import type {
  Ad,
  Alert,
  DailyRow,
  Dataset,
  Dimension,
  Leaderboard,
  LeaderRow,
  Metrics,
  Overview,
  Period,
  Settings,
  TreeNode,
} from './types';
import { money as fmtMoney, num, pct as fmtPct } from './format';

const DAY = 86_400_000;

export function toDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function dayMs(day: string): number {
  return Date.parse(day + 'T00:00:00Z');
}

export function lastDay(rows: DailyRow[]): string {
  let max = '';
  for (const r of rows) if (r.date > max) max = r.date;
  return max || toDay(Date.now() - DAY);
}

/** Rows in the `days` days ending `offset` days before `end` (inclusive). */
export function windowRows(rows: DailyRow[], end: string, days: number, offset = 0): DailyRow[] {
  const hi = dayMs(end) - offset * DAY;
  const lo = hi - (days - 1) * DAY;
  return rows.filter((r) => {
    const t = dayMs(r.date);
    return t >= lo && t <= hi;
  });
}

export function isProtected(name: string, tag: string): boolean {
  const t = tag.trim().toLowerCase();
  return t.length > 0 && name.toLowerCase().includes(t);
}

export function metricsOf(rows: DailyRow[], s: Settings): Metrics {
  let spend = 0, impressions = 0, clicks = 0, conversions = 0, revenue = 0;
  const click7 = s.attribution.click === 7;
  const view = s.attribution.view === 1;
  for (const r of rows) {
    spend += r.spend;
    impressions += r.impressions;
    clicks += r.clicks;
    conversions += (click7 ? r.c7 : r.c1) + (view ? r.v1 : 0);
    revenue += (click7 ? r.val7 : r.val1) + (view ? r.valV1 : 0);
  }
  return {
    spend,
    impressions,
    clicks,
    conversions,
    revenue,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    cpc: clicks > 0 ? spend / clicks : 0,
    cpa: conversions > 0 ? spend / conversions : null,
    roas: spend > 0 ? revenue / spend : null,
  };
}

function groupBy<T>(items: T[], key: (t: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const it of items) {
    const k = key(it);
    const arr = m.get(k);
    if (arr) arr.push(it);
    else m.set(k, [it]);
  }
  return m;
}

function isSales(objective: string): boolean {
  return /SALES|CONVERSION|PURCHASE|LEAD/i.test(objective);
}

export function lowData(m: Metrics, s: Settings): boolean {
  return m.spend < s.thresholds.minSpend || m.impressions < s.thresholds.minImpressions;
}


export function detectAlerts(data: Dataset, s: Settings): Alert[] {
  const money = (x: number) => fmtMoney(x, s);
  const pct = (x: number) => fmtPct(x, 0);
  const end = lastDay(data.rows);
  const alerts: Alert[] = [];
  const byAd = groupBy(data.rows, (r) => r.adId);
  const campaigns = new Map(data.campaigns.map((c) => [c.id, c]));

  // 1. Creative fatigue: CTR of the last 3 days fell 30%+ vs the 7 days before.
  for (const ad of data.ads) {
    if (ad.status !== 'ACTIVE') continue;
    const rows = byAd.get(ad.id) ?? [];
    const recent = metricsOf(windowRows(rows, end, 3), s);
    const before = metricsOf(windowRows(rows, end, 7, 3), s);
    if (before.impressions < s.thresholds.minImpressions || before.ctr === 0) continue;
    if (recent.spend + before.spend < s.thresholds.minSpend) continue;
    const drop = (1 - recent.ctr / before.ctr) * 100;
    if (drop >= 30) {
      alerts.push({
        id: `fatigue:${ad.id}`,
        kind: 'fatigue',
        title: ad.name,
        text: `CTR упал на ${pct(drop)} за 3 дня: ${fmtPct(recent.ctr)} против ${fmtPct(before.ctr)}.`,
        targetId: ad.id,
        targetKind: 'ad',
        hasBudget: false,
      });
    }
  }

  // 2. Ad set CPA above goal for the last 3 days (sales campaigns only).
  const adToSet = new Map(data.ads.map((a) => [a.id, a.adsetId]));
  const byAdset = groupBy(data.rows, (r) => adToSet.get(r.adId) ?? '');
  for (const as of data.adsets) {
    const camp = campaigns.get(as.campaignId);
    if (!camp || as.status !== 'ACTIVE' || camp.status !== 'ACTIVE' || !isSales(camp.objective)) continue;
    const m = metricsOf(windowRows(byAdset.get(as.id) ?? [], end, 3), s);
    if (m.spend < s.thresholds.minSpend / 2) continue;
    const cpa = m.cpa ?? Infinity;
    if (cpa > s.goals.cpa * 1.3) {
      const over = cpa === Infinity ? null : (cpa / s.goals.cpa - 1) * 100;
      alerts.push({
        id: `cpa:${as.id}`,
        kind: 'cpa',
        title: `Группа «${as.name}»`,
        text:
          over === null
            ? `${money(m.spend)} потрачено за 3 дня без конверсий.`
            : `CPA ${money(cpa)} за 3 дня — выше цели на ${pct(over)}.`,
        targetId: as.id,
        targetKind: 'adset',
        hasBudget: as.dailyBudget !== null,
      });
    }
  }

  // 3. Tracking: spend yesterday, zero conversions, while the week before had some.
  const yesterday = metricsOf(windowRows(data.rows, end, 1), s);
  const week = metricsOf(windowRows(data.rows, end, 7, 1), s);
  if (yesterday.spend > 0 && yesterday.conversions === 0 && week.conversions / 7 >= 3) {
    alerts.push({
      id: 'tracking',
      kind: 'tracking',
      title: 'Нет конверсий за вчера',
      text: `Расход ${money(yesterday.spend)}, конверсий 0. Проверьте пиксель.`,
      targetId: null,
      targetKind: null,
      hasBudget: false,
    });
  }

  return alerts;
}

export function overview(data: Dataset, s: Settings, period: Period): Overview {
  const end = lastDay(data.rows);
  const cur = windowRows(data.rows, end, period);
  const prev = windowRows(data.rows, end, period, period);

  const series: Overview['series'] = [];
  const bucket = period > 30 ? 7 : 1;
  const buckets = Math.ceil(period / bucket);
  for (let i = buckets - 1; i >= 0; i--) {
    const rows = windowRows(data.rows, end, bucket, i * bucket);
    const m = metricsOf(rows, s);
    const last = toDay(dayMs(end) - i * bucket * DAY);
    const label =
      bucket === 1
        ? period === 7
          ? ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][new Date(dayMs(last)).getUTCDay()]
          : last.slice(8, 10)
        : `${last.slice(8, 10)}.${last.slice(5, 7)}`;
    series.push({ label, spend: m.spend, revenue: m.revenue, conversions: m.conversions });
  }

  const byAd = groupBy(cur, (r) => r.adId);
  const account = metricsOf(cur, s);
  const top = data.ads
    .map((ad) => ({ ad, m: metricsOf(byAd.get(ad.id) ?? [], s) }))
    .filter((x) => !lowData(x.m, s) && x.m.roas !== null && x.m.roas >= (account.roas ?? 0))
    .sort((a, b) => (b.m.roas ?? 0) - (a.m.roas ?? 0))
    .slice(0, 4);

  return {
    period,
    current: account,
    previous: metricsOf(prev, s),
    series,
    alerts: detectAlerts(data, s),
    top,
    account,
  };
}

const FORMAT_LABEL: Record<string, string> = {
  '4:5': 'Изображение 4:5',
  '1:1': 'Изображение 1:1',
  '9:16': 'Видео 9:16',
  carousel: 'Карусель',
  video: 'Видео',
};

export function formatLabel(f: string): string {
  return FORMAT_LABEL[f] ?? f;
}

export function leaderboard(
  data: Dataset,
  s: Settings,
  period: Period,
  dimension: Dimension,
  sort: 'roas' | 'cpa' | 'ctr' = 'roas',
): Leaderboard {
  const end = lastDay(data.rows);
  const rows = windowRows(data.rows, end, period);
  const ads = new Map(data.ads.map((a) => [a.id, a]));
  const adsets = new Map(data.adsets.map((a) => [a.id, a]));
  const average = metricsOf(rows, s);
  const fatigued = new Set(detectAlerts(data, s).filter((a) => a.kind === 'fatigue').map((a) => a.targetId));

  const keyOf = (r: DailyRow): string => {
    const ad = ads.get(r.adId);
    if (!ad) return '';
    if (dimension === 'ad') return ad.id;
    if (dimension === 'headline') return ad.headline;
    if (dimension === 'adset') return ad.adsetId;
    return ad.format;
  };

  const groups = groupBy(rows, keyOf);
  const out: LeaderRow[] = [];
  for (const [key, grs] of groups) {
    if (!key) continue;
    const m = metricsOf(grs, s);
    if (m.spend === 0) continue;
    let label = key;
    let sub = '';
    let adId: string | null = null;
    if (dimension === 'ad') {
      const ad = ads.get(key) as Ad;
      label = ad.name;
      sub = formatLabel(ad.format);
      adId = ad.id;
    } else if (dimension === 'adset') {
      const as = adsets.get(key);
      label = as?.name ?? key;
      sub = data.campaigns.find((c) => c.id === as?.campaignId)?.name ?? '';
    } else if (dimension === 'format') {
      label = formatLabel(key);
    } else {
      const n = new Set(grs.map((r) => r.adId)).size;
      sub = `${n} ${n === 1 ? 'объявление' : n < 5 ? 'объявления' : 'объявлений'}`;
    }
    const low = lowData(m, s);
    const bar = Math.max(s.goals.roas, average.roas ?? 0);
    let badge: LeaderRow['badge'] = 'stable';
    if (low) badge = 'low';
    else if (adId && fatigued.has(adId)) badge = 'fatigue';
    else if ((m.roas ?? 0) >= bar * 1.3) badge = 'winner';
    else if ((m.roas ?? 0) < (average.roas ?? 0) * 0.8) badge = 'below';
    out.push({ key, label, sub, adId, m, lowData: low, badge });
  }

  const score = (r: LeaderRow) =>
    sort === 'roas' ? -(r.m.roas ?? -1) : sort === 'cpa' ? r.m.cpa ?? Infinity : -r.m.ctr;
  out.sort((a, b) => Number(a.lowData) - Number(b.lowData) || score(a) - score(b));

  const insights: Leaderboard['insights'] = [];
  const leaders = out.filter((r) => !r.lowData).slice(0, 5);
  if (dimension === 'ad' && leaders.length >= 3) {

    const formats = groupBy(leaders, (r) => ads.get(r.key)?.format ?? '');
    const [fmt, list] = [...formats.entries()].sort((a, b) => b[1].length - a[1].length)[0];
    if (list.length >= 3) {
      insights.push({
        title: `${formatLabel(fmt)} — ${list.length} из ${leaders.length} лидеров`,
        text: 'Этот формат чаще остальных попадает в топ за период.',
      });
    }
    const lm = metricsOf(
      rows.filter((r) => leaders.some((l) => l.key === r.adId)),
      s,
    );
    if (average.ctr > 0) {
      insights.push({
        title: `CTR лидеров ${fmtPct(lm.ctr)}`,
        text: `Против ${fmtPct(average.ctr)} в среднем по кабинету.`,
      });
    }
  }
  const lowCount = out.filter((r) => r.lowData).length;
  if (lowCount > 0) {
    insights.push({
      title: `${lowCount} с малым объёмом данных`,
      text: `Расход меньше ${fmtMoney(s.thresholds.minSpend, s)} или показов меньше ${num(
        s.thresholds.minImpressions,
      )} — в выводах не участвуют.`,
    });
  }

  return { dimension, period, average, rows: out, insights };
}

export function tree(data: Dataset, s: Settings, period: Period): TreeNode[] {
  const end = lastDay(data.rows);
  const rows = windowRows(data.rows, end, period);
  const byAd = groupBy(rows, (r) => r.adId);
  const adRows = (ids: string[]) => ids.flatMap((id) => byAd.get(id) ?? []);

  return data.campaigns.map((c) => {
    const prot = isProtected(c.name, s.permissions.protectedTag);
    const sets = data.adsets.filter((a) => a.campaignId === c.id);
    const children: TreeNode[] = sets.map((as) => {
      const ads = data.ads.filter((a) => a.adsetId === as.id);
      const m = metricsOf(adRows(ads.map((a) => a.id)), s);
      const cpaBad =
        isSales(c.objective) && !lowData(m, s) && (m.cpa ?? Infinity) > s.goals.cpa * 1.3;
      return {
        id: as.id,
        kind: 'adset' as const,
        name: as.name,
        status: as.status,
        dailyBudget: as.dailyBudget,
        protected: prot,
        m,
        problem: cpaBad ? 'CPA выше цели' : null,
        children: ads.map((ad) => ({
          id: ad.id,
          kind: 'ad' as const,
          name: ad.name,
          status: ad.status,
          dailyBudget: null,
          review: ad.review,
          protected: prot,
          m: metricsOf(byAd.get(ad.id) ?? [], s),
          problem: ad.review === 'rejected' ? 'Отклонено Meta' : ad.review === 'pending' ? 'На проверке' : null,
          children: [],
        })),
      };
    });
    return {
      id: c.id,
      kind: 'campaign' as const,
      name: c.name,
      status: c.status,
      dailyBudget: c.dailyBudget,
      protected: prot,
      m: metricsOf(adRows(data.ads.filter((a) => a.campaignId === c.id).map((a) => a.id)), s),
      problem: children.some((ch) => ch.problem || ch.children.some((a) => a.problem)) ? 'Есть проблемы' : null,
      children,
    };
  });
}

/** Find any entity by id. */
export function findEntity(data: Dataset, id: string) {
  const c = data.campaigns.find((x) => x.id === id);
  if (c) return { kind: 'campaign' as const, name: c.name, status: c.status, dailyBudget: c.dailyBudget, campaignId: c.id };
  const a = data.adsets.find((x) => x.id === id);
  if (a) return { kind: 'adset' as const, name: a.name, status: a.status, dailyBudget: a.dailyBudget, campaignId: a.campaignId };
  const d = data.ads.find((x) => x.id === id);
  if (d) return { kind: 'ad' as const, name: d.name, status: d.status, dailyBudget: null, campaignId: d.campaignId };
  return null;
}

/** Sum of daily budgets of everything currently running. */
export function activeDailyBudget(data: Dataset): number {
  let sum = 0;
  for (const c of data.campaigns) {
    if (c.status !== 'ACTIVE') continue;
    if (c.dailyBudget !== null) sum += c.dailyBudget;
    else
      for (const a of data.adsets)
        if (a.campaignId === c.id && a.status === 'ACTIVE' && a.dailyBudget !== null) sum += a.dailyBudget;
  }
  return sum;
}

export const ATTRIBUTION_WINDOWS: { label: string; click: 1 | 7; view: 0 | 1 }[] = [
  { label: '1 день клик', click: 1, view: 0 },
  { label: '7 дней клик', click: 7, view: 0 },
  { label: '7д клик + 1д просмотр', click: 7, view: 1 },
];

/** The same period measured under each attribution window. */
export function compareWindows(data: Dataset, s: Settings, period: Period) {
  const rows = windowRows(data.rows, lastDay(data.rows), period);
  return ATTRIBUTION_WINDOWS.map((w) => ({
    ...w,
    m: metricsOf(rows, { ...s, attribution: { click: w.click, view: w.view } }),
  }));
}
