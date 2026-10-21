import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  DEFAULT_SETTINGS,
  type ActionRecord,
  type Chat,
  type ChatMessage,
  type Dataset,
  type Settings,
  type Status,
} from '../shared/types';

export type ProviderKey = 'anthropic' | 'openai' | 'deepseek' | 'xai';

const ENV_KEY: Record<ProviderKey, string> = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  deepseek: 'DEEPSEEK_API_KEY',
  xai: 'XAI_API_KEY',
};

const SCHEMA = `
CREATE TABLE IF NOT EXISTS campaigns (id TEXT PRIMARY KEY, name TEXT, status TEXT, objective TEXT, daily_budget REAL);
CREATE TABLE IF NOT EXISTS adsets (id TEXT PRIMARY KEY, campaign_id TEXT, name TEXT, status TEXT, daily_budget REAL);
CREATE TABLE IF NOT EXISTS ads (id TEXT PRIMARY KEY, adset_id TEXT, campaign_id TEXT, name TEXT, status TEXT, review TEXT, format TEXT, headline TEXT, thumb TEXT);
CREATE TABLE IF NOT EXISTS daily (date TEXT, ad_id TEXT, spend REAL, impressions INTEGER, clicks INTEGER, c1 REAL, c7 REAL, v1 REAL, val1 REAL, val7 REAL, valv1 REAL, PRIMARY KEY (date, ad_id));
CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS actions (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT, source TEXT, kind TEXT, target_id TEXT, target_name TEXT, before REAL, after REAL, reason TEXT, status TEXT, result TEXT);
CREATE TABLE IF NOT EXISTS chats (id TEXT PRIMARY KEY, title TEXT, created_at TEXT);
CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, chat_id TEXT, role TEXT, text TEXT, model TEXT, tools TEXT, action_ids TEXT, cost REAL, created_at TEXT);
`;

type Row = Record<string, unknown>;

export class Store {
  private db: DatabaseSync;
  private cache: Dataset | null = null;

  constructor(file: string) {
    mkdirSync(dirname(file), { recursive: true });
    this.db = new DatabaseSync(file);
    this.db.exec(SCHEMA);
  }

  // ---------- dataset ----------

  isEmpty(): boolean {
    const r = this.db.prepare('SELECT COUNT(*) AS n FROM campaigns').get() as Row;
    return Number(r.n) === 0;
  }

  dataset(): Dataset {
    if (this.cache) return this.cache;
    const campaigns = (this.db.prepare('SELECT * FROM campaigns ORDER BY rowid').all() as Row[]).map((r) => ({
      id: String(r.id),
      name: String(r.name),
      status: r.status as Status,
      objective: String(r.objective ?? ''),
      dailyBudget: r.daily_budget === null ? null : Number(r.daily_budget),
    }));
    const adsets = (this.db.prepare('SELECT * FROM adsets ORDER BY rowid').all() as Row[]).map((r) => ({
      id: String(r.id),
      campaignId: String(r.campaign_id),
      name: String(r.name),
      status: r.status as Status,
      dailyBudget: r.daily_budget === null ? null : Number(r.daily_budget),
    }));
    const ads = (this.db.prepare('SELECT * FROM ads ORDER BY rowid').all() as Row[]).map((r) => ({
      id: String(r.id),
      adsetId: String(r.adset_id),
      campaignId: String(r.campaign_id),
      name: String(r.name),
      status: r.status as Status,
      review: r.review as 'approved' | 'pending' | 'rejected',
      format: String(r.format ?? ''),
      headline: String(r.headline ?? ''),
      thumb: r.thumb ? String(r.thumb) : null,
    }));
    const rows = (this.db.prepare('SELECT * FROM daily').all() as Row[]).map((r) => ({
      date: String(r.date),
      adId: String(r.ad_id),
      spend: Number(r.spend),
      impressions: Number(r.impressions),
      clicks: Number(r.clicks),
      c1: Number(r.c1),
      c7: Number(r.c7),
      v1: Number(r.v1),
      val1: Number(r.val1),
      val7: Number(r.val7),
      valV1: Number(r.valv1),
    }));
    this.cache = { campaigns, adsets, ads, rows };
    return this.cache;
  }

  /** Replace structure (campaigns, ad sets, ads) and upsert daily rows. */
  writeDataset(d: Dataset, replaceRows: boolean) {
    this.db.exec('BEGIN');
    try {
      this.db.exec('DELETE FROM campaigns; DELETE FROM adsets; DELETE FROM ads;');
      if (replaceRows) this.db.exec('DELETE FROM daily;');
      const c = this.db.prepare('INSERT INTO campaigns VALUES (?, ?, ?, ?, ?)');
      for (const x of d.campaigns) c.run(x.id, x.name, x.status, x.objective, x.dailyBudget);
      const s = this.db.prepare('INSERT INTO adsets VALUES (?, ?, ?, ?, ?)');
      for (const x of d.adsets) s.run(x.id, x.campaignId, x.name, x.status, x.dailyBudget);
      const a = this.db.prepare('INSERT INTO ads VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      for (const x of d.ads) a.run(x.id, x.adsetId, x.campaignId, x.name, x.status, x.review, x.format, x.headline, x.thumb);
      const r = this.db.prepare('INSERT OR REPLACE INTO daily VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      for (const x of d.rows) r.run(x.date, x.adId, x.spend, x.impressions, x.clicks, x.c1, x.c7, x.v1, x.val1, x.val7, x.valV1);
      this.db.exec('COMMIT');
    } catch (e) {
      this.db.exec('ROLLBACK');
      throw e;
    }
    this.cache = null;
  }

  setStatus(id: string, status: Status) {
    for (const t of ['campaigns', 'adsets', 'ads']) this.db.prepare(`UPDATE ${t} SET status = ? WHERE id = ?`).run(status, id);
    this.cache = null;
  }

  setBudget(id: string, budget: number) {
    for (const t of ['campaigns', 'adsets']) this.db.prepare(`UPDATE ${t} SET daily_budget = ? WHERE id = ?`).run(budget, id);
    this.cache = null;
  }

  // ---------- key/value ----------

  get<T>(key: string, fallback: T): T {
    const r = this.db.prepare('SELECT value FROM kv WHERE key = ?').get(key) as Row | undefined;
    if (!r) return fallback;
    try {
      return JSON.parse(String(r.value)) as T;
    } catch {
      return fallback;
    }
  }

  set(key: string, value: unknown) {
    this.db.prepare('INSERT OR REPLACE INTO kv VALUES (?, ?)').run(key, JSON.stringify(value));
  }

  settings(): Settings {
    const saved = this.get<Partial<Settings>>('settings', {});
    const d = DEFAULT_SETTINGS;
    return {
      ...d,
      ...saved,
      attribution: { ...d.attribution, ...saved.attribution },
      display: { ...d.display, ...saved.display },
      goals: { ...d.goals, ...saved.goals },
      thresholds: { ...d.thresholds, ...saved.thresholds },
      agent: { ...d.agent, ...saved.agent },
      providers: { ...d.providers, ...saved.providers },
      permissions: { ...d.permissions, ...saved.permissions },
      memory: saved.memory ?? d.memory,
    };
  }

  saveSettings(next: Settings) {
    this.set('settings', next);
  }

  /** Key saved in the UI wins over the environment variable. */
  key(p: ProviderKey): string {
    const saved = this.get<Record<string, string>>('keys', {});
    return saved[p] || process.env[ENV_KEY[p]] || '';
  }

  setKey(p: ProviderKey, value: string) {
    const saved = this.get<Record<string, string>>('keys', {});
    if (value) saved[p] = value;
    else delete saved[p];
    this.set('keys', saved);
  }

  // ---------- actions ----------

  private toAction(r: Row): ActionRecord {
    return {
      id: String(r.id),
      createdAt: String(r.created_at),
      source: r.source as ActionRecord['source'],
      kind: r.kind as ActionRecord['kind'],
      targetId: String(r.target_id),
      targetName: String(r.target_name),
      before: r.before === null ? null : Number(r.before),
      after: r.after === null ? null : Number(r.after),
      reason: String(r.reason ?? ''),
      status: r.status as ActionRecord['status'],
      result: String(r.result ?? ''),
    };
  }

  createAction(a: Pick<ActionRecord, 'source' | 'kind' | 'targetId' | 'targetName' | 'before' | 'after' | 'reason'>): ActionRecord {
    const res = this.db
      .prepare('INSERT INTO actions (created_at, source, kind, target_id, target_name, before, after, reason, status, result) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(new Date().toISOString(), a.source, a.kind, a.targetId, a.targetName, a.before, a.after, a.reason, 'pending', '');
    return this.action(String(res.lastInsertRowid))!;
  }

  action(id: string): ActionRecord | null {
    const r = this.db.prepare('SELECT * FROM actions WHERE id = ?').get(Number(id)) as Row | undefined;
    return r ? this.toAction(r) : null;
  }

  actions(limit = 50): ActionRecord[] {
    return (this.db.prepare('SELECT * FROM actions ORDER BY id DESC LIMIT ?').all(limit) as Row[]).map((r) => this.toAction(r));
  }

  finishAction(id: string, status: ActionRecord['status'], result: string) {
    this.db.prepare('UPDATE actions SET status = ?, result = ? WHERE id = ?').run(status, result, Number(id));
  }

  // ---------- chats ----------

  chats(): Omit<Chat, 'messages'>[] {
    return (this.db.prepare('SELECT * FROM chats ORDER BY created_at DESC').all() as Row[]).map((r) => ({
      id: String(r.id),
      title: String(r.title),
      createdAt: String(r.created_at),
    }));
  }

  chat(id: string): Chat | null {
    const c = this.db.prepare('SELECT * FROM chats WHERE id = ?').get(id) as Row | undefined;
    if (!c) return null;
    const messages = (this.db.prepare('SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at, rowid').all(id) as Row[]).map(
      (r): ChatMessage => ({
        id: String(r.id),
        role: r.role as ChatMessage['role'],
        text: String(r.text),
        model: r.model ? String(r.model) : null,
        tools: JSON.parse(String(r.tools ?? '[]')),
        actionIds: JSON.parse(String(r.action_ids ?? '[]')),
        costUsd: r.cost === null ? null : Number(r.cost),
        createdAt: String(r.created_at),
      }),
    );
    return { id: String(c.id), title: String(c.title), createdAt: String(c.created_at), messages };
  }

  createChat(title: string): Chat {
    const id = randomUUID();
    this.db.prepare('INSERT INTO chats VALUES (?, ?, ?)').run(id, title, new Date().toISOString());
    return this.chat(id)!;
  }

  renameChat(id: string, title: string) {
    this.db.prepare('UPDATE chats SET title = ? WHERE id = ?').run(title, id);
  }

  deleteChat(id: string) {
    this.db.prepare('DELETE FROM messages WHERE chat_id = ?').run(id);
    this.db.prepare('DELETE FROM chats WHERE id = ?').run(id);
  }

  addMessage(chatId: string, m: Omit<ChatMessage, 'id' | 'createdAt'>): ChatMessage {
    const msg: ChatMessage = { ...m, id: randomUUID(), createdAt: new Date().toISOString() };
    this.db
      .prepare('INSERT INTO messages VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(msg.id, chatId, msg.role, msg.text, msg.model, JSON.stringify(msg.tools), JSON.stringify(msg.actionIds), msg.costUsd, msg.createdAt);
    return msg;
  }

  /** Total AI spend by model label, from stored message costs. */
  aiSpend(): { model: string; usd: number; messages: number }[] {
    return (
      this.db
        .prepare("SELECT model, SUM(COALESCE(cost, 0)) AS usd, COUNT(*) AS n FROM messages WHERE role = 'assistant' GROUP BY model ORDER BY usd DESC")
        .all() as Row[]
    ).map((r) => ({ model: String(r.model ?? '—'), usd: Number(r.usd), messages: Number(r.n) }));
  }
}
