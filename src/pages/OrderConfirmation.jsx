import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm, ValidationError } from '@formspree/react';
import { CheckCircle, ShoppingBag, Home, Mail, MessageSquare, Send } from 'lucide-react';

export default function OrderConfirmation() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const orderData  = location.state?.orderData;

  /* Formspree hook */
  const [state, handleSubmit] = useForm('mbgjpekp');

  /* If someone navigates here directly without placing an order → back to home */
  useEffect(() => {
    if (!orderData) navigate('/', { replace: true });
  }, [orderData, navigate]);

  if (!orderData) return null;

  /* ── After Formspree confirms message sent ── */
  if (state.succeeded) {
    return (
      <div className="order-confirm-page">
        <div className="order-confirm-card order-confirm-card--sent">
          <div className="order-confirm-card__icon order-confirm-card__icon--green">
            <Mail size={36} />
          </div>
          <h2 className="order-confirm-card__title">Сообщение отправлено!</h2>
          <p className="order-confirm-card__sub">
            Спасибо, что написали — мы ответим на <strong>{orderData.email}</strong> в ближайшее время.
          </p>
          <div className="order-confirm-card__actions">
            <Link to="/" className="btn btn--primary btn--lg">
              <Home size={18} /> На главную
            </Link>
            <Link to="/games" className="btn btn--ghost btn--lg">
              <ShoppingBag size={18} /> Продолжить покупки
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirm-page">

      {/* ── Success banner ── */}
      <div className="order-confirm-banner">
        <div className="order-confirm-banner__icon">
          <CheckCircle size={48} />
        </div>
        <div className="order-confirm-banner__text">
          <h1 className="order-confirm-banner__title">Заказ успешно оформлен!</h1>
          <p className="order-confirm-banner__sub">
            Спасибо, <strong>{orderData.fullName}</strong>! Ваш заказ получен и находится в обработке.
            Подтверждение будет отправлено на <strong>{orderData.email}</strong>.
          </p>
        </div>
      </div>

      <div className="order-confirm-layout">

        {/* ── Order summary ── */}
        <div className="order-confirm-summary">
          <h2 className="order-confirm-summary__title">Ваш заказ</h2>

          <div className="order-confirm-items">
            {orderData.items.map(item => (
              <div key={item.id} className="order-confirm-item">
                <img src={item.image} alt={item.title} loading="lazy" />
                <div className="order-confirm-item__info">
                  <span className="order-confirm-item__name">{item.title}</span>
                  <span className="order-confirm-item__qty">Кол-во: {item.quantity}</span>
                </div>
                <span className="order-confirm-item__price">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="order-confirm-summary__totals">
            <div className="order-confirm-summary__row">
              <span>Подытог</span>
              <span>${orderData.subtotal.toFixed(2)}</span>
            </div>
            {orderData.discount > 0 && (
              <div className="order-confirm-summary__row">
                <span>Скидка</span>
                <span style={{ color: 'var(--green)' }}>-${orderData.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="order-confirm-summary__row">
              <span>Доставка</span>
              <span style={{ color: 'var(--green)' }}>Бесплатно</span>
            </div>
            <div className="order-confirm-summary__row order-confirm-summary__row--total">
              <span>Итого оплачено</span>
              <span>${orderData.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="order-confirm-summary__address">
            <h3>Адрес доставки</h3>
            <p>{orderData.fullName}</p>
            <p>{orderData.address}, {orderData.city} {orderData.postalCode}</p>
            <p>{orderData.phone}</p>
          </div>

          <div className="order-confirm-summary__actions">
            <Link to="/" className="btn btn--ghost">
              <Home size={16} /> Главная
            </Link>
            <Link to="/games" className="btn btn--secondary">
              <ShoppingBag size={16} /> Продолжить покупки
            </Link>
          </div>
        </div>

        {/* ── Contact / feedback form (Formspree) ── */}
        <div className="order-confirm-contact">
          <div className="order-confirm-contact__header">
            <MessageSquare size={22} className="order-confirm-contact__icon" />
            <div>
              <h2 className="order-confirm-contact__title">Вопросы по заказу?</h2>
              <p className="order-confirm-contact__sub">
                Напишите нам — ответим в течение 24 часов.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="contact-form" noValidate>

            {/* Hidden field — pass order context to Formspree inbox */}
            <input type="hidden" name="order_total"   value={`$${orderData.total.toFixed(2)}`} />
            <input type="hidden" name="order_items"
              value={orderData.items.map(i => `${i.title} ×${i.quantity}`).join(', ')} />

            {/* Email — pre-filled from checkout */}
            <div className="input-wrapper">
              <label className="input-label" htmlFor="cf-email">
                <Mail size={13} /> Электронная почта
              </label>
              <input
                id="cf-email"
                type="email"
                name="email"
                className="input-field"
                defaultValue={orderData.email}
                placeholder="ваш@email.com"
                required
              />
              <ValidationError prefix="Email" field="email" errors={state.errors}
                className="input-error" />
            </div>

            {/* Subject */}
            <div className="input-wrapper">
              <label className="input-label" htmlFor="cf-subject">Тема</label>
              <input
                id="cf-subject"
                type="text"
                name="subject"
                className="input-field"
                placeholder="Вопрос по моему заказу…"
                defaultValue={`Запрос по заказу от ${orderData.fullName}`}
              />
            </div>

            {/* Message */}
            <div className="input-wrapper">
              <label className="input-label" htmlFor="cf-message">
                <MessageSquare size={13} /> Сообщение
              </label>
              <textarea
                id="cf-message"
                name="message"
                className="input-field contact-form__textarea"
                placeholder="Здравствуйте, у меня вопрос по моему недавнему заказу…"
                required
                rows={5}
              />
              <ValidationError prefix="Message" field="message" errors={state.errors}
                className="input-error" />
            </div>

            {/* General form error */}
            {state.errors?.length > 0 && !state.errors.find(e => e.field) && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--radius)',
                background: 'rgba(255,61,85,0.12)', border: '1px solid rgba(255,61,85,0.3)',
                color: 'var(--red)', fontSize: 13,
              }}>
                Произошла ошибка. Попробуйте ещё раз.
              </div>
            )}

            <button
              type="submit"
              className="btn btn--primary btn--lg"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={state.submitting}
            >
              {state.submitting
                ? 'Отправка…'
                : <><Send size={16} /> Отправить сообщение</>
              }
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
