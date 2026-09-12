import { RouterProvider } from 'react-router-dom';
import { CartProvider }             from './context/CartContext';
import { AuthProvider, useAuth }    from './context/AuthContext';
import { AdminProvider }            from './admin/context/AdminContext';
import { myRouter }                 from './router';

function AppInner() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--bg-main)',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 48, height: 48, border: '3px solid var(--border)',
          borderTopColor: 'var(--purple)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading…</span>
      </div>
    );
  }

  return <RouterProvider router={myRouter} />;
}

export default function App() {
  return (
    <AdminProvider>
      <AuthProvider>
        <CartProvider>
          <AppInner />
        </CartProvider>
      </AuthProvider>
    </AdminProvider>
  );
}
