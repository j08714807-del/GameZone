import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { User, Package, Heart, Settings, LogOut, Edit3, Mail, CheckCircle, Gamepad2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth, updateProfile } from '../firebase';
import GameCard from '../components/GameCard';

const TABS = [
  { id: 'overview',  label: 'Обзор',        icon: User },
  { id: 'orders',    label: 'Мои заказы',   icon: Package },
  { id: 'wishlist',  label: 'Избранное',    icon: Heart },
  { id: 'settings',  label: 'Настройки',    icon: Settings },
];

export default function Profile() {
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();
  const { user, logout, orders, ordersLoading, wishlist } = useAuth();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

  useEffect(() => {
    if (user === null) navigate('/login', { replace: true, state: { from: { pathname: '/profile' } } });
  }, [user, navigate]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  if (!user) return null;

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <div className="profile-page container">
      <aside className="profile-sidebar">
        <div className="profile-sidebar__header">
          <div className="profile-sidebar__avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div className="profile-sidebar__name">{user.name}</div>
          <div className="profile-sidebar__email">{user.email}</div>
        </div>
        <nav className="profile-sidebar__nav" aria-label="Навигация профиля">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id}
              className={`profile-sidebar__nav-item ${activeTab === id ? 'profile-sidebar__nav-item--active' : ''}`}
              onClick={() => setActiveTab(id)}>
              <Icon size={15} /> {label}
            </button>
          ))}
          <div className="profile-sidebar__divider" />
          <button className="profile-sidebar__nav-item profile-sidebar__nav-item--danger" onClick={handleLogout}>
            <LogOut size={15} /> Выйти
          </button>
        </nav>
      </aside>

      <div className="profile-content">
        {activeTab === 'overview'  && <OverviewTab  user={user} orders={orders} ordersLoading={ordersLoading} wishlist={wishlist} />}
        {activeTab === 'orders'    && <OrdersTab    orders={orders} loading={ordersLoading} />}
        {activeTab === 'wishlist'  && <WishlistTab  wishlist={wishlist} />}
        {activeTab === 'settings'  && <SettingsTab  user={user} />}
      </div>
    </div>
  );
}

function OverviewTab({ user, orders, ordersLoading, wishlist }) {
  const delivered = orders.filter(o => (o.status === 'Delivered' || o.status === 'Доставлен')).length;
  return (
    <>
      <div className="profile-section">
        <h2 className="profile-section__title">Мой профиль</h2>
        <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:28, flexWrap:'wrap' }}>
          <div className="profile-sidebar__avatar" style={{ width:72, height:72, fontSize:28, flexShrink:0 }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>{user.name}</div>
            <div style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text-muted)', fontSize:13 }}>
              <Mail size={13} /> {user.email}
            </div>
            {user.joinDate && (
              <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>
                На сайте с {new Date(user.joinDate).toLocaleDateString('ru-RU', { month:'long', year:'numeric' })}
              </div>
            )}
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16 }}>
          {[
            { label:'Заказов',   value: ordersLoading ? '…' : orders.length },
            { label:'Избранных',  value: wishlist.length },
            { label:'Доставлено', value: ordersLoading ? '…' : delivered },
          ].map(({ label, value }) => (
            <div key={label} style={{ background:'var(--bg-secondary)', border:'1px solid var(--border)',
              borderRadius:'var(--radius)', padding:16, textAlign:'center' }}>
              <div style={{ fontSize:28, fontWeight:800, color:'var(--purple-light)', fontFamily:'Rajdhani, sans-serif' }}>{value}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="profile-section">
        <h2 className="profile-section__title">Последние заказы</h2>
        {ordersLoading
          ? <p style={{ color:'var(--text-muted)', fontSize:14 }}>Загрузка заказов…</p>
          : <OrdersTable orders={orders.slice(0, 3)} />
        }
      </div>
    </>
  );
}

function OrdersTab({ orders, loading }) {
  return (
    <div className="profile-section">
      <h2 className="profile-section__title">Мои заказы</h2>
      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:44, borderRadius:'var(--radius)' }} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🎮</div>
          <h3 className="empty-state__title">Заказов пока нет</h3>
          <p className="empty-state__sub">История ваших заказов появится здесь.</p>
          <Link to="/games" className="btn btn--primary">В каталог</Link>
        </div>
      ) : (
        <OrdersTable orders={orders} />
      )}
    </div>
  );
}

function OrdersTable({ orders }) {
  const statusLabel = {
    Delivered: 'Доставлен', Pending: 'В обработке', Cancelled: 'Отменён',
    Доставлен: 'Доставлен', 'В обработке': 'В обработке', Отменён: 'Отменён',
  };
  const statusClass = {
    Delivered: 'order-status--delivered', Pending: 'order-status--pending', Cancelled: 'order-status--cancelled',
    Доставлен: 'order-status--delivered', 'В обработке': 'order-status--pending', Отменён: 'order-status--cancelled',
  };

  /* Нормализуем поля — MockAPI может вернуть разные имена */
  const normalise = (o) => ({
    id:     o.id,
    game:   o.gameTitle || o.game || '—',
    date:   o.createdAt ? o.createdAt.split('T')[0] : (o.date || '—'),
    status: o.status || 'Pending',
    price:  parseFloat(o.total || o.price || 0),
  });

  if (orders.length === 0) {
    return <p style={{ color:'var(--text-muted)', fontSize:14 }}>Заказов пока нет.</p>;
  }

  return (
    <div style={{ overflowX:'auto' }}>
      <table className="orders-table">
        <thead>
          <tr><th>Игра</th><th>Дата</th><th>Статус</th><th>Сумма</th></tr>
        </thead>
        <tbody>
          {orders.map(o => {
            const n = normalise(o);
            return (
              <tr key={n.id}>
                <td style={{ color:'var(--text-primary)', fontWeight:500 }}>{n.game}</td>
                <td>{n.date}</td>
                <td><span className={`order-status ${statusClass[n.status] || 'order-status--pending'}`}>{statusLabel[n.status] || n.status}</span></td>
                <td style={{ color:'var(--purple-light)', fontWeight:600 }}>${n.price.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function WishlistTab({ wishlist }) {
  if (wishlist.length === 0) {
    return (
      <div className="profile-section">
        <h2 className="profile-section__title">Избранное</h2>
        <div className="empty-state">
          <div className="empty-state__icon">♡</div>
          <h3 className="empty-state__title">Список избранного пуст</h3>
          <p className="empty-state__sub">Сохраняйте понравившиеся игры, нажав на иконку сердца.</p>
          <Link to="/games" className="btn btn--primary">Найти игры</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="profile-section">
      <h2 className="profile-section__title">Избранное ({wishlist.length})</h2>
      <div className="wishlist-grid">
        {wishlist.map(game => <GameCard key={game.id} game={game} />)}
      </div>
    </div>
  );
}

function SettingsTab({ user }) {
  const [name,      setName]      = useState(user.name);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true); setSaveError('');
    try {
      if (auth.currentUser) await updateProfile(auth.currentUser, { displayName: name.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveError('Не удалось сохранить. Попробуйте снова.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-section">
      <h2 className="profile-section__title">Настройки аккаунта</h2>
      <form className="settings-form" onSubmit={handleSave}>
        <div className="settings-form__row">
          <div className="input-wrapper">
            <label className="input-label" htmlFor="settings-name">Отображаемое имя</label>
            <input id="settings-name" className="input-field" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="input-wrapper">
            <label className="input-label">Email адрес</label>
            <input className="input-field" type="email" value={user.email} disabled
              style={{ opacity:0.6, cursor:'not-allowed' }} />
          </div>
        </div>
        <div style={{ borderTop:'1px solid var(--border)', paddingTop:20, marginTop:8 }}>
          <h3 style={{ fontSize:15, fontWeight:600, marginBottom:12, color:'var(--text-primary)' }}>Пароль</h3>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:12 }}>
            Для смены пароля воспользуйтесь ссылкой «Забыли пароль?» на странице входа.
          </p>
          <Link to="/login" className="btn btn--secondary btn--sm">Сменить пароль</Link>
        </div>
        {saveError && (
          <div style={{ padding:'10px 14px', borderRadius:'var(--radius)', background:'rgba(255,61,85,.12)',
            border:'1px solid rgba(255,61,85,.3)', color:'var(--red)', fontSize:13 }}>
            {saveError}
          </div>
        )}
        <div>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saved ? <><CheckCircle size={15} /> Сохранено!</> : saving ? 'Сохранение…' : <><Edit3 size={15} /> Сохранить изменения</>}
          </button>
        </div>
      </form>
    </div>
  );
}
