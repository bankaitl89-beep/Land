import { overview, leaderboard, findEntity } from './analytics';
import { runTool, type ToolContext } from './agentTools';
import { money, pct, num } from './format';
import type { ToolTrace } from './types';

export interface TurnResult {
  text: string;
  tools: ToolTrace[];
  actionIds: string[];
  model: string;
  costUsd: number | null;
}

/**
 * Rule-based agent used when no model key is configured (and in the static preview).
 * It calls the same tools as the real agent, so permissions and the confirm queue behave the same.
 */
export async function demoAgentTurn(text: string, ctx: ToolContext): Promise<TurnResult> {
  const q = text.toLowerCase();
  const tools: ToolTrace[] = [];
  const actionIds: string[] = [];
  const s = ctx.backend.settings();
  const call = async (name: string, input: Record<string, unknown>) => {
    const out = await runTool(name, input, ctx);
    tools.push(out.trace);
    if (out.actionId) actionIds.push(out.actionId);
    return out;
  };
  const done = (body: string): TurnResult => ({
    text: body + '\n\n_Демо-режим: ответ собран по правилам без языковой модели. Добавьте ключ в «Модели», чтобы говорить с настоящим агентом._',
    tools,
    actionIds,
    model: 'demo',
    costUsd: null,
  });

  if (/лучш|топ|рейтинг|лидер|масштаб/.test(q)) {
    await call('get_leaderboard', { period: 30, dimension: 'ad', sort: 'roas' });
    const lb = leaderboard(ctx.backend.data(), s, 30, 'ad');
    const top = lb.rows.filter((r) => !r.lowData).slice(0, 3);
    const lines = top.map((r, i) => `${i + 1}. **${r.label}** — ROAS ${num(r.m.roas, 1)}, CPA ${money(r.m.cpa, s)}`);
    return done(`Лучшие креативы за 30 дней:\n${lines.join('\n')}\n\nСредний ROAS по кабинету — ${num(lb.average.roas, 1)}.`);
  }

  const pauseMatch = q.match(/(?:пауз\w*|выключ\w*|останов\w*)\s+(.+)/);
  if (pauseMatch) {
    const name = pauseMatch[1].replace(/[«»"]/g, '').trim();
    const data = ctx.backend.data();
    const hit = [...data.ads, ...data.adsets, ...data.campaigns].find((e) => e.name.toLowerCase().includes(name));
    if (!hit) return done(`Не нашёл «${name}». Назовите объявление, группу или кампанию точнее.`);
    const out = await call('pause_entity', { id: hit.id, reason: 'Попросил пользователь' });
    const r = JSON.parse(out.content);
    return done(r.error ?? r.result);
  }

  // Default: explain the week and propose fixes.
  await call('get_overview', { period: 7 });
  const o = overview(ctx.backend.data(), s, 7);
  const cpaDelta = o.current.cpa !== null && o.previous.cpa !== null ? (o.current.cpa / o.previous.cpa - 1) * 100 : null;
  const parts = [
    `За 7 дней: расход ${money(o.current.spend, s)}, конверсий ${o.current.conversions}, CPA ${money(o.current.cpa, s)}` +
      (cpaDelta !== null ? ` (${cpaDelta >= 0 ? '+' : ''}${pct(cpaDelta, 0)} к прошлой неделе)` : '') +
      `, ROAS ${num(o.current.roas, 2)}.`,
  ];
  if (o.alerts.length === 0) {
    parts.push('Проблем не вижу — всё в пределах целей.');
    return done(parts.join('\n\n'));
  }
  parts.push('Что не так:');
  const fixes: string[] = [];
  for (const a of o.alerts) {
    parts.push(`- **${a.title}** — ${a.text}`);
    if (a.kind === 'fatigue' && a.targetId) {
      const out = await call('pause_entity', { id: a.targetId, reason: 'Выгорание: CTR упал' });
      const r = JSON.parse(out.content);
      fixes.push(`Пауза «${a.title}». ${r.result ?? r.error}`);
    }
    if (a.kind === 'cpa' && a.targetId) {
      const e = findEntity(ctx.backend.data(), a.targetId);
      const data = ctx.backend.data();
      const camp = e ? data.campaigns.find((c) => c.id === e.campaignId) : undefined;
      if (e?.dailyBudget) {
        const next = Math.round(e.dailyBudget * (1 - s.permissions.budgetMaxPct / 100));
        const out = await call('set_daily_budget', { id: a.targetId, daily_budget: next, reason: 'CPA выше цели' });
        const r = JSON.parse(out.content);
        fixes.push(`Бюджет «${e.name}»: ${money(e.dailyBudget, s)} → ${money(next, s)}. ${r.result ?? r.error}`);
      } else if (camp) {
        fixes.push(
          `Бюджет «${e?.name}» задан на кампании «${camp.name}», поэтому урезать его точечно нельзя. Варианты: поставить группу на паузу или перенести её в отдельную кампанию.`,
        );
      }
    }
  }
  if (fixes.length) parts.push('Предлагаю:\n' + fixes.map((f) => `- ${f}`).join('\n'));
  return done(parts.join('\n\n'));
}
