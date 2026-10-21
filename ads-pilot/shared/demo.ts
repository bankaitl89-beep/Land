import type { Ad, AdSet, Campaign, DailyRow, Dataset } from './types';
import { toDay } from './analytics';

/** Small deterministic PRNG so the demo looks the same on every run. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Profile {
  spend: number; // per day
  cpm: number;
  ctr: number; // %
  cvr: number; // % of clicks -> purchase within 7 days of click
  aov: number;
  from: number; // first active day, days ago
  to: number; // last active day, days ago (0 = yesterday)
  fatigue?: number; // days of decline at the end
}

export function demoDataset(endMs = Date.now() - 86_400_000): Dataset {
  const campaigns: Campaign[] = [
    { id: 'c_mug', name: 'Термокружка · Продажи', status: 'ACTIVE', objective: 'OUTCOME_SALES', dailyBudget: 3000 },
    { id: 'c_brand', name: 'Бренд · охват', status: 'ACTIVE', objective: 'OUTCOME_AWARENESS', dailyBudget: 1000 },
    { id: 'c_rt', name: 'Ретаргет 30 дней', status: 'PAUSED', objective: 'OUTCOME_SALES', dailyBudget: null },
  ];
  const adsets: AdSet[] = [
    { id: 's_broad', campaignId: 'c_mug', name: 'Широкая · РФ 25–45', status: 'ACTIVE', dailyBudget: null },
    { id: 's_lal2', campaignId: 'c_mug', name: 'LAL 2% · покупатели', status: 'ACTIVE', dailyBudget: null },
    { id: 's_brand', campaignId: 'c_brand', name: 'Широкая · РФ', status: 'ACTIVE', dailyBudget: null },
    { id: 's_cart', campaignId: 'c_rt', name: 'Корзина без покупки 14 дн', status: 'PAUSED', dailyBudget: 800 },
  ];
  const ad = (
    id: string,
    adsetId: string,
    name: string,
    format: string,
    headline: string,
    extra: Partial<Ad> = {},
  ): Ad => ({
    id,
    adsetId,
    campaignId: adsets.find((a) => a.id === adsetId)!.campaignId,
    name,
    status: 'ACTIVE',
    review: 'approved',
    format,
    headline,
    thumb: null,
    ...extra,
  });
  const ads: Ad[] = [
    ad('a_review', 's_broad', 'Отзыв · Марина', '4:5', 'Горячий кофе через 6 часов'),
    ad('a_unbox', 's_broad', 'Распаковка', '9:16', 'Не протекает даже в сумке'),
    ad('a_ugc', 's_broad', 'UGC · Аватар Анна', '9:16', 'Горячий кофе через 6 часов'),
    ad('a_vs', 's_broad', 'Обычная vs наша', '4:5', 'Обычная кружка vs наша', { review: 'pending' }),
    ad('a_winter', 's_lal2', 'Зима · видео 3', '9:16', 'Горячий кофе через 6 часов'),
    ad('a_close', 's_lal2', 'Состав крупно', '4:5', 'Пищевая сталь, без запаха'),
    ad('a_sale', 's_lal2', 'Скидка −50%', '4:5', 'Только сегодня −50%', { status: 'PAUSED', review: 'rejected' }),
    ad('a_logo', 's_brand', 'Логотип · видео', '1:1', 'Кружка, которая держит тепло'),
    ad('a_ba', 's_cart', 'До / после', 'carousel', 'Вы смотрели — она ещё в наличии', { status: 'PAUSED' }),
  ];

  const profiles: Record<string, Profile> = {
    a_review: { spend: 900, cpm: 320, ctr: 2.6, cvr: 3.1, aov: 1490, from: 89, to: 0 },
    a_unbox: { spend: 800, cpm: 300, ctr: 2.2, cvr: 2.9, aov: 1490, from: 89, to: 0 },
    a_ugc: { spend: 150, cpm: 310, ctr: 2.4, cvr: 3.0, aov: 1490, from: 3, to: 0 },
    a_winter: { spend: 700, cpm: 280, ctr: 1.9, cvr: 2.6, aov: 1490, from: 60, to: 0, fatigue: 6 },
    a_close: { spend: 450, cpm: 300, ctr: 0.9, cvr: 2.6, aov: 1490, from: 45, to: 0 },
    a_logo: { spend: 1000, cpm: 150, ctr: 1.0, cvr: 0.5, aov: 1490, from: 89, to: 0 },
    a_ba: { spend: 800, cpm: 520, ctr: 3.1, cvr: 5.2, aov: 1490, from: 89, to: 20 },
  };

  const rand = rng(42);
  const rows: DailyRow[] = [];
  const count = (x: number) => Math.max(0, Math.floor(x + rand()));
  for (const [adId, p] of Object.entries(profiles)) {
    for (let ago = p.from; ago >= p.to; ago--) {
      const noise = 0.8 + rand() * 0.4;
      const spend = Math.round(p.spend * noise);
      const impressions = Math.round((spend / p.cpm) * 1000);
      let ctr = p.ctr * (0.85 + rand() * 0.3);
      if (p.fatigue && ago < p.fatigue) ctr *= 1 - 0.1 * (p.fatigue - ago);
      const clicks = count((impressions * ctr) / 100);
      const c7 = count((clicks * p.cvr) / 100);
      const c1 = Math.min(c7, count(c7 * 0.78));
      const v1 = count(c7 * 0.12);
      const val = () => Math.round(p.aov * (0.9 + rand() * 0.3));
      const sum = (n: number) => Array.from({ length: n }, val).reduce((a, b) => a + b, 0);
      const val7 = sum(c7);
      rows.push({
        date: toDay(endMs - ago * 86_400_000),
        adId,
        spend,
        impressions,
        clicks,
        c1,
        c7,
        v1,
        val1: c7 > 0 ? Math.round((val7 * c1) / c7) : 0,
        val7,
        valV1: sum(v1),
      });
    }
  }
  return { campaigns, adsets, ads, rows };
}
