import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CreditCard, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../api/api';

const PAYMENT_METHODS = [
  { id: 'card',   label: 'Банковская карта', icon: '💳' },
  { id: 'paypal', label: 'PayPal',           icon: '🅿️' },
  { id: 'google', label: 'Google Pay',       icon: 'G'  },
  { id: 'apple',  label: 'Apple Pay',        icon: '🍎' },
];

function validate(fields) {
  const e = {};
  if (!fields.fullName.trim())  e.fullName   = 'Введите имя';
  if (!fields.email.trim())     e.email      = 'Введите email';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) e.email = 'Некорректный email';
  if (!fields.phone.trim())     e.phone      = 'Введите номер телефона';
  if (!fields.address.trim())   e.address    = 'Введите адрес';
  if (!fields.city.trim())      e.city       = 'Введите город';
  if (!fields.postalCode.trim()) e.postalCode = 'Введите индекс';
  return e;
}

export default function Checkout() {
  const navigate      = useNavigate();
  const { cart, getTotal, clearCart } = useCart();
  const { user }      = useAuth();

  const [fields, setFields] = useState({
    fullName:   user?.name  || '',
    email:      user?.email || '',
    phone:      '',
    address:    '',
    city:       '',
    postalCode: '',
  });
  const [payment,    setPayment]    = useState('card');
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState('');

  const subtotal = getTotal();
  const discount = cart.reduce(
    (acc, item) => acc + Math.max(0, (parseFloat(item.oldPrice) - parseFloat(item.price)) * item.quantity), 0
  );
  const total = subtotal;

  const set = (k) => (e) => {
    setFields(f => ({ ...f, [k]: e.target.value }));
    setErrors(er => ({ ...er, [k]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(fields);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setApiError('');
    setSubmitting(true);

    try {
      /* Сохраняем каждый товар как отдельный заказ в MockAPI */
      const now = new Date().toISOString();
      const placedOrders = await Promise.all(
        cart.map(item =>
          ordersApi.create({
            customerName:  fields.fullName,
            email:         fields.email,
            phone:         fields.phone,
            address:       `${fields.address}, ${fields.city}, ${fields.postalCode}`,
            gameId:        String(item.id),
            gameTitle:     item.title,
            gameImage:     item.image || '',
            /* Принудительно используем Number() чтобы не было "19,99" из-за локали */
            price:         Number(parseFloat(item.price).toFixed(2)),
            quantity:      Number(item.quantity),
            total:         Number((parseFloat(item.price) * item.quantity).toFixed(2)),
            status:        'Pending',
            payment,
            createdAt:     now,
            userId:        user?.uid || 'guest',
          })
        )
      );

      const orderData = {
        ...fields,
        payment,
        items:     cart,
        subtotal,
        discount,
        total,
        placedAt:  now,
        orderIds:  placedOrders.map(o => o.id),
      };

      clearCart();
      navigate('/order-confirmation', { state: { orderData } });
    } catch (err) {
      setApiError('Ошибка при оформлении заказа: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-state">
          <div className="empty-state__icon">🛒</div>
          <h3 className="empty-state__title">Корзина пуста</h3>
          <p className="empty-state__sub">Добавьте игры перед оформлением заказа.</p>
          <Link to="/games" className="btn btn--primary">В каталог</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1 className="checkout-page__title">Оформление заказа</h1>

      <div className="checkout-page__layout">

        {/* ── Форма ── */}
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>

          {/* Данные покупателя */}
          <div className="checkout-section">
            <h2 className="checkout-section__title">Данные покупателя</h2>
            <div className="checkout-grid">

              <div className="input-wrapper checkout-grid--full">
                <label className="input-label" htmlFor="co-fullName">Полное имя *</label>
                <input id="co-fullName" className={`input-field ${errors.fullName ? 'error' : ''}`}
                  placeholder="Иван Иванов" autoComplete="name"
                  value={fields.fullName} onChange={set('fullName')} />
                {errors.fullName && <span className="input-error">{errors.fullName}</span>}
              </div>

              <div className="input-wrapper">
                <label className="input-label" htmlFor="co-email">Email адрес *</label>
                <input id="co-email" type="email" className={`input-field ${errors.email ? 'error' : ''}`}
                  placeholder="you@example.com" autoComplete="email"
                  value={fields.email} onChange={set('email')} />
                {errors.email && <span className="input-error">{errors.email}</span>}
              </div>

              <div className="input-wrapper">
                <label className="input-label" htmlFor="co-phone">Номер телефона *</label>
                <input id="co-phone" type="tel" className={`input-field ${errors.phone ? 'error' : ''}`}
                  placeholder="+7 999 123 4567" autoComplete="tel"
                  value={fields.phone} onChange={set('phone')} />
                {errors.phone && <span className="input-error">{errors.phone}</span>}
              </div>

              <div className="input-wrapper checkout-grid--full">
                <label className="input-label" htmlFor="co-address">Адрес *</label>
                <input id="co-address" className={`input-field ${errors.address ? 'error' : ''}`}
                  placeholder="ул. Ленина, 1" autoComplete="street-address"
                  value={fields.address} onChange={set('address')} />
                {errors.address && <span className="input-error">{errors.address}</span>}
              </div>

              <div className="input-wrapper">
                <label className="input-label" htmlFor="co-city">Город *</label>
                <input id="co-city" className={`input-field ${errors.city ? 'error' : ''}`}
                  placeholder="Москва" autoComplete="address-level2"
                  value={fields.city} onChange={set('city')} />
                {errors.city && <span className="input-error">{errors.city}</span>}
              </div>

              <div className="input-wrapper">
                <label className="input-label" htmlFor="co-postal">Почтовый индекс *</label>
                <input id="co-postal" className={`input-field ${errors.postalCode ? 'error' : ''}`}
                  placeholder="123456" autoComplete="postal-code"
                  value={fields.postalCode} onChange={set('postalCode')} />
                {errors.postalCode && <span className="input-error">{errors.postalCode}</span>}
              </div>
            </div>
          </div>

          {/* Способ оплаты */}
          <div className="checkout-section">
            <h2 className="checkout-section__title">Способ оплаты</h2>
            <div className="payment-options">
              {PAYMENT_METHODS.map(m => (
                <button key={m.id} type="button"
                  className={`payment-option ${payment === m.id ? 'payment-option--active' : ''}`}
                  onClick={() => setPayment(m.id)} aria-pressed={payment === m.id}>
                  <span className="payment-option__icon">{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>

            {payment === 'card' && (
              <div className="checkout-grid" style={{ marginTop: 20 }}>
                <div className="input-wrapper checkout-grid--full">
                  <label className="input-label">Номер карты</label>
                  <input className="input-field" placeholder="1234 5678 9012 3456" maxLength={19} />
                </div>
                <div className="input-wrapper">
                  <label className="input-label">Срок действия</label>
                  <input className="input-field" placeholder="ММ / ГГ" maxLength={7} />
                </div>
                <div className="input-wrapper">
                  <label className="input-label">CVV</label>
                  <input className="input-field" placeholder="123" maxLength={4} type="password" />
                </div>
              </div>
            )}
          </div>

          {/* API ошибка */}
          {apiError && (
            <div className="checkout-fs-error">
              <AlertCircle size={15} /> {apiError}
            </div>
          )}

          {/* Кнопка */}
          <button type="submit" className="btn btn--primary btn--lg"
            style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
            {submitting
              ? <><span className="checkout-spinner" /> Обработка платежа…</>
              : <><CreditCard size={18} /> Оплатить ${total.toFixed(2)} и оформить заказ</>
            }
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
            <ShieldCheck size={12} style={{ display: 'inline', marginRight: 4 }} />
            Данные заказа сохраняются и отображаются в вашем профиле
          </p>
        </form>

        {/* ── Состав заказа ── */}
        <div className="order-summary-box">
          <h2 className="order-summary-box__title">Состав заказа</h2>

          <div className="order-summary-box__items">
            {cart.map(item => (
              <div key={item.id} className="order-summary-box__item">
                <img src={item.image} alt={item.title} loading="lazy" />
                <span className="order-summary-box__item-name">
                  {item.title}{item.quantity > 1 ? ` ×${item.quantity}` : ''}
                </span>
                <span className="order-summary-box__item-price">
                  ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="cart-summary__row" style={{ paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <span>Подытог</span><span>${subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="cart-summary__row">
              <span>Вы экономите</span>
              <span style={{ color: 'var(--green)' }}>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="cart-summary__row">
            <span>Доставка</span>
            <span style={{ color: 'var(--green)' }}>Бесплатно</span>
          </div>
          <div className="cart-summary__row cart-summary__row--total">
            <span>Итого</span>
            <span className="cart-summary__total-price">${total.toFixed(2)}</span>
          </div>

          <div className="checkout-email-note">
            � Заказ сохранится в вашем профиле и будет виден в админ-панели
          </div>
        </div>
      </div>
    </div>
  );
}
