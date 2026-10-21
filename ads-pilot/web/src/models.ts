import type { ModelChoice, ProviderStatus } from '../../shared/types';

export interface ModelOption {
  id: ModelChoice;
  name: string;
  tag: string;
  desc: string;
  needs: keyof ProviderStatus | null;
}

export const MODEL_OPTIONS: ModelOption[] = [
  { id: 'auto', name: 'Авто-выбор', tag: 'Рекомендуем', desc: 'Вопросы — Haiku, изменения — Sonnet, анализ — Opus. Без ключа Anthropic — первый доступный провайдер.', needs: null },
  { id: 'claude-opus-5-5', name: 'Claude Opus 5.5', tag: 'Самая умная', desc: 'Аудит, стратегия, сложные планы', needs: 'anthropic' },
  { id: 'claude-sonnet-5-5', name: 'Claude Sonnet 5.5', tag: 'Баланс', desc: 'Повседневная работа и изменения', needs: 'anthropic' },
  { id: 'claude-haiku-5-5', name: 'Claude Haiku 5.5', tag: 'Быстрая', desc: 'Отчёты и короткие вопросы, дешевле всех', needs: 'anthropic' },
  { id: 'deepseek', name: 'DeepSeek', tag: 'Дешёвая', desc: 'Тексты и разбор данных за малые деньги', needs: 'deepseek' },
  { id: 'grok', name: 'Grok', tag: 'xAI', desc: 'Альтернатива для анализа и текстов', needs: 'xai' },
  { id: 'openai', name: 'OpenAI', tag: 'GPT', desc: 'Модель из списка на странице «Модели»', needs: 'openai' },
  { id: 'local', name: 'Локальная модель', tag: 'Приватно', desc: 'Через Ollama на вашем компьютере', needs: 'local' },
];

export function shortName(id: ModelChoice): string {
  const o = MODEL_OPTIONS.find((m) => m.id === id);
  if (!o) return id;
  return o.name.replace('Claude ', '').replace('Авто-выбор', 'Авто').replace('Локальная модель', 'Локальная');
}
