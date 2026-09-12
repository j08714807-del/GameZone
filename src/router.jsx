import { createBrowserRouter } from 'react-router-dom';

/* ── Public store ── */
import Layout            from './components/layout/Layout';
import Home              from './pages/Home';
import Games             from './pages/Games';
import GameDetails       from './pages/GameDetails';
import Cart              from './pages/Cart';
import Checkout          from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Login             from './pages/Login';
import Register          from './pages/Register';
import Profile           from './pages/Profile';
import News              from './pages/News';
import NewsDetails       from './pages/NewsDetails';

/* ── Admin panel ── */
import AdminLayout   from './admin/components/AdminLayout';
import AdminLogin    from './admin/pages/AdminLogin';
import Dashboard     from './admin/pages/Dashboard';
import AdminGames    from './admin/pages/AdminGames';
import AdminOrders   from './admin/pages/AdminOrders';
import AdminUsers    from './admin/pages/AdminUsers';
import AdminNews     from './admin/pages/AdminNews';
import AdminSettings from './admin/pages/AdminSettings';

export const myRouter = createBrowserRouter([

  /* ── Public store ── */
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true,                element: <Home /> },
      { path: 'games',              element: <Games /> },
      { path: 'games/:slug',        element: <GameDetails /> },
      { path: 'cart',               element: <Cart /> },
      { path: 'checkout',           element: <Checkout /> },
      { path: 'order-confirmation', element: <OrderConfirmation /> },
      { path: 'login',              element: <Login /> },
      { path: 'register',           element: <Register /> },
      { path: 'profile',            element: <Profile /> },
      { path: 'news',               element: <News /> },
      { path: 'news/:slug',         element: <NewsDetails /> },
    ],
  },

  /* ── Admin login (no sidebar) ── */
  { path: '/admin/login', element: <AdminLogin /> },

  /* ── Admin panel (with sidebar layout) ── */
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true,              element: <Dashboard /> },
      { path: 'games',            element: <AdminGames /> },
      { path: 'orders',           element: <AdminOrders /> },
      { path: 'users',            element: <AdminUsers /> },
      { path: 'news',             element: <AdminNews /> },
      { path: 'settings',         element: <AdminSettings /> },
    ],
  },
]);
