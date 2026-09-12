import { useState } from 'react';
import { CheckCircle, Save } from 'lucide-react';

export default function AdminSettings() {
  const [saved, setSaved] = useState('');

  const handleSave = (section) => {
    setSaved(section);
    setTimeout(() => setSaved(''), 2200);
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Настройки</h1>
          <p className="admin-page-sub">Управление конфигурацией магазина</p>
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

        {/* Информация о магазине */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__title">Информация о магазине</div>
              <div className="admin-card__sub">Основные данные, отображаемые покупателям</div>
            </div>
          </div>
          <div className="admin-card__body">
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label className="admin-form-label">Название магазина</label>
                <input className="admin-form-input" defaultValue="GAMEZONE" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Контактный email</label>
                <input className="admin-form-input" defaultValue="support@gamezone.com" type="email" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Валюта</label>
                <select className="admin-form-select">
                  <option>USD — Доллар США</option>
                  <option>EUR — Евро</option>
                  <option>RUB — Российский рубль</option>
                  <option>KGS — Кыргызский сом</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Часовой пояс</label>
                <select className="admin-form-select">
                  <option>UTC+0 — Лондон</option>
                  <option>UTC+3 — Москва</option>
                  <option>UTC+5 — Бишкек</option>
                  <option>UTC+6 — Алматы</option>
                </select>
              </div>
              <div className="admin-form-group admin-form-grid--full">
                <label className="admin-form-label">Описание магазина</label>
                <textarea className="admin-form-textarea" style={{ minHeight:80 }}
                  defaultValue="Откройте для себя следующую любимую игру. Лучшие цены на лучшие тайтлы — всё в одном месте." />
              </div>
            </div>
            <button className="btn btn--primary btn--sm" style={{ marginTop:16 }}
              onClick={() => handleSave('store')}>
              {saved==='store'
                ? <><CheckCircle size={14} /> Сохранено!</>
                : <><Save size={14} /> Сохранить</>}
            </button>
          </div>
        </div>

        {/* Уведомления */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-card__title">Email уведомления</div>
          </div>
          <div className="admin-card__body">
            {[
              ['Новый заказ',          'Отправлять email при оформлении каждого заказа'],
              ['Новый пользователь',   'Отправлять email при регистрации нового покупателя'],
              ['Изменение статуса',    'Уведомлять покупателя при изменении статуса заказа'],
              ['Ежедневный отчёт',     'Сводка продаж за день — каждое утро'],
            ].map(([label, desc]) => (
              <div key={label} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'12px 0', borderBottom:'1px solid var(--border)',
              }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{label}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>{desc}</div>
                </div>
                <label style={{
                  cursor:'pointer', position:'relative',
                  display:'inline-block', width:40, height:22, flexShrink:0,
                }}>
                  <input type="checkbox" defaultChecked style={{ opacity:0, width:0, height:0 }} />
                  <span style={{
                    position:'absolute', inset:0,
                    background:'var(--purple)', borderRadius:11,
                    transition:'0.2s',
                  }} />
                </label>
              </div>
            ))}
            <button className="btn btn--primary btn--sm" style={{ marginTop:16 }}
              onClick={() => handleSave('notif')}>
              {saved==='notif'
                ? <><CheckCircle size={14} /> Сохранено!</>
                : <><Save size={14} /> Сохранить</>}
            </button>
          </div>
        </div>

        {/* Пароль администратора */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-card__title">Пароль администратора</div>
          </div>
          <div className="admin-card__body">
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label className="admin-form-label">Текущий пароль</label>
                <input className="admin-form-input" type="password" placeholder="••••••••" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Новый пароль</label>
                <input className="admin-form-input" type="password" placeholder="••••••••" />
              </div>
            </div>
            <button className="btn btn--primary btn--sm" style={{ marginTop:16 }}
              onClick={() => handleSave('pass')}>
              {saved==='pass'
                ? <><CheckCircle size={14} /> Обновлено!</>
                : <><Save size={14} /> Обновить пароль</>}
            </button>
          </div>
        </div>

        {/* API */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-card__title">API конфигурация</div>
          </div>
          <div className="admin-card__body">
            <div className="admin-form-grid">
              <div className="admin-form-group admin-form-grid--full">
                <label className="admin-form-label">API игр и новостей</label>
                <input className="admin-form-input"
                  defaultValue="https://6aa122d82703577aa1e353be.mockapi.io"
                  readOnly style={{ opacity:.7 }} />
              </div>
              <div className="admin-form-group admin-form-grid--full">
                <label className="admin-form-label">API заказов</label>
                <input className="admin-form-input"
                  defaultValue="https://6aa50c351397053d42bb6705.mockapi.io"
                  readOnly style={{ opacity:.7 }} />
              </div>
            </div>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:10 }}>
              Эти URL настроены в <code style={{ background:'var(--bg-secondary)', padding:'1px 6px', borderRadius:3, fontSize:11 }}>src/api/api.js</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
