import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Gamepad2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate           = useNavigate();
  const { register, user } = useAuth();

  if (user) { navigate('/profile', { replace: true }); return null; }

  const [fields, setFields] = useState({ name:'', email:'', password:'', confirm:'' });
  const [agreedTerms,  setAgreedTerms]  = useState(false);
  const [showPw,       setShowPw]       = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [errors,       setErrors]       = useState({});
  const [submitting,   setSubmitting]   = useState(false);

  const set = (field) => (e) => setFields(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!fields.name.trim())  errs.name     = 'Введите имя';
    if (!fields.email.trim()) errs.email    = 'Введите email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email = 'Некорректный email';
    if (!fields.password)     errs.password = 'Введите пароль';
    else if (fields.password.length < 6)  errs.password = 'Пароль должен быть не менее 6 символов';
    if (fields.password !== fields.confirm) errs.confirm = 'Пароли не совпадают';
    if (!agreedTerms)         errs.terms    = 'Необходимо принять условия использования';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({}); setSubmitting(true);
    const result = await register(fields.name, fields.email, fields.password);
    setSubmitting(false);
    if (result.success) navigate('/profile');
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

        <h1 className="auth-card__title">Создать аккаунт</h1>
        <p className="auth-card__sub">Присоединяйтесь к GAMEZONE</p>

        {errors.general && (
          <div style={{ padding:'10px 14px', borderRadius:'var(--radius)',
            background:'rgba(255,61,85,0.12)', border:'1px solid rgba(255,61,85,0.3)',
            color:'var(--red)', fontSize:13, marginBottom:8 }}>
            {errors.general}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="reg-name">Полное имя</label>
            <input id="reg-name" className={`input-field ${errors.name ? 'error' : ''}`}
              placeholder="Иван Иванов" value={fields.name} onChange={set('name')} autoComplete="name" />
            {errors.name && <span className="input-error">{errors.name}</span>}
          </div>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="reg-email">Email адрес</label>
            <input id="reg-email" type="email" className={`input-field ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com" value={fields.email} onChange={set('email')} autoComplete="email" />
            {errors.email && <span className="input-error">{errors.email}</span>}
          </div>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="reg-password">Пароль</label>
            <div style={{ position:'relative' }}>
              <input id="reg-password" type={showPw ? 'text' : 'password'}
                className={`input-field ${errors.password ? 'error' : ''}`}
                style={{ paddingRight:44 }} placeholder="Мин. 6 символов"
                value={fields.password} onChange={set('password')} autoComplete="new-password" />
              <button type="button" style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', alignItems:'center' }}
                onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="input-error">{errors.password}</span>}
          </div>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="reg-confirm">Подтвердите пароль</label>
            <div style={{ position:'relative' }}>
              <input id="reg-confirm" type={showConfirm ? 'text' : 'password'}
                className={`input-field ${errors.confirm ? 'error' : ''}`}
                style={{ paddingRight:44 }} placeholder="Повторите пароль"
                value={fields.confirm} onChange={set('confirm')} autoComplete="new-password" />
              <button type="button" style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', alignItems:'center' }}
                onClick={() => setShowConfirm(v => !v)}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirm && <span className="input-error">{errors.confirm}</span>}
          </div>

          <div>
            <label className="auth-form__checkbox">
              <input type="checkbox" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)} />
              Я принимаю <a href="#" onClick={e => e.preventDefault()}>Условия использования</a> и{' '}
              <a href="#" onClick={e => e.preventDefault()}>Политику конфиденциальности</a>
            </label>
            {errors.terms && (
              <span className="input-error" style={{ display:'block', marginTop:4 }}>{errors.terms}</span>
            )}
          </div>

          <button type="submit" className="btn btn--primary btn--lg auth-form__submit" disabled={submitting}>
            {submitting ? 'Создание аккаунта…' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="auth-card__footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}
