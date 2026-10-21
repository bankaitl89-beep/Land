import { activeDailyBudget, findEntity, isProtected, leaderboard, overview, tree } from './analytics';
import { attributionLabel } from './format';
import type {
  ActionKind,
  ActionRecord,
  Dataset,
  Dimension,
  Metrics,
  Period,
  Settings,
  ToolTrace,
  TreeNode,
} from './types';

export interface AgentBackend {
  data(): Dataset;
  settings(): Settings;
  createAction(a: Pick<ActionRecord, 'source' | 'kind' | 'targetId' | 'targetName' | 'before' | 'after' | 'reason'>): ActionRecord;
  applyAction(id: string): Promise<ActionRecord>;
}

export interface ToolContext {
  backend: AgentBackend;
  mode: 'ask' | 'autopilot';
}

export interface ToolDef {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ToolOutcome {
  content: string;
  isError: boolean;
  trace: ToolTrace;
  actionId: string | null;
}

const periodSchema = { type: 'integer', enum: [7, 30, 90], description: 'Период в днях' };

export const TOOLS: ToolDef[] = [
  {
    name: 'get_overview',
    description:
      'Сводка кабинета за период: расход, конверсии, CPA, ROAS, CTR, сравнение с прошлым периодом и сигналы о проблемах (выгорание креативов, дорогой CPA, тишина пикселя).',
    parameters: { type: 'object', properties: { period: periodSchema }, required: ['period'], additionalProperties: false },
  },
  {
    name: 'get_leaderboard',
    description:
      'Рейтинг за период по креативам, заголовкам, группам объявлений или форматам. Строки с малым объёмом данных помечены lowData — не делай по ним выводов.',
    parameters: {
      type: 'object',
      properties: {
        period: periodSchema,
        dimension: { type: 'string', enum: ['ad', 'headline', 'adset', 'format'] },
        sort: { type: 'string', enum: ['roas', 'cpa', 'ctr'] },
      },
      required: ['period', 'dimension', 'sort'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_campaigns',
    description:
      'Дерево кампания → группа → объявление с id, статусом, дневным бюджетом, метриками за период и проблемами. Используй, чтобы найти id перед изменениями.',
    parameters: { type: 'object', properties: { period: periodSchema }, required: ['period'], additionalProperties: false },
  },
  {
    name: 'get_settings',
    description: 'Цели (CPA, ROAS), окно атрибуции, валюта, права агента и то, что пользователь просил запомнить.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'pause_entity',
    description: 'Поставить на паузу кампанию, группу или объявление. Проходит через права пользователя: может выполниться сразу или встать в очередь на подтверждение.',
    parameters: {
      type: 'object',
      properties: { id: { type: 'string' }, reason: { type: 'string', description: 'Коротко, почему' } },
      required: ['id', 'reason'],
      additionalProperties: false,
    },
  },
  {
    name: 'activate_entity',
    description: 'Включить кампанию, группу или объявление. Проходит через права пользователя.',
    parameters: {
      type: 'object',
      properties: { id: { type: 'string' }, reason: { type: 'string' } },
      required: ['id', 'reason'],
      additionalProperties: false,
    },
  },
  {
    name: 'set_daily_budget',
    description:
      'Изменить дневной бюджет кампании или группы (в валюте кабинета, целое число). Бюджет есть только там, где он задан: если у группы бюджета нет, он на уровне кампании. Ограничено правами и лимитами.',
    parameters: {
      type: 'object',
      properties: { id: { type: 'string' }, daily_budget: { type: 'number' }, reason: { type: 'string' } },
      required: ['id', 'daily_budget', 'reason'],
      additionalProperties: false,
    },
  },
];

const r0 = (x: number | null) => (x === null ? null : Math.round(x));
const r2 = (x: number | null) => (x === null ? null : Math.round(x * 100) / 100);

function compact(m: Metrics) {
  return { spend: r0(m.spend), conversions: m.conversions, cpa: r0(m.cpa), roas: r2(m.roas), ctr: r2(m.ctr) };
}

function flatten(nodes: TreeNode[], depth = 0): unknown[] {
  return nodes.flatMap((n) => [
    {
      id: n.id,
      kind: n.kind,
      name: n.name,
      status: n.status,
      daily_budget: n.dailyBudget,
      protected: n.protected || undefined,
      review: n.review,
      problem: n.problem ?? undefined,
      ...compact(n.m),
      depth,
    },
    ...flatten(n.children, depth + 1),
  ]);
}

function asPeriod(x: unknown): Period {
  return x === 7 || x === 30 || x === 90 ? x : 7;
}

const KIND_LABEL: Record<ActionKind, string> = { pause: 'Пауза', activate: 'Включение', budget: 'Бюджет' };

export async function runTool(name: string, input: Record<string, unknown>, ctx: ToolContext): Promise<ToolOutcome> {
  const data = ctx.backend.data();
  const s = ctx.backend.settings();
  const ok = (content: unknown, label: string, actionId: string | null = null): ToolOutcome => ({
    content: JSON.stringify(content),
    isError: false,
    trace: { name, label, ok: true },
    actionId,
  });
  const fail = (msg: string, label: string): ToolOutcome => ({
    content: JSON.stringify({ error: msg }),
    isError: true,
    trace: { name, label, ok: false },
    actionId: null,
  });

  switch (name) {
    case 'get_overview': {
      const p = asPeriod(input.period);
      const o = overview(data, s, p);
      return ok(
        {
          period_days: p,
          currency: s.display.currency,
          attribution: attributionLabel(s),
          goals: s.goals,
          current: compact(o.current),
          previous: compact(o.previous),
          alerts: o.alerts.map((a) => ({ kind: a.kind, title: a.title, text: a.text, target_id: a.targetId, target_kind: a.targetKind })),
          top_ads: o.top.map((t) => ({ id: t.ad.id, name: t.ad.name, ...compact(t.m) })),
        },
        `Сводка за ${p} дн.`,
      );
    }
    case 'get_leaderboard': {
      const p = asPeriod(input.period);
      const dim = (['ad', 'headline', 'adset', 'format'].includes(String(input.dimension)) ? input.dimension : 'ad') as Dimension;
      const sort = (['roas', 'cpa', 'ctr'].includes(String(input.sort)) ? input.sort : 'roas') as 'roas' | 'cpa' | 'ctr';
      const lb = leaderboard(data, s, p, dim, sort);
      return ok(
        {
          period_days: p,
          average: compact(lb.average),
          rows: lb.rows.slice(0, 15).map((r) => ({ key: r.adId ?? r.key, label: r.label, badge: r.badge, lowData: r.lowData, ...compact(r.m) })),
        },
        `Рейтинг · ${{ ad: 'креативы', headline: 'заголовки', adset: 'группы', format: 'форматы' }[dim]}`,
      );
    }
    case 'list_campaigns': {
      const p = asPeriod(input.period);
      return ok({ period_days: p, items: flatten(tree(data, s, p)) }, 'Список кампаний');
    }
    case 'get_settings':
      return ok(
        {
          goals: s.goals,
          attribution: attributionLabel(s),
          currency: s.display.currency,
          permissions: s.permissions,
          mode: ctx.mode,
          memory: s.memory,
        },
        'Настройки и права',
      );
    case 'pause_entity':
    case 'activate_entity':
    case 'set_daily_budget': {
      const kind: ActionKind = name === 'pause_entity' ? 'pause' : name === 'activate_entity' ? 'activate' : 'budget';
      const label = KIND_LABEL[kind];
      const id = String(input.id ?? '');
      const reason = String(input.reason ?? '').slice(0, 300);
      const e = findEntity(data, id);
      if (!e) return fail(`Объект ${id} не найден. Сначала вызови list_campaigns.`, label);
      const camp = data.campaigns.find((c) => c.id === e.campaignId);
      if (camp && isProtected(camp.name, s.permissions.protectedTag))
        return fail(`Кампания «${camp.name}» защищена меткой «${s.permissions.protectedTag}» — агенту менять нельзя.`, label);
      const perm = s.permissions[kind];
      if (perm === 'deny') return fail(`${label}: запрещено правами агента.`, label);

      let before: number | null = null;
      let after: number | null = null;
      if (kind === 'pause' && e.status === 'PAUSED') return ok({ result: `«${e.name}» уже на паузе.` }, label);
      if (kind === 'activate' && e.status === 'ACTIVE') return ok({ result: `«${e.name}» уже включено.` }, label);
      if (kind === 'budget') {
        if (e.dailyBudget === null)
          return fail(
            e.kind === 'adset'
              ? `У группы «${e.name}» нет своего бюджета — он задан на кампании ${e.campaignId}.`
              : `У «${e.name}» нет дневного бюджета.`,
            label,
          );
        const next = Math.round(Number(input.daily_budget));
        if (!Number.isFinite(next) || next <= 0) return fail('Бюджет должен быть положительным числом.', label);
        const change = Math.abs(next / e.dailyBudget - 1) * 100;
        if (change > s.permissions.budgetMaxPct + 0.01)
          return fail(
            `Изменение ${Math.round(change)}% больше лимита ±${s.permissions.budgetMaxPct}% за раз. Предложи шаг в пределах лимита.`,
            label,
          );
        const total = activeDailyBudget(data) - e.dailyBudget + next;
        if (total > s.permissions.dailyCap)
          return fail(`Суммарный дневной бюджет станет ${total} — выше потолка ${s.permissions.dailyCap}.`, label);
        before = e.dailyBudget;
        after = next;
      }
      if (kind === 'activate' && e.dailyBudget !== null) {
        const total = activeDailyBudget(data) + e.dailyBudget;
        if (total > s.permissions.dailyCap)
          return fail(`После включения дневной бюджет станет ${total} — выше потолка ${s.permissions.dailyCap}.`, label);
      }

      const action = ctx.backend.createAction({ source: 'agent', kind, targetId: id, targetName: e.name, before, after, reason });
      if (ctx.mode === 'autopilot' && perm === 'auto') {
        const done = await ctx.backend.applyAction(action.id);
        return done.status === 'applied'
          ? ok({ result: `Выполнено: ${label.toLowerCase()} «${e.name}».`, action_id: done.id }, label, done.id)
          : fail(`Meta вернула ошибку: ${done.result}`, label);
      }
      return ok(
        { result: `Создано предложение #${action.id}. Ждёт подтверждения пользователя — ничего не изменено.`, action_id: action.id },
        label,
        action.id,
      );
    }
    default:
      return fail(`Неизвестный инструмент ${name}`, name);
  }
}

export function systemPrompt(s: Settings, mode: 'ask' | 'autopilot', today: string): string {
  return [
    'Ты — агент личного кабинета Meta Ads (Facebook и Instagram). Отвечай по-русски, коротко и по делу.',
    'Все цифры бери только из инструментов, не придумывай. Если данных мало (lowData), так и скажи и не делай выводов.',
    `Валюта кабинета: ${s.display.currency}. Окно атрибуции отчётов: ${attributionLabel(s)}. Цели: CPA ${s.goals.cpa}, ROAS ${s.goals.roas}.`,
    mode === 'ask'
      ? 'Режим «Спрашивать»: любые изменения создают предложения, пользователь подтверждает их сам. Не говори, что что-то уже изменено.'
      : 'Режим «Автопилот»: действия с правом «сам» выполняются сразу, остальные встают в очередь на подтверждение. Сообщай, что выполнено, а что ждёт.',
    'Перед изменением найди id через list_campaigns. Бюджет меняй только там, где он задан, и в пределах лимита. Если инструмент вернул ошибку прав — объясни и не обходи её.',
    s.memory.length ? `Пользователь просил помнить: ${s.memory.join('; ')}.` : '',
    `Сегодня ${today}.`,
  ]
    .filter(Boolean)
    .join('\n');
}
