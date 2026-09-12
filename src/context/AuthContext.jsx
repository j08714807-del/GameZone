import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from '../firebase';
import { ordersApi } from '../api/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = loading

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('gamezone_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  /* Заказы из MockAPI */
  const [orders,        setOrders]        = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  /* Слушаем Firebase Auth */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser ?? null);
    });
    return unsub;
  }, []);

  /* Загружаем заказы когда пользователь авторизован */
  const fetchOrders = useCallback(async (email) => {
    if (!email) { setOrders([]); return; }
    setOrdersLoading(true);
    try {
      const data = await ordersApi.getByEmail(email);
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (firebaseUser?.email) fetchOrders(firebaseUser.email);
    else setOrders([]);
  }, [firebaseUser, fetchOrders]);

  /* Сохраняем wishlist */
  useEffect(() => {
    localStorage.setItem('gamezone_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  /* ── Auth actions ── */
  const register = async (name, email, password) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      setFirebaseUser({ ...cred.user, displayName: name });
      return { success: true };
    } catch (err) {
      return { success: false, error: friendlyError(err.code) };
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err) {
      return { success: false, error: friendlyError(err.code) };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setOrders([]);
  };

  /* ── Wishlist ── */
  const toggleWishlist = (game) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === game.id);
      return exists ? prev.filter(item => item.id !== game.id) : [...prev, game];
    });
  };

  const isInWishlist = (gameId) => wishlist.some(item => item.id === gameId);

  /* Нормализованный объект пользователя */
  const user = firebaseUser
    ? {
        uid:      firebaseUser.uid,
        name:     firebaseUser.displayName || firebaseUser.email.split('@')[0],
        email:    firebaseUser.email,
        avatar:   firebaseUser.photoURL || null,
        joinDate: firebaseUser.metadata?.creationTime ?? '',
      }
    : null;

  const loading = firebaseUser === undefined;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      wishlist,
      toggleWishlist,
      isInWishlist,
      orders,
      ordersLoading,
      refetchOrders: () => fetchOrders(firebaseUser?.email),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

function friendlyError(code) {
  const map = {
    'auth/email-already-in-use':   'Этот email уже зарегистрирован.',
    'auth/invalid-email':          'Некорректный email адрес.',
    'auth/weak-password':          'Пароль должен быть не менее 6 символов.',
    'auth/user-not-found':         'Аккаунт с таким email не найден.',
    'auth/wrong-password':         'Неверный пароль.',
    'auth/invalid-credential':     'Неверный email или пароль.',
    'auth/too-many-requests':      'Слишком много попыток. Попробуйте позже.',
    'auth/network-request-failed': 'Ошибка сети. Проверьте соединение.',
  };
  return map[code] ?? 'Что-то пошло не так. Попробуйте снова.';
}
