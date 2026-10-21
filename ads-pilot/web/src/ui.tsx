import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AppStatus, Settings } from '../../shared/types';
import { DEFAULT_SETTINGS } from '../../shared/types';
import { api } from './api';

// ---------- app context: settings, status, toasts ----------

interface Ctx {
  settings: Settings;
  status: AppStatus | null;
  saveSettings: (s: Settings) => Promise<void>;
  refreshStatus: () => Promise<void>;
  toast: (text: string, err?: boolean) => void;
  /** Bumped after any change in the account, so pages refetch. */
  version: number;
  bump: () => void;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [msg, setMsg] = useState<{ text: string; err: boolean } | null>(null);
  const [version, setVersion] = useState(0);

  const toast = useCallback((text: string, err = false) => {
    setMsg({ text, err });
    window.setTimeout(() => setMsg((m) => (m?.text === text ? null : m)), 4000);
  }, []);
  const refreshStatus = useCallback(async () => {
    try {
      setStatus(await api.status());
    } catch (e) {
      toast(`Сервер недоступен: ${(e as Error).message}`, true);
    }
  }, [toast]);
  const saveSettings = useCallback(
    async (s: Settings) => {
      try {
        setSettings(await api.saveSettings(s));
        setVersion((v) => v + 1);
        await refreshStatus();
      } catch (e) {
        toast((e as Error).message, true);
      }
    },
    [toast, refreshStatus],
  );

  useEffect(() => {
    api.settings().then(setSettings).catch(() => undefined);
    refreshStatus();
  }, [refreshStatus]);

  return (
    <AppCtx.Provider value={{ settings, status, saveSettings, refreshStatus, toast, version, bump: () => setVersion((v) => v + 1) }}>
      {children}
      {msg && (
        <div className={`toast ${msg.err ? 'err' : ''}`} role="status">
          {msg.text}
        </div>
      )}
    </AppCtx.Provider>
  );
}

export function useApp(): Ctx {
  const c = useContext(AppCtx);
  if (!c) throw new Error('AppProvider missing');
  return c;
}

/** Load data for a page; reloads when deps or the global version change. */
export function useLoad<T>(load: () => Promise<T>, deps: unknown[]): { data: T | null; error: string | null; reload: () => void } {
  const { version } = useApp();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    load()
      .then((d) => alive && (setData(d), setError(null)))
      .catch((e) => alive && setError((e as Error).message));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version, tick]);
  return { data, error, reload: () => setTick((t) => t + 1) };
}

// ---------- routing ----------

export function useRoute(): [string, string | null] {
  const read = () => {
    const h = window.location.hash.replace(/^#\/?/, '');
    const [page, arg] = h.split('/');
    return [page || 'overview', arg ?? null] as [string, string | null];
  };
  const [r, setR] = useState(read);
  useEffect(() => {
    const on = () => setR(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return r;
}

export function go(path: string) {
  window.location.hash = `#/${path}`;
}

// ---------- small components ----------

const ICONS: Record<string, string> = {
  overview: 'M4 11l8-7 8 7v9H4z',
  campaigns: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
  leaderboard: 'M5 20V10M12 20V4M19 20v-7',
  agent: 'M4 5h16v11H9l-5 4z',
  models: 'M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4',
  settings: 'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M14 4v4M8 10v4M16 16v4',
  connect: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  send: 'M5 12h14M13 6l6 6-6 6',
  chevron: 'm6 9 6 6 6-6',
  chevronR: 'm9 6 6 6-6 6',
  check: 'm5 12 5 5 9-10',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',
  refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
};

export function Icon({ name, size = 18, stroke = 1.8 }: { name: keyof typeof ICONS | string; size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name] ?? ''} />
    </svg>
  );
}

export function Seg<T extends string | number>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map(([v, l]) => (
        <button key={String(v)} type="button" role="radio" aria-checked={v === value} className={v === value ? 'on' : ''} onClick={() => onChange(v)}>
          {l}
        </button>
      ))}
    </div>
  );
}

export function Switch({ on, onChange, label, disabled }: { on: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className={`switch ${on ? 'on' : ''}`} disabled={disabled} onClick={() => onChange(!on)}>
      <i />
    </button>
  );
}

const TINTS = ['#DCE3F9', '#F6E3D3', '#DDEFE6', '#ECE4F6'];
export function Thumb({ id, format, w = 36 }: { id: string; format: string; w?: number }) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const tall = format === '9:16' || format === '4:5' || format === 'video';
  return (
    <span className="thumb" style={{ width: w, height: tall ? Math.round(w * 1.25) : w, background: TINTS[h % TINTS.length] }} aria-hidden="true">
      {w >= 48 ? format : ''}
    </span>
  );
}

/** Tiny, safe markdown: paragraphs, - lists, 1. lists, **bold**, _italic_. No HTML. */
export function Md({ text }: { text: string }) {
  const inline = (s: string, key: string): ReactNode[] =>
    s.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) return <b key={`${key}-${i}`}>{part.slice(2, -2)}</b>;
      if (part.length > 2 && part.startsWith('_') && part.endsWith('_')) return <em key={`${key}-${i}`} className="muted">{part.slice(1, -1)}</em>;
      return part;
    });
  const blocks = text.split(/\n{2,}/);
  return (
    <>
      {blocks.map((b, bi) => {
        const lines = b.split('\n').filter((l) => l.trim());
        if (lines.length && lines.every((l) => /^\s*[-•]\s/.test(l)))
          return <ul key={bi}>{lines.map((l, i) => <li key={i}>{inline(l.replace(/^\s*[-•]\s/, ''), `${bi}-${i}`)}</li>)}</ul>;
        if (lines.length && lines.every((l) => /^\s*\d+[.)]\s/.test(l)))
          return <ol key={bi}>{lines.map((l, i) => <li key={i}>{inline(l.replace(/^\s*\d+[.)]\s/, ''), `${bi}-${i}`)}</li>)}</ol>;
        // A heading line followed by a list in one block.
        if (lines.length > 1 && lines.slice(1).every((l) => /^\s*[-•]\s/.test(l)))
          return (
            <div key={bi}>
              <p>{inline(lines[0], `${bi}-h`)}</p>
              <ul>{lines.slice(1).map((l, i) => <li key={i}>{inline(l.replace(/^\s*[-•]\s/, ''), `${bi}-${i}`)}</li>)}</ul>
            </div>
          );
        return <p key={bi}>{lines.map((l, i) => <span key={i}>{i > 0 && <br />}{inline(l, `${bi}-${i}`)}</span>)}</p>;
      })}
    </>
  );
}

export function Loading() {
  return <div className="muted small" role="status">Загрузка…</div>;
}

export function ErrorBox({ error }: { error: string }) {
  return <div className="banner" role="alert">{error}</div>;
}

/** Text/number input that commits on blur or Enter instead of every keystroke. */
export function LazyInput({
  value,
  onCommit,
  type = 'text',
  ...rest
}: { value: string | number; onCommit: (v: string) => void; type?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'>) {
  const [v, setV] = useState(String(value));
  useEffect(() => setV(String(value)), [value]);
  return (
    <input
      {...rest}
      className={rest.className ?? 'input'}
      type={type}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => v !== String(value) && onCommit(v)}
      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
    />
  );
}
