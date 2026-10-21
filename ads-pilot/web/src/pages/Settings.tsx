import { api } from '../api';
import { money, num } from '../../../shared/format';
import type { Settings } from '../../../shared/types';
import { LazyInput, Loading, useApp, useLoad } from '../ui';

export function SettingsPage() {
  const { settings: s, saveSettings, status } = useApp();
  const acc = status?.account;
  const set = (patch: Partial<Settings>) => saveSettings({ ...s, ...patch });

  return (
    <>
      <header className="head">
        <div>
          <h1>Настройки отчётов</h1>
          <div className="sub">От них зависят все ROAS и CPA: в обзоре, рейтинге, правилах и у агента</div>
        </div>
        <button type="button" className="btn" onClick={() => set({ attribution: { click: 7, view: 1 } })}>
          Как в Ads Manager
        </button>
      </header>

      <div className="row">
        <div className="col" style={{ flex: '3 1 560px' }}>
          <section className="card pad stack">
            <div>
              <h2>Окно атрибуции</h2>
              <div className="small muted" style={{ marginTop: 4 }}>Сколько дней после клика или просмотра покупка засчитывается рекламе</div>
            </div>
            <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
              <legend className="lbl" style={{ marginBottom: 8 }}>После клика</legend>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {([1, 7] as const).map((d) => (
                  <label key={d} className={`opt ${s.attribution.click === d ? 'on' : ''}`}>
                    <span style={{ fontWeight: 600 }}>
                      <input type="radio" name="click" checked={s.attribution.click === d} onChange={() => set({ attribution: { ...s.attribution, click: d } })} />
                      {d === 1 ? '1 день' : '7 дней'}
                    </span>
                    <span className="tiny muted">{d === 1 ? 'Строго, меньше конверсий' : 'Стандарт Meta'}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
              <legend className="lbl" style={{ marginBottom: 8 }}>После просмотра</legend>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {([0, 1] as const).map((v) => (
                  <label key={v} className={`opt ${s.attribution.view === v ? 'on' : ''}`}>
                    <span style={{ fontWeight: 600 }}>
                      <input type="radio" name="view" checked={s.attribution.view === v} onChange={() => set({ attribution: { ...s.attribution, view: v } })} />
                      {v === 0 ? 'Не учитывать' : '1 день'}
                    </span>
                    <span className="tiny muted">{v === 0 ? 'Только кликовые продажи' : 'Стандарт Meta'}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="banner">
              Окно, на которое учится Meta, задаётся в группе объявлений при запуске. Здесь — только окно для отчётов. Если они разные, цифры не совпадут с тем, что оптимизирует Meta.
            </div>
          </section>

          <section className="card pad stack">
            <h2>Как это меняет цифры · 30 дней</h2>
            <WindowTable s={s} />
            <div className="tiny muted">Чем шире окно, тем лучше выглядит реклама. Сравнивайте периоды только при одинаковом окне.</div>
          </section>

          <section className="card pad stack">
            <h2>Валюта</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <div className="field" style={{ flex: '1 1 180px' }}>
                Валюта кабинета
                <div className="input" style={{ display: 'flex', alignItems: 'center', borderStyle: 'dashed', background: 'var(--subtle)' }}>
                  {acc?.currency ?? '—'}
                  <span className="chip" style={{ marginLeft: 'auto' }}>из Meta</span>
                </div>
              </div>
              <label className="field" style={{ flex: '1 1 160px' }}>
                Показывать в
                <select
                  className="input"
                  value={s.display.currency}
                  onChange={(e) => set({ display: { currency: e.target.value, rate: e.target.value === acc?.currency ? 1 : s.display.rate } })}
                >
                  {Array.from(new Set([acc?.currency ?? 'RUB', 'RUB', 'USD', 'EUR'])).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="field" style={{ flex: '1 1 180px' }}>
                Курс: 1 {acc?.currency ?? 'RUB'} = … {s.display.currency}
                <LazyInput
                  type="number"
                  step="any"
                  min={0}
                  value={s.display.rate}
                  disabled={s.display.currency === acc?.currency}
                  onCommit={(v) => set({ display: { ...s.display, rate: Number(v) > 0 ? Number(v) : 1 } })}
                />
              </label>
            </div>
            <div className="hint">
              Валюту и часовой пояс кабинета ({acc?.timezone ?? '—'}) Meta не даёт менять после создания. Курс фиксированный — для ориентира, бюджеты всегда меняются в валюте кабинета.
            </div>
          </section>
        </div>

        <div className="col" style={{ flex: '2 1 340px' }}>
          <section className="card pad stack">
            <h2>Что считать результатом</h2>
            <label className="field">
              Целевое событие
              <select className="input" value={s.event} onChange={(e) => set({ event: e.target.value as Settings['event'] })}>
                <option value="purchase">Purchase — покупка</option>
                <option value="lead">Lead — заявка</option>
              </select>
              <span className="hint">Применяется при следующей синхронизации с Meta.</span>
            </label>
          </section>

          <section className="card pad stack">
            <div>
              <h2>Цели</h2>
              <div className="small muted" style={{ marginTop: 4 }}>По ним красятся цифры и думает агент</div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <label className="field" style={{ flex: '1 1 120px' }}>
                Целевой CPA
                <LazyInput type="number" min={1} value={s.goals.cpa} onCommit={(v) => set({ goals: { ...s.goals, cpa: Math.max(1, Number(v) || 1) } })} />
              </label>
              <label className="field" style={{ flex: '1 1 120px' }}>
                Мин. ROAS
                <LazyInput type="number" step="0.1" min={0} value={s.goals.roas} onCommit={(v) => set({ goals: { ...s.goals, roas: Math.max(0, Number(v) || 0) } })} />
              </label>
            </div>
          </section>

          <section className="card pad stack">
            <div>
              <h2>Когда данным можно верить</h2>
              <div className="small muted" style={{ marginTop: 4 }}>Ниже порога — метка «Мало данных»: в выводах и у агента такие строки не участвуют</div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <label className="field" style={{ flex: '1 1 120px' }}>
                Мин. расход
                <LazyInput type="number" min={0} value={s.thresholds.minSpend} onCommit={(v) => set({ thresholds: { ...s.thresholds, minSpend: Math.max(0, Number(v) || 0) } })} />
              </label>
              <label className="field" style={{ flex: '1 1 120px' }}>
                Мин. показы
                <LazyInput type="number" min={0} value={s.thresholds.minImpressions} onCommit={(v) => set({ thresholds: { ...s.thresholds, minImpressions: Math.max(0, Number(v) || 0) } })} />
              </label>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function WindowTable({ s }: { s: Settings }) {
  const { data } = useLoad(() => api.windows(30), []);
  if (!data) return <Loading />;
  const isCur = (d: { click: number; view: number }) => d.click === s.attribution.click && d.view === s.attribution.view;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th className="l"></th>
            {data.map((d) => (
              <th key={d.label} style={isCur(d) ? { color: 'var(--accent-strong)' } : undefined}>
                {d.label}
                {isCur(d) ? ' · сейчас' : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="l">Конверсии</td>
            {data.map((d) => <td key={d.label}><b>{num(d.m.conversions)}</b></td>)}
          </tr>
          <tr>
            <td className="l">ROAS</td>
            {data.map((d) => <td key={d.label}><b>{num(d.m.roas, 2)}</b></td>)}
          </tr>
          <tr>
            <td className="l">CPA</td>
            {data.map((d) => <td key={d.label}><b>{money(d.m.cpa, s)}</b></td>)}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
