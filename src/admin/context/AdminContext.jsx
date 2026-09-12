import { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

/* Hardcoded admin credentials */
const ADMIN_CREDENTIALS = { email: 'admin@gamezone.com', password: 'admin123' };

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try {
      const s = localStorage.getItem('gz_admin');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (admin) localStorage.setItem('gz_admin', JSON.stringify(admin));
    else localStorage.removeItem('gz_admin');
  }, [admin]);

  const login = (email, password) => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const a = { email, name: 'Admin', role: 'superadmin', loginAt: Date.now() };
      setAdmin(a);
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const logout = () => setAdmin(null);

  return (
    <AdminContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
};
