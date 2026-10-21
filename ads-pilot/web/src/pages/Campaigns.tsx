import { useState } from 'react';
import { api } from '../api';
import { money, num } from '../../../shared/format';
import type { ActionRecord, Period, TreeNode } from '../../../shared/types';
import { ErrorBox, Icon, Loading, Seg, Switch, useApp, useLoad } from '../ui';

type Filter = 'all' | 'active' | 'problems';

function hasProblem(n: TreeNode): boolean {
  return !!n.problem || n.children.some(hasProblem);
}

export function actionText(a: ActionRecord, s: Parameters<typeof money>[1]): string {
  if (a.kind === 'budget') return `Бюджет «${a.targetName}»: ${money(a.before, s)} → ${money(a.after, s)}`;
  return `${a.kind === 'pause' ? 'Пауза' : 'Включение'} «${a.targetName}»`;
}

export function ActionStatus({ a }: { a: ActionRecord }) {
  const map: Record<ActionRecord['status'], [string, string]> = {
    pending: ['info', 'Ждёт подтверждения'],
    applied: ['good', 'Применено'],
    rejected: ['', 'Отклонено'],
    failed: ['bad', 'Ошибка'],
  };
  const [cls, label] = map[a.status];
  return <span className={`chip ${cls}`} title={a.result}>{label}</span>;
}

export function CampaignsPage() {
  const { settings: s, toast, bump } = useApp();
  const [period, setPeriod] = useState<Period>(7);
  const [filter, setFilter] = useState<Filter>('active');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [budgets, setBudgets] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState<{ n: TreeNode; next: number } | null>(null);
  const { data: nodes, error } = useLoad(() => api.campaigns(period), [period]);
  const { data: actions } = useLoad(() => api.actions(), []);

  if (error) return <ErrorBox error={error} />;
  if (!nodes) return <Loading />;

  const isOpen = (id: string, def: boolean) => open[id] ?? def;
  const toggleOpen = (id: string, def: boolean) => setOpen((o) => ({ ...o, [id]: !(o[id] ?? def) }));

  const setStatus = async (n: TreeNode, on: boolean) => {
    try {
      const a = await api.setStatus(n.id, on ? 'ACTIVE' : 'PAUSED');
      if (a.status === 'failed') throw new Error(a.result);
      toast(`${on ? 'Включено' : 'На паузе'}: ${n.name}`);
      bump();
    } catch (e) {
      toast((e as Error).message, true);
    }
  };

  const saveBudget = async (n: TreeNode) => {
    const raw = budgets[n.id];
    if (raw === undefined) return;
    const next = Number(raw.replace(/\s/g, '').replace(',', '.'));
    setBudgets(({ [n.id]: _drop, ...rest }) => rest);
    if (!Number.isFinite(next) || next <= 0 || next === n.dailyBudget) return;
    if (n.dailyBudget && Math.abs(next / n.dailyBudget - 1) > 0.5) {
      setConfirm({ n, next });
      return;
    }
    await commitBudget(n, next);
  };

  const commitBudget = async (n: TreeNode, next: number) => {
    setConfirm(null);
    try {
      const a = await api.setBudget(n.id, next);
      if (a.status === 'failed') throw new Error(a.result);
      toast(`Бюджет «${n.name}»: ${money(next, s)}`);
      bump();
    } catch (e) {
      toast((e as Error).message, true);
    }
  };

  const visible = nodes.filter((c) => (filter === 'all' ? true : filter === 'active' ? c.status === 'ACTIVE' : hasProblem(c)));
  const problems = nodes.filter(hasProblem).length;

  const renderRow = (n: TreeNode, depth: number): React.ReactNode[] => {
    const expandable = n.children.length > 0;
    const def = depth === 0 && n.status === 'ACTIVE';
    const exp = isOpen(n.id, def || (depth === 1 && hasProblem(n)));
    const chip = n.problem
      ? n.problem === 'На проверке'
        ? <span className="chip info">{n.problem}</span>
        : <span className={`chip ${n.problem === 'Есть проблемы' ? 'warn' : 'bad'}`}>{n.problem}</span>
      : n.status === 'ACTIVE'
        ? <span className="chip good">{n.kind === 'ad' ? 'Активно' : 'Активна'}</span>
        : <span className="chip">Пауза</span>;
    const row = (
      <tr key={n.id}>
        <td className="l">
          <Switch on={n.status === 'ACTIVE'} label={`${n.status === 'ACTIVE' ? 'Выключить' : 'Включить'} ${n.name}`} onChange={(v) => setStatus(n, v)} disabled={n.review === 'rejected'} />
        </td>
        <td className="l" style={{ paddingLeft: 14 + depth * 28 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {expandable ? (
              <button type="button" className="linkbtn" aria-expanded={exp} aria-label={exp ? 'Свернуть' : 'Развернуть'} onClick={() => toggleOpen(n.id, def)} style={{ color: 'var(--muted)', minHeight: 28 }}>
                <Icon name={exp ? 'chevron' : 'chevronR'} size={14} stroke={2.4} />
              </button>
            ) : (
              <span style={{ width: 14 }} />
            )}
            {depth === 0 ? <b>{n.name}</b> : n.name}
            {depth === 0 && n.protected && (
              <span className="chip" title="Агенту менять нельзя — метка из «Модели и права»">
                <Icon name="lock" size={12} stroke={2.4} />агенту нельзя
              </span>
            )}
          </span>
        </td>
        <td>
          {n.dailyBudget !== null ? (
            <input
              className="bud"
              aria-label={`Дневной бюджет ${n.name}`}
              value={budgets[n.id] ?? String(Math.round(n.dailyBudget * (s.display.rate || 1)))}
              onChange={(e) => setBudgets((b) => ({ ...b, [n.id]: e.target.value }))}
              onBlur={() => saveBudget(n)}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              disabled={s.display.rate !== 1}
              title={s.display.rate !== 1 ? 'Бюджет меняется в валюте кабинета — переключите показ на неё' : undefined}
            />
          ) : (
            <span className="muted small">{n.kind === 'ad' ? '' : 'на кампании'}</span>
          )}
        </td>
        <td>{money(n.m.spend, s)}</td>
        <td><b>{num(n.m.roas, 2)}</b></td>
        <td style={n.problem === 'CPA выше цели' ? { color: 'var(--bad)', fontWeight: 600 } : undefined}>{money(n.m.cpa, s)}</td>
        <td>{num(n.m.conversions)}</td>
        <td className="l">{chip}</td>
      </tr>
    );
    return [row, ...(exp ? n.children.flatMap((ch) => renderRow(ch, depth + 1)) : [])];
  };

  const recent = (actions ?? []).slice(0, 6);

  return (
    <>
      <header className="head">
        <div>
          <h1>Кампании</h1>
          <div className="sub">Включение и бюджет меняются сразу — и в Meta, и здесь. Каждое изменение попадает в журнал.</div>
        </div>
        <Seg label="Период" value={period} onChange={setPeriod} options={[[7, '7 дней'], [30, '30 дней'], [90, '90 дней']]} />
      </header>

      <Seg
        label="Фильтр"
        value={filter}
        onChange={setFilter}
        options={[['all', 'Все'], ['active', 'Активные'], ['problems', `С проблемами · ${problems}`]]}
      />

      {confirm && (
        <div className="banner" role="alertdialog" aria-label="Подтверждение бюджета" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ flex: '1 1 260px' }}>
            Бюджет «{confirm.n.name}» меняется больше чем на 50%: {money(confirm.n.dailyBudget, s)} → {money(confirm.next, s)}. Резкий скачок может вернуть группы в обучение.
          </span>
          <button type="button" className="btn p sm" onClick={() => commitBudget(confirm.n, confirm.next)}>Изменить</button>
          <button type="button" className="btn sm" onClick={() => setConfirm(null)}>Отмена</button>
        </div>
      )}

      <section className="card" style={{ overflow: 'hidden' }}>
        <div className="table-wrap">
          <table style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th className="l">Вкл</th>
                <th className="l">Название</th>
                <th>Бюджет / день</th>
                <th>Расход</th>
                <th>ROAS</th>
                <th>CPA</th>
                <th>Конверсии</th>
                <th className="l">Статус</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td className="l muted" colSpan={8}>Ничего не найдено по фильтру.</td>
                </tr>
              ) : (
                visible.flatMap((c) => renderRow(c, 0))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card pad stack">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Последние изменения</h2>
          <a href="#/agent" className="small">Очередь агента</a>
        </div>
        {recent.length === 0 ? (
          <div className="muted small">Пока ничего не меняли.</div>
        ) : (
          recent.map((a) => (
            <div key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid var(--line-soft)', paddingTop: 10 }}>
              <ActionStatus a={a} />
              <span style={{ flex: '1 1 260px' }}>{actionText(a, s)}</span>
              <span className="tiny muted">
                {a.source === 'agent' ? 'Агент' : a.source === 'rule' ? 'Правило' : 'Вы'} · {new Date(a.createdAt).toLocaleString('ru-RU')}
              </span>
            </div>
          ))
        )}
      </section>
    </>
  );
}
