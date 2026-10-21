import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import type { ActionRecord, Chat, ChatMessage, ModelChoice } from '../../../shared/types';
import { MODEL_OPTIONS, shortName } from '../models';
import { Icon, Md, go, useApp, useLoad } from '../ui';
import { ActionStatus, actionText } from './Campaigns';

const SLASH: [string, string][] = [
  ['/отчёт', 'Сделай сводку за 7 дней: что выросло, что упало и что требует внимания.'],
  ['/аудит', 'Проведи аудит кабинета за 30 дней и предложи 3 главных действия.'],
  ['/лучшие', 'Какие креативы лучшие за 30 дней и что стоит масштабировать?'],
  ['/пауза', 'Поставь на паузу '],
  ['/бюджет', 'Измени дневной бюджет кампании '],
];

const SUGGEST = ['Почему вырос CPA на этой неделе? Исправь, что можно.', 'Какие креативы лучшие за 30 дней?', 'Сделай сводку за 7 дней.'];

function ActionCard({ a, onChange }: { a: ActionRecord; onChange: () => void }) {
  const { settings: s, toast } = useApp();
  const [busy, setBusy] = useState(false);
  const act = async (fn: () => Promise<ActionRecord>) => {
    setBusy(true);
    try {
      const r = await fn();
      if (r.status === 'failed') toast(`Meta: ${r.result}`, true);
      onChange();
    } catch (e) {
      toast((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="act">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
        <span className="lbl">#{a.id} · {a.kind === 'budget' ? 'Бюджет' : a.kind === 'pause' ? 'Пауза' : 'Включение'}</span>
        <ActionStatus a={a} />
      </div>
      <b>{actionText(a, s)}</b>
      {a.reason && <div className="small muted">{a.reason}</div>}
      {a.status === 'failed' && <div className="small" style={{ color: 'var(--bad)' }}>{a.result}</div>}
      {a.status === 'pending' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn p sm" style={{ flex: 1 }} disabled={busy} onClick={() => act(() => api.approve(a.id))}>
            Подтвердить
          </button>
          <button type="button" className="btn sm" style={{ flex: 1 }} disabled={busy} onClick={() => act(() => api.reject(a.id))}>
            Отклонить
          </button>
        </div>
      )}
    </div>
  );
}

function Message({ m, actions, onChange }: { m: ChatMessage; actions: ActionRecord[]; onChange: () => void }) {
  if (m.role === 'user') return <div className="msg bubble">{m.text}</div>;
  const mine = actions.filter((a) => m.actionIds.includes(a.id));
  return (
    <div className="bot">
      <span className="logo" aria-hidden="true">A</span>
      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {m.tools.length > 0 && (
          <div className="trace">
            {m.tools.map((t, i) => (
              <span key={i} className={`chip ${t.ok ? '' : 'warn'}`}>
                {t.ok ? '✓' : '!'} {t.label}
              </span>
            ))}
          </div>
        )}
        <div className="msg">
          <Md text={m.text} />
        </div>
        {mine.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
            {mine.map((a) => (
              <ActionCard key={a.id} a={a} onChange={onChange} />
            ))}
          </div>
        )}
        <div className="tiny muted">
          {m.model === 'demo' ? 'Демо без модели' : m.model ?? '—'}
          {m.costUsd !== null && ` · ≈ $${m.costUsd < 0.01 ? m.costUsd.toFixed(4) : m.costUsd.toFixed(2)}`}
        </div>
      </div>
    </div>
  );
}

export function AgentPage({ chatId }: { chatId: string | null }) {
  const { settings: s, saveSettings, status, toast, bump, version } = useApp();
  const { data: list, reload: reloadList } = useLoad(() => api.chats(), []);
  const [chat, setChat] = useState<Chat | null>(null);
  const [actions, setActions] = useState<ActionRecord[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [menu, setMenu] = useState(false);
  const [memo, setMemo] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const loadActions = () => api.actions().then(setActions).catch(() => undefined);

  useEffect(() => {
    loadActions();
  }, [version]);

  useEffect(() => {
    if (!chatId) {
      setChat(null);
      if (list && list.length > 0) go(`agent/${list[0].id}`);
      return;
    }
    api.chat(chatId).then(setChat).catch(() => go('agent'));
  }, [chatId, list]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [chat?.messages.length, sending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [chatId]);

  // Close the model menu on Escape or a click outside it.
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [menu]);

  const providers = status?.providers;
  const noModels = providers ? !Object.values(providers).some(Boolean) : true;

  const send = async (raw?: string) => {
    const body = (raw ?? text).trim();
    if (!body || sending) return;
    setSending(true);
    setText('');
    try {
      let target = chat;
      if (!target) {
        target = await api.createChat();
        go(`agent/${target.id}`);
      }
      const optimistic: Chat = {
        ...target,
        messages: [...target.messages, { id: 'tmp', role: 'user', text: body, model: null, tools: [], actionIds: [], costUsd: null, createdAt: '' }],
      };
      setChat(optimistic);
      const next = await api.send(target.id, body, s.agent.model, s.agent.mode);
      setChat(next);
      reloadList();
      bump();
    } catch (e) {
      toast((e as Error).message, true);
      setText(body);
    } finally {
      setSending(false);
    }
  };

  const newChat = async () => {
    const c = await api.createChat();
    reloadList();
    go(`agent/${c.id}`);
  };

  const [armed, setArmed] = useState<string | null>(null);
  const removeChat = async (id: string) => {
    // Two clicks: the first arms the button, the second deletes.
    if (armed !== id) {
      setArmed(id);
      window.setTimeout(() => setArmed((a) => (a === id ? null : a)), 3000);
      return;
    }
    setArmed(null);
    await api.deleteChat(id);
    reloadList();
    if (id === chatId) go('agent');
  };

  const pickModel = (m: ModelChoice) => {
    setMenu(false);
    saveSettings({ ...s, agent: { ...s.agent, model: m } });
  };

  const pending = actions.filter((a) => a.status === 'pending');
  const done = actions.filter((a) => a.status !== 'pending').slice(0, 5);

  return (
    <div className="agent">
      <aside className="threads" aria-label="Чаты">
        <button type="button" className="btn p" onClick={newChat} style={{ marginBottom: 8 }}>
          + Новый чат
        </button>
        {(list ?? []).length === 0 && <div className="small muted" style={{ padding: '6px 10px' }}>Чатов пока нет.</div>}
        {(list ?? []).map((c) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center' }}>
            <a className={`thr ${c.id === chatId ? 'on' : ''}`} href={`#/agent/${c.id}`} aria-current={c.id === chatId ? 'page' : undefined}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
            </a>
            <button
              type="button"
              className="linkbtn"
              aria-label={armed === c.id ? `Точно удалить чат ${c.title}` : `Удалить чат ${c.title}`}
              title={armed === c.id ? 'Нажмите ещё раз, чтобы удалить' : 'Удалить чат'}
              onClick={() => removeChat(c.id)}
              style={{ color: armed === c.id ? 'var(--bad)' : 'var(--muted)', padding: '0 6px', minHeight: 40, fontSize: 12 }}
            >
              {armed === c.id ? 'Удалить?' : <Icon name="trash" size={16} />}
            </button>
          </div>
        ))}
      </aside>

      <section className="convo" aria-label="Диалог">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 20 }}>{chat?.title ?? 'Агент'}</h1>
          <div className="seg" role="radiogroup" aria-label="Режим агента">
            {(['ask', 'autopilot'] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={s.agent.mode === m}
                className={s.agent.mode === m ? 'on' : ''}
                onClick={() => saveSettings({ ...s, agent: { ...s.agent, mode: m } })}
                title={m === 'ask' ? 'Все изменения ждут вашего подтверждения' : 'Действия с правом «сам» выполняются сразу'}
              >
                {m === 'ask' ? 'Спрашивать' : 'Автопилот'}
              </button>
            ))}
          </div>
        </header>

        {noModels && (
          <div className="banner info">
            Модель не подключена — агент работает в демо-режиме по правилам. {status?.mode === 'static' ? 'В превью это так и задумано.' : <>Добавьте ключ на странице <a href="#/models">«Модели и права»</a>.</>}
          </div>
        )}

        <div className="msgs" aria-live="polite">
          {(!chat || chat.messages.length === 0) && !sending && (
            <div className="stack" style={{ marginTop: 24 }}>
              <h2>Что сделать?</h2>
              <div className="small muted">Агент читает статистику, находит проблемы и предлагает изменения. Без подтверждения он ничего не меняет — если не включён автопилот.</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SUGGEST.map((x) => (
                  <button key={x} type="button" className="slash" onClick={() => send(x)}>
                    {x}
                  </button>
                ))}
              </div>
            </div>
          )}
          {chat?.messages.map((m) => <Message key={m.id} m={m} actions={actions} onChange={() => (loadActions(), bump())} />)}
          {sending && (
            <div className="bot">
              <span className="logo" aria-hidden="true">A</span>
              <div className="typing" aria-label="Агент думает"><i /><i /><i /></div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 780, width: '100%', position: 'relative' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SLASH.map(([k, v]) => (
              <button key={k} type="button" className="slash" onClick={() => (v.endsWith(' ') ? (setText(v), inputRef.current?.focus()) : send(v))}>
                {k}
              </button>
            ))}
          </div>

          {menu && (
            <div className="menu" role="listbox" aria-label="Модель" ref={menuRef}>
              <div className="lbl" style={{ padding: '6px 12px' }}>Модель для агента</div>
              {MODEL_OPTIONS.map((m) => {
                const ok = m.needs === null || !!providers?.[m.needs];
                return (
                  <button key={m.id} type="button" role="option" aria-selected={s.agent.model === m.id} className={`mrow ${s.agent.model === m.id ? 'on' : ''}`} disabled={!ok} onClick={() => pickModel(m.id)}>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 600 }}>
                        {m.name}
                        <span className="tag">{ok ? m.tag : 'нужен ключ'}</span>
                      </span>
                      <span className="tiny muted" style={{ display: 'block', marginTop: 2 }}>{m.desc}</span>
                    </span>
                    {s.agent.model === m.id && <Icon name="check" stroke={2.4} />}
                  </button>
                );
              })}
              <a href="#/models" className="small" style={{ display: 'flex', alignItems: 'center', minHeight: 40, padding: '0 12px', borderTop: '1px solid var(--line-soft)', fontWeight: 600, textDecoration: 'none' }}>
                Ключи, модели и права
              </a>
            </div>
          )}

          <form
            className="composer"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <label htmlFor="ask" className="sr">Сообщение агенту</label>
            <textarea
              id="ask"
              ref={inputRef}
              rows={2}
              value={text}
              placeholder="Поручите что угодно: «поставь на паузу Зима» или «/» для команд"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
                if (e.key === 'Escape') setMenu(false);
              }}
            />
            <div className="tools-row">
              <button type="button" className="model-btn" aria-haspopup="listbox" aria-expanded={menu} onMouseDown={(e) => menu && e.stopPropagation()} onClick={() => setMenu((v) => !v)}>
                <Icon name="models" size={16} />
                {shortName(s.agent.model)}
                <Icon name="chevron" size={14} stroke={2} />
              </button>
              <span className="chip" style={{ fontWeight: 500 }}>
                {s.agent.mode === 'ask' ? 'Спрашивает перед изменениями' : 'Автопилот в рамках прав'}
              </span>
              <span style={{ flex: 1 }} />
              <button type="submit" className="btn p" aria-label="Отправить" disabled={sending || !text.trim()} style={{ padding: '0 14px' }}>
                <Icon name="send" stroke={2} />
              </button>
            </div>
          </form>
        </div>
      </section>

      <aside className="panel" aria-label="Действия">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Ждут подтверждения</h2>
          {pending.length > 0 && <span className="chip info">{pending.length}</span>}
        </div>
        {pending.length === 0 ? <div className="small muted">Очередь пуста.</div> : pending.map((a) => <ActionCard key={a.id} a={a} onChange={() => (loadActions(), bump())} />)}
        {pending.length > 1 && (
          <button
            type="button"
            className="btn"
            onClick={async () => {
              for (const a of pending) await api.approve(a.id).catch(() => undefined);
              loadActions();
              bump();
            }}
          >
            Подтвердить все
          </button>
        )}

        <h2 style={{ marginTop: 8 }}>Журнал</h2>
        {done.length === 0 ? (
          <div className="small muted">Пока пусто.</div>
        ) : (
          done.map((a) => (
            <div key={a.id} className="small" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', borderTop: '1px solid var(--line-soft)', paddingTop: 8 }}>
              <ActionStatus a={a} />
              <span>{actionText(a, s)}</span>
            </div>
          ))
        )}

        <div style={{ padding: 14, borderRadius: 10, background: 'var(--subtle)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="lbl">Агент помнит</span>
          <div className="small">Цель CPA — {s.goals.cpa}, ROAS — {s.goals.roas}</div>
          <div className="small">Не трогать кампании с «{s.permissions.protectedTag}»</div>
          {s.memory.map((x, i) => (
            <div key={i} className="small" style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
              <span>{x}</span>
              <button type="button" className="linkbtn" aria-label={`Забыть: ${x}`} onClick={() => saveSettings({ ...s, memory: s.memory.filter((_, j) => j !== i) })}>
                ×
              </button>
            </div>
          ))}
          <form
            style={{ display: 'flex', gap: 6 }}
            onSubmit={(e) => {
              e.preventDefault();
              if (!memo.trim()) return;
              saveSettings({ ...s, memory: [...s.memory, memo.trim()] });
              setMemo('');
            }}
          >
            <label htmlFor="memo" className="sr">Добавить в память</label>
            <input id="memo" className="input" style={{ minHeight: 36 }} placeholder="Например: тон без капса" value={memo} onChange={(e) => setMemo(e.target.value)} />
            <button type="submit" className="btn sm">+</button>
          </form>
        </div>
        <div className="tiny muted">
          Права: пауза — {permLabel(s.permissions.pause)}, бюджет — {permLabel(s.permissions.budget)} (±{s.permissions.budgetMaxPct}%), включение — {permLabel(s.permissions.activate)}. <a href="#/models">Настроить</a>
        </div>
      </aside>
    </div>
  );
}

function permLabel(p: string) {
  return p === 'auto' ? 'сам' : p === 'ask' ? 'спрашивает' : 'запрещено';
}
