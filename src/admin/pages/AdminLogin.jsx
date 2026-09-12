import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Gamepad2, ShieldCheck } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function AdminLogin() {
  const navigate         = useNavigate();
  const { login, admin } = useAdmin();

  if (admin) { navigate('/admin', { replace: true }); return null; }

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Введите email и пароль'); return; }
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (result.success) navigate('/admin');
      else setError(result.error);
    }, 600);
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">

        <div className="admin-login-logo">
          <Gamepad2 size={24} color="var(--purple-light)" />
          <span>
            <span style={{ color:'#fff' }}>GAME</span>
            <span style={{ color:'var(--purple-light)' }}>ZONE</span>
          </span>
          <span style={{
            fontSize:10, fontWeight:800, background:'var(--purple)',
            color:'#fff', padding:'2px 7px', borderRadius:4,
            textTransform:'uppercase', letterSpacing:1,
          }}>Admin</span>
        </div>

        <h1 className="admin-login-title">Панель управления</h1>
        <p className="admin-login-sub">Войдите для управления магазином</p>

        {error && (
          <div style={{
            padding:'10px 14px', borderRadius:'var(--radius)', marginBottom:16,
            background:'rgba(255,61,85,.12)', border:'1px solid rgba(255,61,85,.3)',
            color:'var(--red)', fontSize:13, display:'flex', gap:8, alignItems:'center',
          }}>
            ⚠ {error}
          </div>
        )}

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-form-label">Email адрес</label>
            <input className="admin-form-input" type="email"
              placeholder="admin@gamezone.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              autoComplete="email" autoFocus />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Пароль</label>
            <div style={{ position:'relative' }}>
              <input className="admin-form-input"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                style={{ paddingRight:44 }}
                autoComplete="current-password" />
              <button type="button" style={{
                position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                background:'none', border:'none', cursor:'pointer',
                color:'var(--text-muted)', display:'flex', alignItems:'center',
              }} onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn--primary btn--lg"
            style={{ width:'100%', justifyContent:'center', marginTop:4 }}
            disabled={loading}>
            {loading
              ? <><span className="checkout-spinner" /> Вход…</>
              : <><ShieldCheck size={16} /> Войти в панель</>
            }
          </button>
        </form>

        <div className="admin-login-hint">
          Данные для входа:<br />
          <code>admin@gamezone.com</code> / <code>admin123</code>
        </div>
      </div>
    </div>
  );
}
