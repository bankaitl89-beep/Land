import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { TOOLS, runTool, systemPrompt, type ToolContext } from '../shared/agentTools';
import { demoAgentTurn, type TurnResult } from '../shared/demoAgent';
import { toDay } from '../shared/analytics';
import type { ChatMessage, ModelChoice, ProviderStatus, Settings, ToolTrace } from '../shared/types';
import type { Store } from './store';

const MAX_STEPS = 8;

/** USD per million tokens (input, output) — first-party Claude API list prices. */
const CLAUDE_PRICE: Record<string, [number, number]> = {
  'claude-opus-5-5': [4, 20],
  'claude-sonnet-5-5': [2, 10],
  'claude-haiku-5-5': [0.1, 0.5],
};

const CLAUDE_LABEL: Record<string, string> = {
  'claude-opus-5-5': 'Claude Opus 5.5',
  'claude-sonnet-5-5': 'Claude Sonnet 5.5',
  'claude-haiku-5-5': 'Claude Haiku 5.5',
};

export function providerStatus(store: Store, s: Settings): ProviderStatus {
  return {
    anthropic: !!store.key('anthropic'),
    openai: !!store.key('openai') && !!s.providers.openaiModel,
    deepseek: !!store.key('deepseek') && !!s.providers.deepseekModel,
    xai: !!store.key('xai') && !!s.providers.xaiModel,
    local: !!s.providers.ollamaModel,
  };
}

function available(choice: ModelChoice, p: ProviderStatus): boolean {
  if (choice.startsWith('claude-')) return p.anthropic;
  if (choice === 'openai') return p.openai;
  if (choice === 'deepseek') return p.deepseek;
  if (choice === 'grok') return p.xai;
  if (choice === 'local') return p.local;
  return true;
}

/** Auto mode: cheap model for questions, stronger one for changes, strongest for analysis. */
export function autoPick(text: string, p: ProviderStatus): ModelChoice | null {
  const q = text.toLowerCase();
  if (p.anthropic) {
    if (/аудит|стратег|почему|проанализ|разбер|сравни/.test(q)) return 'claude-opus-5-5';
    if (/пауз|бюджет|включ|выключ|запуст|останов|увелич|уменьш|исправ/.test(q)) return 'claude-sonnet-5-5';
    return 'claude-haiku-5-5';
  }
  for (const c of ['deepseek', 'grok', 'openai', 'local'] as const) if (available(c, p)) return c;
  return null;
}

interface CompatTarget {
  label: string;
  baseURL?: string;
  apiKey: string;
  model: string;
}

function compatTarget(choice: ModelChoice, store: Store, s: Settings): CompatTarget {
  switch (choice) {
    case 'openai':
      return { label: `OpenAI · ${s.providers.openaiModel}`, apiKey: store.key('openai'), model: s.providers.openaiModel };
    case 'deepseek':
      return { label: `DeepSeek · ${s.providers.deepseekModel}`, baseURL: 'https://api.deepseek.com', apiKey: store.key('deepseek'), model: s.providers.deepseekModel };
    case 'grok':
      return { label: `Grok · ${s.providers.xaiModel}`, baseURL: 'https://api.x.ai/v1', apiKey: store.key('xai'), model: s.providers.xaiModel };
    default:
      return { label: `Локальная · ${s.providers.ollamaModel}`, baseURL: s.providers.ollamaUrl, apiKey: 'ollama', model: s.providers.ollamaModel };
  }
}

export async function listProviderModels(provider: 'openai' | 'deepseek' | 'xai' | 'local', store: Store, s: Settings): Promise<string[]> {
  const t = compatTarget(provider === 'xai' ? 'grok' : provider, store, s);
  if (!t.apiKey) throw new Error('Нет ключа');
  const client = new OpenAI({ apiKey: t.apiKey, baseURL: t.baseURL });
  const out: string[] = [];
  for await (const m of client.models.list()) out.push(m.id);
  return out.sort();
}

async function runClaude(model: string, apiKey: string, system: string, history: ChatMessage[], text: string, ctx: ToolContext): Promise<TurnResult> {
  const client = new Anthropic({ apiKey });
  const tools: Anthropic.Beta.BetaTool[] = TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters as Anthropic.Beta.BetaTool.InputSchema,
    strict: true,
  }));
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    ...history.map((m) => ({ role: m.role, content: m.text })),
    { role: 'user', content: text },
  ];
  // Opus 5.5 and Sonnet 5.5 may decline with stop_reason "refusal"; server-side fallback re-runs the
  // request on another model inside the same call.
  const withFallback = model !== 'claude-haiku-5-5';
  const traces: ToolTrace[] = [];
  const actionIds: string[] = [];
  let usd = 0;
  let answer = '';
  let served = model;

  for (let step = 0; step < MAX_STEPS; step++) {
    const res = await client.beta.messages.create({
      model,
      max_tokens: 16000,
      system,
      tools,
      messages,
      output_config: { effort: 'medium' },
      ...(withFallback ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
    });
    served = res.model;
    const price = CLAUDE_PRICE[res.model] ?? CLAUDE_PRICE[model];
    usd += (res.usage.input_tokens * price[0] + res.usage.output_tokens * price[1]) / 1e6;

    if (res.stop_reason === 'refusal') {
      answer = 'Модель отказалась отвечать на этот запрос. Попробуйте переформулировать или выбрать другую модель.';
      break;
    }
    messages.push({ role: 'assistant', content: res.content });
    if (res.stop_reason === 'pause_turn') continue;

    const calls = res.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === 'tool_use');
    if (res.stop_reason !== 'tool_use' || calls.length === 0) {
      answer = res.content
        .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();
      if (res.stop_reason === 'max_tokens') answer += '\n\n_Ответ обрезан по длине._';
      break;
    }

    // All results of one step go back in a single user message.
    const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
    for (const call of calls) {
      const out = await runTool(call.name, (call.input ?? {}) as Record<string, unknown>, ctx);
      traces.push(out.trace);
      if (out.actionId) actionIds.push(out.actionId);
      results.push({ type: 'tool_result', tool_use_id: call.id, content: out.content, is_error: out.isError });
    }
    messages.push({ role: 'user', content: results });
  }

  return {
    text: answer || 'Не успел закончить за отведённое число шагов. Уточните задачу.',
    tools: traces,
    actionIds,
    model: CLAUDE_LABEL[served] ?? served,
    costUsd: usd,
  };
}

async function runCompat(t: CompatTarget, system: string, history: ChatMessage[], text: string, ctx: ToolContext): Promise<TurnResult> {
  if (!t.model) throw new Error(`Не выбрана модель для «${t.label}» — укажите её на странице «Модели».`);
  const client = new OpenAI({ apiKey: t.apiKey, baseURL: t.baseURL });
  const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = TOOLS.map((tool) => ({
    type: 'function',
    function: { name: tool.name, description: tool.description, parameters: tool.parameters },
  }));
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: system },
    ...history.map((m) => ({ role: m.role, content: m.text })),
    { role: 'user', content: text },
  ];
  const traces: ToolTrace[] = [];
  const actionIds: string[] = [];
  let answer = '';

  for (let step = 0; step < MAX_STEPS; step++) {
    const res = await client.chat.completions.create({ model: t.model, messages, tools });
    const msg = res.choices[0]?.message;
    if (!msg) break;
    const calls = (msg.tool_calls ?? []).filter((c) => c.type === 'function');
    if (calls.length === 0) {
      answer = (msg.content ?? '').trim();
      break;
    }
    messages.push({ role: 'assistant', content: msg.content ?? '', tool_calls: calls });
    for (const call of calls) {
      let input: Record<string, unknown> = {};
      let content: string;
      try {
        input = JSON.parse(call.function.arguments || '{}');
        const out = await runTool(call.function.name, input, ctx);
        traces.push(out.trace);
        if (out.actionId) actionIds.push(out.actionId);
        content = out.content;
      } catch {
        content = JSON.stringify({ error: 'Аргументы не являются корректным JSON' });
      }
      messages.push({ role: 'tool', tool_call_id: call.id, content });
    }
  }

  return { text: answer || 'Не успел закончить за отведённое число шагов.', tools: traces, actionIds, model: t.label, costUsd: null };
}

export async function agentTurn(opts: {
  store: Store;
  ctx: ToolContext;
  history: ChatMessage[];
  text: string;
  choice: ModelChoice;
}): Promise<TurnResult> {
  const s = opts.store.settings();
  const p = providerStatus(opts.store, s);
  const choice = opts.choice === 'auto' ? autoPick(opts.text, p) : available(opts.choice, p) ? opts.choice : null;
  if (!choice) return demoAgentTurn(opts.text, opts.ctx);

  const system = systemPrompt(s, opts.ctx.mode, toDay(Date.now()));
  const history = opts.history.slice(-20);
  if (choice.startsWith('claude-')) {
    return runClaude(choice, opts.store.key('anthropic'), system, history, opts.text, opts.ctx);
  }
  return runCompat(compatTarget(choice, opts.store, s), system, history, opts.text, opts.ctx);
}
