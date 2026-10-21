import { useState } from 'react';
import { api } from '../api';
import { attributionLabel, delta, money, num, pct } from '../../../shared/format';
import type { Alert, Period } from '../../../shared/types';
import { ErrorBox, Loading, Seg, Thumb, useApp, useLoad } from '../ui';

function Kpi({ label, value, d, goodWhenDown, neutral, spark }: { label: string; value: string; d: number | null; goodWhenDown?: boolean; neutral?: boolean; spark: number[] }) {
  const good = d === null ? null : goodWhenDown ? d <= 0 : d >= 0;
  const cls = neutral || d === null || Math.abs(d) < 0.5 ? '' : good ? 'good' : 'warn';
  const max = Math.max(...spark, 1);
  const pts = spark.map((v, i) => `${(i / Math.max(spark.length - 1, 1)) * 200},${34 - (v / max) * 30}`).join(' ');
  return (
    <div className="card kpi">
      <div className="lbl">{label}</div>
      <div className="line">
        <div className="v">{value}</div>
        {d !== null && (
          <span className={`chip ${cls}`} title="К прошлому периоду">
            {d >= 0 ? '▲' : '▼'} {pct(Math.abs(d), 0)}
          </span>
        )}
      </div>
      <svg viewBox="0 0 200 36" width="100%" height="36" fill="none" aria-hidden="true">
        <polyline points={pts} stroke={cls === 'warn' ? 'var(--orange)' : 'var(--accent)'} strokeWidth="2" />
      </svg>
    </div>
  );
}

function AlertItem({ a, onDone }: { a: Alert; onDone: () => void }) {
  const { toast } = useApp();
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true);
    try {
      await fn();
      toast(ok);
      onDone();
    } catch (e) {
      toast((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  };
  const chip = a.kind === 'fatigue' ? ['warn', 'Выгорание'] : a.kind === 'cpa' ? ['bad', 'CPA'] : ['', 'Пиксель'];
  return (
    <div className="alert">
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className={`chip ${chip[0]}`}>{chip[1]}</span>
        <b>{a.title}</b>
      </div>
      <div className="small muted">{a.text}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {a.targetId && a.kind !== 'tracking' && (
          <button type="button" className="btn sm" disabled={busy} onClick={() => run(() => api.setStatus(a.targetId!, 'PAUSED'), `«${a.title}» на паузе`)}>
            Поставить на паузу
          </button>
        )}
        <a className="btn sm" href={`#/agent`}>
          Разобрать с агентом
        </a>
        {a.kind === 'tracking' && (
          <a className="btn sm" href="#/connect">
            Проверить
          </a>
        )}
      </div>
    </div>
  );
}

export function OverviewPage() {
  const { settings: s } = useApp();
  const [period, setPeriod] = useState<Period>(7);
  const { data: o, error, reload } = useLoad(() => api.overview(period), [period]);

  if (error) return <ErrorBox error={error} />;
  if (!o) return <Loading />;

  const max = Math.max(...o.series.map((x) => Math.max(x.spend, x.revenue)), 1);
  const cols = { gridTemplateColumns: `repeat(${o.series.length}, minmax(0, 1fr))` };
  const roasSeries = o.series.map((x) => (x.spend ? x.revenue / x.spend : 0));

  return (
    <>
      <header className="head">
        <div>
          <h1>Обзор</h1>
          <div className="sub">
            Последние {period} дн. · атрибуция {attributionLabel(s)} · <a href="#/settings">изменить</a>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Seg label="Период" value={period} onChange={setPeriod} options={[[7, '7 дней'], [30, '30 дней'], [90, '90 дней']]} />
        </div>
      </header>

      <section className="kpis" aria-label="Ключевые метрики">
        <Kpi label="Расход" neutral value={money(o.current.spend, s)} d={delta(o.current.spend, o.previous.spend)} spark={o.series.map((x) => x.spend)} />
        <Kpi label={`ROAS (цель ${num(s.goals.roas, 1)})`} value={num(o.current.roas, 2)} d={delta(o.current.roas, o.previous.roas)} spark={roasSeries} />
        <Kpi
          label={`CPA (цель ${money(s.goals.cpa, s)})`}
          value={money(o.current.cpa, s)}
          d={delta(o.current.cpa, o.previous.cpa)}
          goodWhenDown
          spark={o.series.map((x) => (x.conversions ? x.spend / x.conversions : 0))}
        />
        <Kpi label="Конверсии" value={num(o.current.conversions)} d={delta(o.current.conversions, o.previous.conversions)} spark={o.series.map((x) => x.conversions)} />
      </section>

      <div className="row">
        <section className="card pad" style={{ flex: '2 1 480px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <h2>Расход и выручка {period > 30 ? 'по неделям' : 'по дням'}</h2>
            <div className="legend">
              <span><i className="sw-dot" style={{ background: 'var(--bar-2)' }} />Расход</span>
              <span><i className="sw-dot" style={{ background: 'var(--accent)' }} />Выручка</span>
            </div>
          </div>
          <div className="bars" style={cols} role="img" aria-label="График расхода и выручки">
            {o.series.map((x, i) => (
              <div className="pair" key={i} title={`${x.label}: расход ${money(x.spend, s)}, выручка ${money(x.revenue, s)}`}>
                <div className="b" style={{ height: `${(x.spend / max) * 100}%`, background: 'var(--bar-2)' }} />
                <div className="b" style={{ height: `${(x.revenue / max) * 100}%`, background: 'var(--accent)' }} />
              </div>
            ))}
          </div>
          <div className="bars-x" style={cols}>
            {o.series.map((x, i) => (
              <span key={i}>{o.series.length > 16 && i % 3 !== 0 ? '' : x.label}</span>
            ))}
          </div>
        </section>

        <section className="card pad" style={{ flex: '1 1 320px', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2>Требует внимания</h2>
            {o.alerts.length > 0 && <span className="chip warn">{o.alerts.length}</span>}
          </div>
          {o.alerts.length === 0 ? (
            <div className="muted small">Всё в пределах целей. Проверка — по последним 3 дням.</div>
          ) : (
            o.alerts.map((a) => <AlertItem key={a.id} a={a} onDone={reload} />)
          )}
        </section>
      </div>

      <section className="card pad stack">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Лучше среднего по кабинету</h2>
          <a href="#/leaderboard" className="small">Весь рейтинг</a>
        </div>
        {o.top.length === 0 ? (
          <div className="muted small">Нет креативов с ROAS выше среднего по кабинету и расходом от {money(s.thresholds.minSpend, s)}.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {o.top.map((t) => (
              <div key={t.ad.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Thumb id={t.ad.id} format={t.ad.format} w={56} />
                <div>
                  <b>{t.ad.name}</b>
                  <div className="small muted" style={{ marginTop: 4 }}>
                    ROAS {num(t.m.roas, 1)} · CPA {money(t.m.cpa, s)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
