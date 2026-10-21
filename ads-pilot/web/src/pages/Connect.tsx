import { useState } from 'react';
import { api } from '../api';
import { useApp } from '../ui';

export function ConnectPage() {
  const { status, refreshStatus, toast, bump } = useApp();
  const [busy, setBusy] = useState(false);
  const live = status?.mode === 'live';

  const sync = async () => {
    setBusy(true);
    try {
      await api.sync();
      await refreshStatus();
      bump();
      toast('Данные обновлены');
    } catch (e) {
      toast((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <header className="head">
        <div>
          <h1>Подключения</h1>
          <div className="sub">Один раз настроить — дальше статистика обновляется сама раз в час</div>
        </div>
        <button type="button" className="btn p" onClick={sync} disabled={busy || !live}>
          {busy ? 'Загружаю…' : 'Обновить сейчас'}
        </button>
      </header>

      <div className="row">
        <section className="card pad stack" style={{ flex: '3 1 560px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <h2>Рекламный кабинет Meta</h2>
            <span className={`chip ${live ? 'good' : 'warn'}`}>{live ? 'Подключён' : status?.mode === 'static' ? 'Превью' : 'Демо-данные'}</span>
          </div>
          {live ? (
            <div className="stack small">
              <div><span className="muted">Кабинет:</span> <b>{status?.account.name}</b></div>
              <div><span className="muted">Валюта и пояс:</span> {status?.account.currency} · {status?.account.timezone}</div>
              <div><span className="muted">Последняя синхронизация:</span> {status?.lastSync ? new Date(status.lastSync).toLocaleString('ru-RU') : 'ещё не было'}</div>
              <div className="hint">Загружаются последние 90 полных дней: кампании, группы, объявления и дневная статистика по каждому объявлению с разбивкой по окнам атрибуции.</div>
            </div>
          ) : (
            <ol className="small" style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10, lineHeight: 1.55 }}>
              <li>
                В <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer">Meta for Developers</a> создайте приложение типа «Business» и добавьте продукт Marketing API.
              </li>
              <li>
                В Business Manager создайте системного пользователя, дайте ему доступ к рекламному кабинету и выпустите токен с правами <code>ads_read</code> и <code>ads_management</code>.
              </li>
              <li>
                Впишите в файл <code>.env</code> рядом с приложением:
                <pre style={{ background: 'var(--subtle)', padding: 12, borderRadius: 8, overflowX: 'auto', margin: '8px 0 0' }}>
{`META_ACCESS_TOKEN=ваш_токен
META_AD_ACCOUNT_ID=act_1234567890`}
                </pre>
              </li>
              <li>Перезапустите приложение — демо-данные заменятся вашими.</li>
            </ol>
          )}
        </section>

        <aside className="card pad stack" style={{ flex: '2 1 320px' }}>
          <h2>Что важно знать</h2>
          <div className="small" style={{ lineHeight: 1.55 }}>
            Для своих кабинетов хватает базового уровня доступа к Marketing API — проверка приложения нужна, только если сервисом будут пользоваться чужие люди.
          </div>
          <div className="small" style={{ lineHeight: 1.55 }}>
            Бюджеты Meta хранит в копейках и центах — приложение пересчитывает их само.
          </div>
          <div className="small" style={{ lineHeight: 1.55 }}>
            Токен хранится только на сервере в <code>.env</code> и не попадает в браузер.
          </div>
          <a className="btn" href="#/models">Модели и ключи AI</a>
        </aside>
      </div>
    </>
  );
}
