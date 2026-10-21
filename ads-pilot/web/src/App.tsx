import { useEffect, useState } from 'react';
import { api } from './api';
import { AppProvider, Icon, useApp, useRoute } from './ui';
import { OverviewPage } from './pages/Overview';
import { CampaignsPage } from './pages/Campaigns';
import { LeaderboardPage } from './pages/Leaderboard';
import { AgentPage } from './pages/Agent';
import { ModelsPage } from './pages/Models';
import { SettingsPage } from './pages/Settings';
import { ConnectPage } from './pages/Connect';

const NAV: [string, string][] = [
  ['overview', 'Обзор'],
  ['campaigns', 'Кампании'],
  ['leaderboard', 'Рейтинг'],
  ['agent', 'Агент'],
];
const NAV_BOTTOM: [string, string][] = [
  ['models', 'Модели и права'],
  ['settings', 'Настройки'],
  ['connect', 'Подключения'],
];

function Shell() {
  const [page, arg] = useRoute();
  const { status, version } = useApp();
  const [pending, setPending] = useState(0);

  useEffect(() => {
    api.actions().then((a) => setPending(a.filter((x) => x.status === 'pending').length)).catch(() => undefined);
  }, [version, page]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        window.location.hash = '#/agent';
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const link = ([id, label]: [string, string]) => (
    <a key={id} className={`nav ${page === id ? 'on' : ''}`} href={`#/${id}`} aria-current={page === id ? 'page' : undefined}>
      <Icon name={id} />
      {label}
      {id === 'agent' && pending > 0 && <span className="chip info count">{pending}</span>}
    </a>
  );

  return (
    <div className="app">
      <nav className="side" aria-label="Основное меню">
        <div className="brand">
          <span className="logo">A</span>Ads Pilot
        </div>
        <a className="ask-link" href="#/agent">
          <Icon name="agent" size={16} stroke={2} />
          Спросить агента<span className="kbd">⌘K</span>
        </a>
        {NAV.map(link)}
        <div className="spacer" />
        {NAV_BOTTOM.map(link)}
        <div className="side-foot">
          {status?.mode === 'live' ? status.account.name : status?.mode === 'static' ? 'Превью · демо-данные' : 'Демо-данные'}
          {status?.lastSync && <div>Синхронизация: {new Date(status.lastSync).toLocaleString('ru-RU')}</div>}
        </div>
      </nav>
      {page === 'agent' ? (
        <AgentPage chatId={arg} />
      ) : (
        <main className="main">
          {page === 'campaigns' && <CampaignsPage />}
          {page === 'leaderboard' && <LeaderboardPage />}
          {page === 'models' && <ModelsPage />}
          {page === 'settings' && <SettingsPage />}
          {page === 'connect' && <ConnectPage />}
          {!['campaigns', 'leaderboard', 'models', 'settings', 'connect'].includes(page) && <OverviewPage />}
        </main>
      )}
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
