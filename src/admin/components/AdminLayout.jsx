import { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Gamepad2, ShoppingBag, Users,
  Newspaper, Settings, LogOut, Menu, X,
  ExternalLink, ChevronRight, Bell,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const NAV = [
  {
    label: 'Основное',
    items: [
      { to: '/admin',          label: 'Дашборд',  icon: LayoutDashboard, end: true },
      { to: '/admin/games',    label: 'Игры',     icon: Gamepad2 },
      { to: '/admin/orders',   label: 'Заказы',   icon: ShoppingBag },
      { to: '/admin/users',    label: 'Пользователи', icon: Users },
      { to: '/admin/news',     label: 'Новости',  icon: Newspaper },
    ],
  },
  {
    label: 'Система',
    items: [
      { to: '/admin/settings', label: 'Настройки', icon: Settings },
    ],
  },
];

const PAGE_NAMES = {
  '/admin':           'Дашборд',
  '/admin/games':     'Игры',
  '/admin/orders':    'Заказы',
  '/admin/users':     'Пользователи',
  '/admin/news':      'Новости',
  '/admin/settings':  'Настройки',
};

export default function AdminLayout() {
  const { admin, logout } = useAdmin();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login', { replace: true });
    }
  }, [admin, navigate]);

  if (!admin) return null;

  const pageName = PAGE_NAMES[location.pathname] ?? 'Admin';

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-app">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:199 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <Link to="/admin" className="admin-sidebar__logo">
          <Gamepad2 size={20} color="var(--purple-light)" />
          <span className="admin-sidebar__logo-text">
            <span className="admin-sidebar__logo-game">GAME</span>
            <span className="admin-sidebar__logo-zone">ZONE</span>
          </span>
          <span className="admin-sidebar__logo-badge">Admin</span>
        </Link>

        <nav style={{ flex:1, overflowY:'auto' }}>
          {NAV.map(group => (
            <div key={group.label} className="admin-sidebar__section">
              <div className="admin-sidebar__section-label">{group.label}</div>
              {group.items.map(({ to, label, icon: Icon, badge, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `admin-nav-item ${isActive ? 'admin-nav-item--active' : ''}`
                  }
                >
                  <Icon size={15} />
                  {label}
                  {badge && <span className="admin-nav-item__badge">{badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar__bottom">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__avatar">A</div>
            <div>
              <div className="admin-sidebar__user-name">{admin.name}</div>
              <div className="admin-sidebar__user-role">{admin.role}</div>
            </div>
          </div>
          <button className="admin-nav-item admin-nav-item--danger" onClick={handleLogout}>
            <LogOut size={15} /> Выйти
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="admin-main">

        {/* Topbar */}
        <header className="admin-topbar">
          <button
            className="admin-topbar__toggle"
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="admin-topbar__breadcrumb">
            <span>Admin</span>
            <ChevronRight size={12} />
            <span className="admin-topbar__breadcrumb-current">{pageName}</span>
          </div>

          <div className="admin-topbar__right">
            <span className="admin-topbar__time">
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>

            <Link to="/" target="_blank" className="admin-topbar__view-site">
              <ExternalLink size={12} /> На сайт
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
