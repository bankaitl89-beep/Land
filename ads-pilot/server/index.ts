import { Hono } from 'hono';
import { basicAuth } from 'hono/basic-auth';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { existsSync } from 'node:fs';
import { Store, type ProviderKey } from './store';
import { MetaClient } from './meta';
import { agentTurn, listProviderModels, providerStatus } from './agent';
import { demoDataset } from '../shared/demo';
import { compareWindows, findEntity, leaderboard, overview, tree } from '../shared/analytics';
import type { AgentBackend } from '../shared/agentTools';
import type { AppStatus, Dimension, ModelChoice, Period, Settings, Status } from '../shared/types';

const store = new Store(process.env.DB_FILE ?? 'data/ads-pilot.db');
const meta =
  process.env.META_ACCESS_TOKEN && process.env.META_AD_ACCOUNT_ID
    ? new MetaClient(process.env.META_ACCESS_TOKEN, process.env.META_AD_ACCOUNT_ID, process.env.META_API_VERSION)
    : null;
const mode: AppStatus['mode'] = meta ? 'live' : 'demo';

if (!meta && store.isEmpty()) store.writeDataset(demoDataset(), true);

async function sync() {
  if (!meta) return;
  const info = await meta.accountInfo();
  store.set('account', info);
  const s = store.settings();
  if (s.display.currency !== info.currency && s.display.rate === 1) {
    store.saveSettings({ ...s, display: { ...s.display, currency: info.currency } });
  }
  const d = await meta.fetchDataset(info.currency, s.event);
  store.writeDataset(d, true);
  store.set('lastSync', new Date().toISOString());
}

async function applyAction(id: string) {
  const a = store.action(id);
  if (!a) throw new Error('Действие не найдено');
  if (a.status !== 'pending') return a;
  try {
    if (a.kind === 'budget') {
      if (a.after === null) throw new Error('Нет нового бюджета');
      if (meta) await meta.setDailyBudget(a.targetId, a.after, store.get('account', { currency: 'RUB' }).currency);
      store.setBudget(a.targetId, a.after);
    } else {
      const status: Status = a.kind === 'pause' ? 'PAUSED' : 'ACTIVE';
      if (meta) await meta.setStatus(a.targetId, status);
      store.setStatus(a.targetId, status);
    }
    store.finishAction(id, 'applied', meta ? 'Применено в Meta' : 'Применено (демо)');
  } catch (e) {
    store.finishAction(id, 'failed', e instanceof Error ? e.message : String(e));
  }
  return store.action(id)!;
}

const backend: AgentBackend = {
  data: () => store.dataset(),
  settings: () => store.settings(),
  createAction: (a) => store.createAction(a),
  applyAction,
};

const period = (v: string | undefined): Period => (v === '30' ? 30 : v === '90' ? 90 : 7);
const mask = (k: string) => (k ? `${k.slice(0, 6)}••••${k.slice(-4)}` : '');

const app = new Hono();

if (process.env.APP_PASSWORD) {
  app.use('*', basicAuth({ username: process.env.APP_USER ?? 'admin', password: process.env.APP_PASSWORD }));
}

app.onError((err, c) => c.json({ error: err.message }, 500));

app.get('/api/status', (c) => {
  const s = store.settings();
  const status: AppStatus = {
    mode,
    account: store.get('account', { name: mode === 'demo' ? 'Демо-кабинет' : 'Кабинет', currency: 'RUB', timezone: 'Europe/Moscow' }),
    lastSync: store.get<string | null>('lastSync', null),
    providers: providerStatus(store, s),
    keys: {
      anthropic: mask(store.key('anthropic')),
      openai: mask(store.key('openai')),
      deepseek: mask(store.key('deepseek')),
      xai: mask(store.key('xai')),
      local: s.providers.ollamaUrl,
    },
  };
  return c.json(status);
});

app.get('/api/overview', (c) => c.json(overview(store.dataset(), store.settings(), period(c.req.query('period')))));

app.get('/api/leaderboard', (c) => {
  const dim = (c.req.query('dim') ?? 'ad') as Dimension;
  const sort = (c.req.query('sort') ?? 'roas') as 'roas' | 'cpa' | 'ctr';
  return c.json(leaderboard(store.dataset(), store.settings(), period(c.req.query('period')), dim, sort));
});

app.get('/api/windows', (c) => c.json(compareWindows(store.dataset(), store.settings(), period(c.req.query('period')))));

app.get('/api/campaigns', (c) => c.json(tree(store.dataset(), store.settings(), period(c.req.query('period')))));

// Direct changes by the user: logged like agent actions, applied immediately.
app.post('/api/entities/:id/status', async (c) => {
  const id = c.req.param('id');
  const { status } = (await c.req.json()) as { status: Status };
  const e = findEntity(store.dataset(), id);
  if (!e) return c.json({ error: 'Не найдено' }, 404);
  const a = store.createAction({ source: 'user', kind: status === 'PAUSED' ? 'pause' : 'activate', targetId: id, targetName: e.name, before: null, after: null, reason: 'Вручную' });
  return c.json(await applyAction(a.id));
});

app.post('/api/entities/:id/budget', async (c) => {
  const id = c.req.param('id');
  const { dailyBudget } = (await c.req.json()) as { dailyBudget: number };
  const e = findEntity(store.dataset(), id);
  if (!e || e.dailyBudget === null) return c.json({ error: 'У объекта нет дневного бюджета' }, 400);
  if (!(dailyBudget > 0)) return c.json({ error: 'Бюджет должен быть больше нуля' }, 400);
  const a = store.createAction({ source: 'user', kind: 'budget', targetId: id, targetName: e.name, before: e.dailyBudget, after: Math.round(dailyBudget), reason: 'Вручную' });
  return c.json(await applyAction(a.id));
});

app.get('/api/actions', (c) => c.json(store.actions(100)));
app.post('/api/actions/:id/approve', async (c) => c.json(await applyAction(c.req.param('id'))));
app.post('/api/actions/:id/reject', (c) => {
  const id = c.req.param('id');
  const a = store.action(id);
  if (a?.status === 'pending') store.finishAction(id, 'rejected', 'Отклонено пользователем');
  return c.json(store.action(id));
});

app.get('/api/settings', (c) => c.json(store.settings()));
app.put('/api/settings', async (c) => {
  const next = (await c.req.json()) as Settings;
  store.saveSettings(next);
  return c.json(store.settings());
});

app.put('/api/keys/:provider', async (c) => {
  const p = c.req.param('provider') as ProviderKey;
  if (!['anthropic', 'openai', 'deepseek', 'xai'].includes(p)) return c.json({ error: 'Неизвестный провайдер' }, 400);
  const { key } = (await c.req.json()) as { key: string };
  store.setKey(p, key.trim());
  return c.json({ ok: true });
});

app.get('/api/models/:provider', async (c) => {
  const p = c.req.param('provider') as 'openai' | 'deepseek' | 'xai' | 'local';
  try {
    return c.json(await listProviderModels(p, store, store.settings()));
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : String(e) }, 400);
  }
});

app.get('/api/ai-spend', (c) => c.json(store.aiSpend()));

app.get('/api/chats', (c) => c.json(store.chats()));
app.post('/api/chats', (c) => c.json(store.createChat('Новый чат')));
app.get('/api/chats/:id', (c) => {
  const chat = store.chat(c.req.param('id'));
  return chat ? c.json(chat) : c.json({ error: 'Не найдено' }, 404);
});
app.delete('/api/chats/:id', (c) => {
  store.deleteChat(c.req.param('id'));
  return c.json({ ok: true });
});

app.post('/api/chats/:id/messages', async (c) => {
  const id = c.req.param('id');
  const chat = store.chat(id);
  if (!chat) return c.json({ error: 'Чат не найден' }, 404);
  const body = (await c.req.json()) as { text: string; model: ModelChoice; mode: 'ask' | 'autopilot' };
  const text = String(body.text ?? '').trim();
  if (!text) return c.json({ error: 'Пустое сообщение' }, 400);

  store.addMessage(id, { role: 'user', text, model: null, tools: [], actionIds: [], costUsd: null });
  if (chat.messages.length === 0) store.renameChat(id, text.length > 40 ? text.slice(0, 40) + '…' : text);
  try {
    const turn = await agentTurn({
      store,
      ctx: { backend, mode: body.mode === 'autopilot' ? 'autopilot' : 'ask' },
      history: chat.messages,
      text,
      choice: body.model ?? 'auto',
    });
    store.addMessage(id, { role: 'assistant', text: turn.text, model: turn.model, tools: turn.tools, actionIds: turn.actionIds, costUsd: turn.costUsd });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    store.addMessage(id, { role: 'assistant', text: `Ошибка модели: ${msg}`, model: null, tools: [], actionIds: [], costUsd: null });
  }
  return c.json(store.chat(id));
});

app.post('/api/sync', async (c) => {
  if (!meta) return c.json({ error: 'Демо-режим: задайте META_ACCESS_TOKEN и META_AD_ACCOUNT_ID в .env' }, 400);
  await sync();
  return c.json({ ok: true, lastSync: store.get('lastSync', null) });
});

// Production: serve the built web app from the same port.
if (existsSync('dist/web/index.html')) {
  app.use('/*', serveStatic({ root: 'dist/web' }));
}

const port = Number(process.env.PORT ?? 8787);
const hostname = process.env.HOST ?? '127.0.0.1';
serve({ fetch: app.fetch, port, hostname }, () => {
  console.log(`Ads Pilot: http://${hostname}:${port}  (${mode === 'demo' ? 'демо-данные' : 'Meta API'})`);
});

if (meta) {
  sync().catch((e) => console.error('Первая синхронизация не удалась:', e.message));
  setInterval(() => sync().catch((e) => console.error('Синхронизация:', e.message)), 60 * 60 * 1000);
}
