import type { Settings } from './types';

const SYMBOL: Record<string, string> = { RUB: '₽', USD: '$', EUR: '€', KZT: '₸', UAH: '₴', GBP: '£' };

export function currencySymbol(code: string): string {
  return SYMBOL[code] ?? code;
}

/** Money in the display currency (account amount × rate). */
export function money(x: number | null | undefined, s: Pick<Settings, 'display'>, digits = 0): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return '—';
  const v = x * (s.display.rate || 1);
  return `${v.toLocaleString('ru-RU', { maximumFractionDigits: digits, minimumFractionDigits: digits })} ${currencySymbol(
    s.display.currency,
  )}`;
}

export function num(x: number | null | undefined, digits = 0): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return '—';
  return x.toLocaleString('ru-RU', { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

export function pct(x: number | null | undefined, digits = 1): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return '—';
  return `${num(x, digits)}%`;
}

/** Relative change in %, or null when there is no base. */
export function delta(cur: number | null, prev: number | null): number | null {
  if (cur === null || prev === null || prev === 0) return null;
  return (cur / prev - 1) * 100;
}

export function attributionLabel(s: Pick<Settings, 'attribution'>): string {
  const click = s.attribution.click === 1 ? '1 день клик' : '7 дней клик';
  return s.attribution.view ? `${click} + 1 день просмотр` : click;
}
