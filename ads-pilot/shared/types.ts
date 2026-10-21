export type Period = 7 | 30 | 90;
export type Status = 'ACTIVE' | 'PAUSED';
export type Review = 'approved' | 'pending' | 'rejected';

export interface Campaign {
  id: string;
  name: string;
  status: Status;
  objective: string;
  /** Daily budget in major currency units (rubles, dollars). null = budget lives on ad sets. */
  dailyBudget: number | null;
}

export interface AdSet {
  id: string;
  campaignId: string;
  name: string;
  status: Status;
  dailyBudget: number | null;
}

export interface Ad {
  id: string;
  adsetId: string;
  campaignId: string;
  name: string;
  status: Status;
  review: Review;
  format: string;
  headline: string;
  thumb: string | null;
}

/**
 * One ad, one day. Conversions are stored per attribution window so the report
 * window can change without re-fetching: c1/c7 = after click (1 / 7 days),
 * v1 = after view (1 day). c7 already includes c1.
 */
export interface DailyRow {
  date: string;
  adId: string;
  spend: number;
  impressions: number;
  clicks: number;
  c1: number;
  c7: number;
  v1: number;
  val1: number;
  val7: number;
  valV1: number;
}

export interface Dataset {
  campaigns: Campaign[];
  adsets: AdSet[];
  ads: Ad[];
  rows: DailyRow[];
}

export type Perm = 'auto' | 'ask' | 'deny';

export type ModelChoice =
  | 'auto'
  | 'claude-opus-5-5'
  | 'claude-sonnet-5-5'
  | 'claude-haiku-5-5'
  | 'openai'
  | 'deepseek'
  | 'grok'
  | 'local';

export interface Settings {
  attribution: { click: 1 | 7; view: 0 | 1 };
  event: 'purchase' | 'lead';
  display: { currency: string; rate: number };
  goals: { cpa: number; roas: number };
  thresholds: { minSpend: number; minImpressions: number; learningHours: number };
  agent: { model: ModelChoice; mode: 'ask' | 'autopilot' };
  providers: {
    openaiModel: string;
    deepseekModel: string;
    xaiModel: string;
    ollamaModel: string;
    ollamaUrl: string;
  };
  permissions: {
    pause: Perm;
    activate: Perm;
    budget: Perm;
    budgetMaxPct: number;
    dailyCap: number;
    protectedTag: string;
  };
  memory: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  attribution: { click: 7, view: 1 },
  event: 'purchase',
  display: { currency: 'RUB', rate: 1 },
  goals: { cpa: 650, roas: 3 },
  thresholds: { minSpend: 3000, minImpressions: 1000, learningHours: 72 },
  agent: { model: 'auto', mode: 'ask' },
  providers: {
    openaiModel: '',
    deepseekModel: 'deepseek-chat',
    xaiModel: '',
    ollamaModel: '',
    ollamaUrl: 'http://localhost:11434/v1',
  },
  permissions: {
    pause: 'auto',
    activate: 'ask',
    budget: 'ask',
    budgetMaxPct: 20,
    dailyCap: 15000,
    protectedTag: 'Бренд',
  },
  memory: [],
};

export interface Metrics {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpa: number | null;
  roas: number | null;
}

export interface Alert {
  id: string;
  kind: 'fatigue' | 'cpa' | 'tracking';
  title: string;
  text: string;
  targetId: string | null;
  targetKind: 'ad' | 'adset' | 'campaign' | null;
  hasBudget: boolean;
}

export interface Overview {
  period: Period;
  current: Metrics;
  previous: Metrics;
  series: { label: string; spend: number; revenue: number; conversions: number }[];
  alerts: Alert[];
  top: { ad: Ad; m: Metrics }[];
  account: Metrics;
}

export type Dimension = 'ad' | 'headline' | 'adset' | 'format';

export interface LeaderRow {
  key: string;
  label: string;
  sub: string;
  adId: string | null;
  m: Metrics;
  lowData: boolean;
  badge: 'winner' | 'stable' | 'fatigue' | 'below' | 'low';
}

export interface Leaderboard {
  dimension: Dimension;
  period: Period;
  average: Metrics;
  rows: LeaderRow[];
  insights: { title: string; text: string }[];
}

export interface TreeNode {
  id: string;
  kind: 'campaign' | 'adset' | 'ad';
  name: string;
  status: Status;
  dailyBudget: number | null;
  review?: Review;
  protected: boolean;
  m: Metrics;
  problem: string | null;
  children: TreeNode[];
}

export type ActionKind = 'pause' | 'activate' | 'budget';

export interface ActionRecord {
  id: string;
  createdAt: string;
  source: 'agent' | 'user' | 'rule';
  kind: ActionKind;
  targetId: string;
  targetName: string;
  /** For budget: old and new daily budget. */
  before: number | null;
  after: number | null;
  reason: string;
  status: 'pending' | 'applied' | 'rejected' | 'failed';
  result: string;
}

export interface ToolTrace {
  name: string;
  label: string;
  ok: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  model: string | null;
  tools: ToolTrace[];
  actionIds: string[];
  costUsd: number | null;
  createdAt: string;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface ProviderStatus {
  anthropic: boolean;
  openai: boolean;
  deepseek: boolean;
  xai: boolean;
  local: boolean;
}

export interface AppStatus {
  mode: 'demo' | 'live' | 'static';
  account: { name: string; currency: string; timezone: string };
  lastSync: string | null;
  providers: ProviderStatus;
  keys: Record<keyof ProviderStatus, string>;
}
