import { useState } from 'react';
import { api, type Sort } from '../api';
import { attributionLabel, money, num, pct } from '../../../shared/format';
import type { Dimension, LeaderRow, Period } from '../../../shared/types';
import { ErrorBox, Loading, Seg, Thumb, useApp, useLoad } from '../ui';

const BADGE: Record<LeaderRow['badge'], [string, string]> = {
  winner: ['good', 'Победитель'],
  stable: ['', 'Стабильный'],
  fatigue: ['warn', 'Выгорает'],
  below: ['bad', 'Ниже среднего'],
  low: ['low', 'Мало данных'],
};

export function LeaderboardPage() {
  const { settings: s } = useApp();
  const [dim, setDim] = useState<Dimension>('ad');
  const [period, setPeriod] = useState<Period>(30);
  const [sort, setSort] = useState<Sort>('roas');
  const { data: lb, error } = useLoad(() => api.leaderboard(period, dim, sort), [period, dim, sort]);

  if (error) return <ErrorBox error={error} />;

  const maxRoas = Math.max(...(lb?.rows.map((r) => r.m.roas ?? 0) ?? [1]), 0.01);
  const head = { ad: 'Креатив', headline: 'Заголовок', adset: 'Группа', format: 'Формат' }[dim];

  return (
    <>
      <header className="head">
        <div>
          <h1>Рейтинг</h1>
          <div className="sub">
            {lb ? (
              <>
                Среднее по кабинету: ROAS {num(lb.average.roas, 2)} · CPA {money(lb.average.cpa, s)} · CTR {pct(lb.average.ctr)} · атрибуция {attributionLabel(s)}
              </>
            ) : (
              ' '
            )}
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <Seg label="Что сравнивать" value={dim} onChange={setDim} options={[['ad', 'Креативы'], ['headline', 'Заголовки'], ['adset', 'Группы'], ['format', 'Форматы']]} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <label className="field">
            Период
            <select className="input" value={period} onChange={(e) => setPeriod(Number(e.target.value) as Period)}>
              <option value={7}>7 дней</option>
              <option value={30}>30 дней</option>
              <option value={90}>90 дней</option>
            </select>
          </label>
          <label className="field">
            Сортировать по
            <select className="input" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="roas">ROAS</option>
              <option value="cpa">CPA</option>
              <option value="ctr">CTR</option>
            </select>
          </label>
        </div>
      </div>

      {!lb ? (
        <Loading />
      ) : (
        <div className="row">
          <section className="card" style={{ flex: '3 1 620px', minWidth: 0, overflow: 'hidden' }}>
            <div className="table-wrap">
              <table style={{ minWidth: 780 }}>
                <thead>
                  <tr>
                    <th className="l">#</th>
                    <th className="l">{head}</th>
                    <th>Расход</th>
                    <th>ROAS</th>
                    <th>CPA</th>
                    <th>CTR</th>
                    <th>Конверсии</th>
                    <th className="l">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {lb.rows.length === 0 && (
                    <tr>
                      <td className="l muted" colSpan={8}>Нет расхода за период.</td>
                    </tr>
                  )}
                  {lb.rows.map((r, i) => {
                    const [cls, label] = BADGE[r.badge];
                    const dim2 = r.lowData ? { color: 'var(--muted)' } : undefined;
                    return (
                      <tr key={r.key}>
                        <td className="l muted">{i + 1}</td>
                        <td className="l">
                          <span style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            {dim === 'ad' && <Thumb id={r.key} format={r.sub.includes('Видео') ? '9:16' : '4:5'} />}
                            <span>
                              <span style={{ display: 'block', fontWeight: 600, whiteSpace: 'normal' }}>{r.label}</span>
                              {r.sub && <span className="tiny muted">{r.sub}</span>}
                            </span>
                          </span>
                        </td>
                        <td style={dim2}>{money(r.m.spend, s)}</td>
                        <td>
                          <span className="bar-cell">
                            <span className="minibar">
                              <i style={{ width: `${((r.m.roas ?? 0) / maxRoas) * 100}%`, background: r.lowData ? 'var(--muted)' : r.badge === 'below' ? 'var(--orange)' : 'var(--accent)' }} />
                            </span>
                            <b style={dim2}>{num(r.m.roas, 2)}</b>
                          </span>
                        </td>
                        <td style={r.badge === 'below' ? { color: 'var(--bad)', fontWeight: 600 } : dim2}>{money(r.m.cpa, s)}</td>
                        <td style={dim2}>{pct(r.m.ctr)}</td>
                        <td style={dim2}>{num(r.m.conversions)}</td>
                        <td className="l">
                          <span className={`chip ${cls}`}>{label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="card pad stack" style={{ flex: '1 1 280px', minWidth: 0 }}>
            <h2>Что видно по данным</h2>
            {lb.insights.length === 0 ? (
              <div className="small muted">Для выводов нужно хотя бы 3 строки с достаточным объёмом данных.</div>
            ) : (
              lb.insights.map((x) => (
                <div key={x.title} style={{ padding: 12, borderRadius: 8, background: 'var(--subtle)' }}>
                  <b>{x.title}</b>
                  <div className="small muted" style={{ marginTop: 4 }}>{x.text}</div>
                </div>
              ))
            )}
            <a className="btn" href="#/agent">Спросить агента, что масштабировать</a>
            <div className="tiny muted">
              Порог «мало данных»: расход от {money(s.thresholds.minSpend, s)} и от {num(s.thresholds.minImpressions)} показов. <a href="#/settings">Изменить</a>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
