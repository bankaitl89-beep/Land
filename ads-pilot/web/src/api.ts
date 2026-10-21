import { compareWindows, findEntity, leaderboard, overview, tree } from '../../shared/analytics';
import { demoDataset } from '../../shared/demo';
import { demoAgentTurn } from '../../shared/demoAgent';
import type { AgentBackend } from '../../shared/agentTools';
import {
  DEFAULT_SETTINGS,
  type ActionRecord,
  type AppStatus,
  type Chat,
  type Dataset,
  type Dimension,
  type Leaderboard,
  type Metrics,
  type ModelChoice,
  type Overview,
  type Period,
  type Settings,
  type Status,
  type TreeNode,
} from '../../shared/types';

export type Provider = 'anthropic' | 'openai' | 'deepseek' | 'xai';
export type Sort = 'roas' | 'cpa' | 'ctr';

export interface Api {
  status(): Promise<AppStatus>;
  overview(p: Period): Promise<Overview>;
  leaderboard(p: Period, dim: Dimension, sort: Sort): Promise<Leaderboard>;
  campaigns(p: Period): Promise<TreeNode[]>;
  windows(p: Period): Promise<{ label: string; click: 1 | 7; view: 0 | 1; m: Metrics }[]>;
  setStatus(id: string, status: Status): Promise<ActionRecord>;
  setBudget(id: string, dailyBudget: number): Promise<ActionRecord>;
  actions(): Promise<ActionRecord[]>;
  approve(id: string): Promise<ActionRecord>;
  reject(id: string): Promise<ActionRecord>;
  settings(): Promise<Settings>;
  saveSettings(s: Settings): Promise<Settings>;
  setKey(p: Provider, key: string): Promise<void>;
  models(p: Provider | 'local'): Promise<string[]>;
  aiSpend(): Promise<{ model: string; usd: number; messages: number }[]>;
  chats(): Promise<Omit<Chat, 'messages'>[]>;
  createChat(): Promise<Chat>;
  chat(id: string): Promise<Chat>;
  deleteChat(id: string): Promise<void>;
  send(id: string, text: string, model: ModelChoice, mode: 'ask' | 'autopilot'): Promise<Chat>;
  sync(): Promise<void>;
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`./api${path}`, {
    ...init,
    headers: init?.body ? { 'content-type': 'application/json' } : undefined,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
  return body as T;
}

const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

const httpApi: Api = {
  status: () => http('/status'),
  overview: (p) => http(`/overview?period=${p}`),
  leaderboard: (p, dim, sort) => http(`/leaderboard?period=${p}&dim=${dim}&sort=${sort}`),
  campaigns: (p) => http(`/campaigns?period=${p}`),
  windows: (p) => http(`/windows?period=${p}`),
  setStatus: (id, status) => http(`/entities/${id}/status`, json('POST', { status })),
  setBudget: (id, dailyBudget) => http(`/entities/${id}/budget`, json('POST', { dailyBudget })),
  actions: () => http('/actions'),
  approve: (id) => http(`/actions/${id}/approve`, { method: 'POST' }),
  reject: (id) => http(`/actions/${id}/reject`, { method: 'POST' }),
  settings: () => http('/settings'),
  saveSettings: (s) => http('/settings', json('PUT', s)),
  setKey: async (p, key) => {
    await http(`/keys/${p}`, json('PUT', { key }));
  },
  models: (p) => http(`/models/${p}`),
  aiSpend: () => http('/ai-spend'),
  chats: () => http('/chats'),
  createChat: () => http('/chats', { method: 'POST' }),
  chat: (id) => http(`/chats/${id}`),
  deleteChat: async (id) => {
    await http(`/chats/${id}`, { method: 'DELETE' });
  },
  send: (id, text, model, mode) => http(`/chats/${id}/messages`, json('POST', { text, model, mode })),
  sync: async () => {
    await http('/sync', { method: 'POST' });
  },
};

/** Everything in the browser on demo data — used for the static preview. */
function localApi(): Api {
  const data: Dataset = demoDataset();
  let settings: Settings = structuredClone(DEFAULT_SETTINGS);
  const actions: ActionRecord[] = [];
  const chats: Chat[] = [];
  let seq = 0;
  const now = () => new Date().toISOString();
  const uid = () => Math.random().toString(36).slice(2, 10);

  const apply = async (id: string): Promise<ActionRecord> => {
    const a = actions.find((x) => x.id === id);
    if (!a) throw new Error('Действие не найдено');
    if (a.status !== 'pending') return a;
    if (a.kind === 'budget' && a.after !== null) {
      for (const list of [data.campaigns, data.adsets]) for (const x of list) if (x.id === a.targetId) x.dailyBudget = a.after;
    } else {
      const st: Status = a.kind === 'pause' ? 'PAUSED' : 'ACTIVE';
      for (const list of [data.campaigns, data.adsets, data.ads]) for (const x of list) if (x.id === a.targetId) x.status = st;
    }
    a.status = 'applied';
    a.result = 'Применено (превью)';
    return a;
  };

  const backend: AgentBackend = {
    data: () => data,
    settings: () => settings,
    createAction: (x) => {
      const a: ActionRecord = { ...x, id: String(++seq), createdAt: now(), status: 'pending', result: '' };
      actions.unshift(a);
      return a;
    },
    applyAction: apply,
  };

  const userAction = (kind: ActionRecord['kind'], id: string, before: number | null, after: number | null) => {
    const e = findEntity(data, id);
    if (!e) throw new Error('Не найдено');
    return apply(backend.createAction({ source: 'user', kind, targetId: id, targetName: e.name, before, after, reason: 'Вручную' }).id);
  };

  const ok = <T>(v: T) => Promise.resolve(structuredClone(v));

  return {
    status: () =>
      ok({
        mode: 'static',
        account: { name: 'Демо-кабинет', currency: 'RUB', timezone: 'Europe/Moscow' },
        lastSync: null,
        providers: { anthropic: false, openai: false, deepseek: false, xai: false, local: false },
        keys: { anthropic: '', openai: '', deepseek: '', xai: '', local: settings.providers.ollamaUrl },
      } satisfies AppStatus),
    overview: (p) => ok(overview(data, settings, p)),
    leaderboard: (p, dim, sort) => ok(leaderboard(data, settings, p, dim, sort)),
    campaigns: (p) => ok(tree(data, settings, p)),
    windows: (p) => ok(compareWindows(data, settings, p)),
    setStatus: (id, status) => userAction(status === 'PAUSED' ? 'pause' : 'activate', id, null, null).then(ok),
    setBudget: (id, b) => userAction('budget', id, findEntity(data, id)?.dailyBudget ?? null, Math.round(b)).then(ok),
    actions: () => ok(actions),
    approve: (id) => apply(id).then(ok),
    reject: async (id) => {
      const a = actions.find((x) => x.id === id);
      if (a && a.status === 'pending') {
        a.status = 'rejected';
        a.result = 'Отклонено пользователем';
      }
      return ok(a!);
    },
    settings: () => ok(settings),
    saveSettings: async (s) => {
      settings = structuredClone(s);
      return ok(settings);
    },
    setKey: () => Promise.reject(new Error('В превью ключи не сохраняются — запустите приложение у себя.')),
    models: () => Promise.reject(new Error('В превью список моделей недоступен.')),
    aiSpend: () => ok([]),
    chats: () => ok(chats.map(({ messages: _m, ...c }) => c)),
    createChat: async () => {
      const c: Chat = { id: uid(), title: 'Новый чат', createdAt: now(), messages: [] };
      chats.unshift(c);
      return ok(c);
    },
    chat: async (id) => {
      const c = chats.find((x) => x.id === id);
      if (!c) throw new Error('Чат не найден');
      return ok(c);
    },
    deleteChat: async (id) => {
      const i = chats.findIndex((x) => x.id === id);
      if (i >= 0) chats.splice(i, 1);
    },
    send: async (id, text, _model, mode) => {
      const c = chats.find((x) => x.id === id);
      if (!c) throw new Error('Чат не найден');
      if (c.messages.length === 0) c.title = text.length > 40 ? text.slice(0, 40) + '…' : text;
      c.messages.push({ id: uid(), role: 'user', text, model: null, tools: [], actionIds: [], costUsd: null, createdAt: now() });
      await new Promise((r) => setTimeout(r, 500));
      const t = await demoAgentTurn(text, { backend, mode });
      c.messages.push({ id: uid(), role: 'assistant', text: t.text, model: t.model, tools: t.tools, actionIds: t.actionIds, costUsd: t.costUsd, createdAt: now() });
      return ok(c);
    },
    sync: () => Promise.reject(new Error('В превью нет подключения к Meta.')),
  };
}

export const api: Api = import.meta.env.VITE_STATIC === '1' ? localApi() : httpApi;
