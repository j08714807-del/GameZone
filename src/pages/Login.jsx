import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Gamepad2, GitBranch, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate        = useNavigate();
  const location        = useLocation();
  const { login, user } = useAuth();

  const from = location.state?.from?.pathname || '/profile';
  if (user) { navigate(from, { replace: true }); return null; }

  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [remember,   setRemember]   = useState(false);
  const [showPw,     setShowPw]     = useState(false);
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email.trim())  errs.email    = 'Введите email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Некорректный email';
    if (!password)      errs.password = 'Введите пароль';
    else if (password.length < 6) errs.password = 'Пароль должен быть не менее 6 символов';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.success) navigate(from, { replace: true });
    else setErrors({ general: result.error });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <Link to="/" className="auth-card__logo">
          <Gamepad2 size={22} className="auth-card__logo-icon" />
          <span className="auth-card__logo-game">GAME</span>
          <span className="auth-card__logo-zone">ZONE</span>
        </Link>

        <h1 className="auth-card__title">Добро пожаловать!</h1>
        <p className="auth-card__sub">Войдите в свой аккаунт</p>

        {errors.general && (
          <div style={{ padding:'10px 14px', borderRadius:'var(--radius)',
            background:'rgba(255,61,85,0.12)', border:'1px solid rgba(255,61,85,0.3)',
            color:'var(--red)', fontSize:13, marginBottom:8 }}>
            {errors.general}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="input-wrapper">
            <label className="input-label" htmlFor="login-email">Email адрес</label>
            <input id="login-email" type="email"
              className={`input-field ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            {errors.email && <span className="input-error">{errors.email}</span>}
          </div>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="login-password">Пароль</label>
            <div style={{ position:'relative' }}>
              <input id="login-password" type={showPw ? 'text' : 'password'}
                className={`input-field ${errors.password ? 'error' : ''}`}
                style={{ paddingRight:44 }} placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                autoComplete="current-password" />
              <button type="button" style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', alignItems:'center' }}
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Скрыть пароль' : 'Показать пароль'}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="input-error">{errors.password}</span>}
          </div>

          <div className="auth-form__options">
            <label className="auth-form__remember">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
              Запомнить меня
            </label>
            <a href="#" className="auth-form__forgot">Забыли пароль?</a>
          </div>

          <button type="submit" className="btn btn--primary btn--lg auth-form__submit" disabled={submitting}>
            {submitting ? 'Вход…' : 'Войти'}
          </button>
        </form>

        <div className="auth-divider">или продолжить через</div>

        <div className="auth-social">
          <button className="auth-social__btn" type="button"><GitBranch size={16} /> GitHub</button>
          <button className="auth-social__btn" type="button"><Mail size={16} /> Google</button>
          <button className="auth-social__btn" type="button"><span style={{ fontWeight:800, fontSize:14 }}>D</span> Discord</button>
        </div>

        <p className="auth-card__footer">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}
