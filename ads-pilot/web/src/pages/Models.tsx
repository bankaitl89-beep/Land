import { useEffect, useState } from 'react';
import { api, type Provider } from '../api';
import type { Perm, Settings } from '../../../shared/types';
import { MODEL_OPTIONS } from '../models';
import { LazyInput, useApp, useLoad } from '../ui';

const PROVIDERS: { id: Provider; name: string; modelKey: keyof Settings['providers'] | null; note: string }[] = [
  { id: 'anthropic', name: 'Anthropic (Claude)', modelKey: null, note: 'Opus 5.5, Sonnet 5.5, Haiku 5.5' },
  { id: 'deepseek', name: 'DeepSeek', modelKey: 'deepseekModel', note: 'Официальный API обрабатывает данные на серверах в Китае' },
  { id: 'xai', name: 'xAI (Grok)', modelKey: 'xaiModel', note: 'Выберите модель после проверки ключа' },
  { id: 'openai', name: 'OpenAI', modelKey: 'openaiModel', note: 'Выберите модель после проверки ключа' },
];

function ProviderRow({ p }: { p: (typeof PROVIDERS)[number] }) {
  const { status, settings: s, saveSettings, refreshStatus, toast } = useApp();
  const [key, setKey] = useState('');
  const [models, setModels] = useState<string[] | null>(null);
  const masked = status?.keys[p.id] ?? '';
  const connected = !!masked;

  const save = async () => {
    try {
      await api.setKey(p.id, key);
      setKey('');
      await refreshStatus();
      toast(key ? `Ключ ${p.name} сохранён` : `Ключ ${p.name} удалён`);
    } catch (e) {
      toast((e as Error).message, true);
    }
  };
  const load = async () => {
    try {
      setModels(await api.models(p.id));
    } catch (e) {
      toast(`Список моделей: ${(e as Error).message}`, true);
    }
  };
  const model = p.modelKey ? s.providers[p.modelKey] : '';

  return (
    <div style={{ borderTop: '1px solid var(--line-soft)', padding: '14px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <b style={{ flex: '0 0 170px' }}>{p.name}</b>
        <span className="small muted" style={{ flex: '1 1 160px' }}>{connected ? masked : 'Не подключён'}</span>
        <span className={`chip ${connected ? 'good' : ''}`}>{connected ? 'Ключ есть' : 'Нет ключа'}</span>
      </div>
      <form
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <label className="sr" htmlFor={`k-${p.id}`}>Ключ {p.name}</label>
        <input id={`k-${p.id}`} className="input" style={{ flex: '1 1 240px' }} type="password" autoComplete="off" placeholder={connected ? 'Новый ключ — заменит текущий' : 'Вставьте API-ключ'} value={key} onChange={(e) => setKey(e.target.value)} />
        <button type="submit" className="btn" disabled={!key && !connected}>{key || !connected ? 'Сохранить' : 'Удалить ключ'}</button>
      </form>
      {p.modelKey && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <label className="field" style={{ flex: '1 1 240px' }}>
            Модель
            {models ? (
              <select className="input" value={model} onChange={(e) => saveSettings({ ...s, providers: { ...s.providers, [p.modelKey!]: e.target.value } })}>
                <option value="">— не выбрана —</option>
                {models.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            ) : (
              <LazyInput value={model} placeholder="id модели" onCommit={(v) => saveSettings({ ...s, providers: { ...s.providers, [p.modelKey!]: v.trim() } })} />
            )}
          </label>
          <button type="button" className="btn" disabled={!connected} onClick={load}>Загрузить список</button>
        </div>
      )}
      <div className="hint">{p.note}</div>
    </div>
  );
}

function PermSelect({ value, onChange, label, allowAuto = true }: { value: Perm; onChange: (p: Perm) => void; label: string; allowAuto?: boolean }) {
  return (
    <select className="input" style={{ width: 200 }} aria-label={label} value={value} onChange={(e) => onChange(e.target.value as Perm)}>
      {allowAuto && <option value="auto">Сам (в автопилоте)</option>}
      <option value="ask">Спрашивать</option>
      <option value="deny">Запрещено</option>
    </select>
  );
}

export function ModelsPage() {
  const { settings: s, saveSettings, status } = useApp();
  const { data: spend } = useLoad(() => api.aiSpend(), []);
  const [p, setP] = useState(s.permissions);
  useEffect(() => setP(s.permissions), [s.permissions]);
  const perm = (patch: Partial<Settings['permissions']>) => {
    const next = { ...p, ...patch };
    setP(next);
    saveSettings({ ...s, permissions: next });
  };

  return (
    <>
      <header className="head">
        <div>
          <h1>Модели и права агента</h1>
          <div className="sub">Какая модель отвечает, где ключи и что агенту можно без вас</div>
        </div>
      </header>

      {status?.mode === 'static' && <div className="banner info">Это превью: ключи здесь не сохраняются. Запустите приложение у себя, чтобы подключить модели.</div>}

      <div className="row">
        <div className="col" style={{ flex: '3 1 560px' }}>
          <section className="card pad stack">
            <h2>Модель агента по умолчанию</h2>
            <div className="small muted">В чате её можно сменить на лету.</div>
            <select className="input" value={s.agent.model} onChange={(e) => saveSettings({ ...s, agent: { ...s.agent, model: e.target.value as Settings['agent']['model'] } })}>
              {MODEL_OPTIONS.map((m) => {
                const ok = m.needs === null || !!status?.providers[m.needs];
                return (
                  <option key={m.id} value={m.id} disabled={!ok}>
                    {m.name}{ok ? '' : ' — нужен ключ'}
                  </option>
                );
              })}
            </select>
            <div className="hint">Авто-выбор: вопросы и отчёты — Claude Haiku 5.5, изменения в кабинете — Sonnet 5.5, аудит и «почему» — Opus 5.5. Без ключа Anthropic берётся первый подключённый провайдер, без ключей вообще — демо-агент по правилам.</div>
          </section>

          <section className="card pad">
            <h2 style={{ marginBottom: 6 }}>Провайдеры</h2>
            <div className="hint" style={{ marginBottom: 6 }}>Ключи хранятся на вашем сервере (в базе SQLite или в .env) и в браузер не отдаются — только маска.</div>
            {PROVIDERS.map((x) => <ProviderRow key={x.id} p={x} />)}
            <div style={{ borderTop: '1px solid var(--line-soft)', padding: '14px 0 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <b>Локальная модель (Ollama)</b>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <label className="field" style={{ flex: '1 1 240px' }}>
                  Адрес
                  <LazyInput value={s.providers.ollamaUrl} onCommit={(v) => saveSettings({ ...s, providers: { ...s.providers, ollamaUrl: v.trim() } })} />
                </label>
                <label className="field" style={{ flex: '1 1 200px' }}>
                  Модель
                  <LazyInput placeholder="например, qwen3" value={s.providers.ollamaModel} onCommit={(v) => saveSettings({ ...s, providers: { ...s.providers, ollamaModel: v.trim() } })} />
                </label>
              </div>
              <div className="hint">Модель должна поддерживать вызов инструментов (function calling), иначе агент не сможет читать статистику.</div>
            </div>
          </section>
        </div>

        <div className="col" style={{ flex: '2 1 360px' }}>
          <section className="card pad stack">
            <h2>Права агента</h2>
            <div className="small muted">Действуют в чате и в автопилоте. В режиме «Спрашивать» любое изменение ждёт подтверждения.</div>
            {(
              [
                ['pause', 'Ставить на паузу'],
                ['budget', 'Менять бюджет'],
                ['activate', 'Включать в показ'],
              ] as const
            ).map(([k, label]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', borderTop: '1px solid var(--line-soft)', paddingTop: 12 }}>
                <span>{label}</span>
                <PermSelect label={label} value={p[k]} onChange={(v) => perm({ [k]: v })} />
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderTop: '1px solid var(--line-soft)', paddingTop: 12 }}>
              <span>Удалять</span>
              <span className="chip">Запрещено всегда</span>
            </div>
            <label className="field" style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 12 }}>
              Шаг изменения бюджета, % за раз
              <LazyInput type="number" min={1} max={100} value={p.budgetMaxPct} onCommit={(v) => perm({ budgetMaxPct: Math.min(100, Math.max(1, Number(v) || 1)) })} />
            </label>
            <label className="field">
              Потолок суммарного дневного бюджета
              <LazyInput type="number" min={0} value={p.dailyCap} onCommit={(v) => perm({ dailyCap: Math.max(0, Number(v) || 0) })} />
              <span className="hint">Агент не сможет превысить его ни бюджетом, ни включением кампаний.</span>
            </label>
            <label className="field">
              Защищённые кампании — название содержит
              <LazyInput value={p.protectedTag} onCommit={(v) => perm({ protectedTag: v.trim() })} />
            </label>
          </section>

          <section className="card pad stack">
            <h2>Расходы на AI</h2>
            {!spend || spend.length === 0 ? (
              <div className="small muted">Пока нет ответов от моделей.</div>
            ) : (
              spend.map((x) => (
                <div key={x.model} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }} className="small">
                  <span>{x.model === 'demo' ? 'Демо без модели' : x.model}</span>
                  <span className="muted">{x.messages} отв. · ≈ ${x.usd.toFixed(3)}</span>
                </div>
              ))
            )}
            <div className="hint">Стоимость считается по прайсу Claude API. Для DeepSeek, Grok и OpenAI суммы не показываются — смотрите в их кабинетах.</div>
          </section>
        </div>
      </div>
    </>
  );
}
