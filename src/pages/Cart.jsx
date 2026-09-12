import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, getTotal, getItemCount } = useCart();

  const subtotal = getTotal();
  const discount = cart.reduce((acc, item) => {
    const saved = (parseFloat(item.oldPrice) - parseFloat(item.price)) * item.quantity;
    return acc + (saved > 0 ? saved : 0);
  }, 0);
  const total = subtotal;

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <h1 className="cart-page__title">Корзина</h1>
        <div className="empty-state">
          <div className="empty-state__icon">🛒</div>
          <h3 className="empty-state__title">Корзина пуста</h3>
          <p className="empty-state__sub">Начните покупки и откройте для себя следующую любимую игру.</p>
          <Link to="/games" className="btn btn--primary btn--lg">
            <ShoppingBag size={18} /> Перейти в каталог
          </Link>
        </div>
      </div>
    );
  }

  const count = getItemCount();
  return (
    <div className="cart-page">
      <h1 className="cart-page__title">Корзина</h1>
      <p className="cart-page__sub">{count} {count === 1 ? 'товар' : count < 5 ? 'товара' : 'товаров'} в корзине</p>

      <div className="cart-page__layout">
        <div>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <Link to={`/games/${item.slug || item.id}`}>
                  <img src={item.image} alt={item.title} className="cart-item__img" loading="lazy" />
                </Link>
                <div className="cart-item__info">
                  <div className="cart-item__title">
                    <Link to={`/games/${item.slug || item.id}`}>{item.title}</Link>
                  </div>
                  <div className="cart-item__category">{item.category}</div>
                  <div className="cart-item__prices">
                    <span className="cart-item__price">${parseFloat(item.price).toFixed(2)}</span>
                    {parseFloat(item.oldPrice) > parseFloat(item.price) && (
                      <span className="cart-item__old-price">${parseFloat(item.oldPrice).toFixed(2)}</span>
                    )}
                    {item.discount > 0 && (
                      <span className="badge badge--green">-{item.discount}%</span>
                    )}
                  </div>
                </div>
                <div className="cart-item__actions">
                  <div className="cart-item__qty">
                    <button className="cart-item__qty-btn" onClick={() => decreaseQuantity(item.id)} aria-label="Уменьшить">
                      <Minus size={13} />
                    </button>
                    <span className="cart-item__qty-val">{item.quantity}</span>
                    <button className="cart-item__qty-btn" onClick={() => increaseQuantity(item.id)} aria-label="Увеличить">
                      <Plus size={13} />
                    </button>
                  </div>
                  <button className="cart-item__remove" onClick={() => removeFromCart(item.id)} aria-label={`Удалить ${item.title}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <Link to="/games" className="btn btn--ghost btn--sm">← Продолжить покупки</Link>
          </div>
        </div>

        <div className="cart-summary">
          <h2 className="cart-summary__title">Итог заказа</h2>
          {cart.map(item => (
            <div key={item.id} className="cart-summary__row">
              <span style={{ color: 'var(--text-secondary)' }}>{item.title} × {item.quantity}</span>
              <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="cart-summary__row" style={{ marginTop: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <span>Подытог</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="cart-summary__row">
              <span>Вы экономите</span>
              <span className="cart-summary__discount">-${discount.toFixed(2)}</span>
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
          <button className="btn btn--primary btn--lg cart-summary__btn" onClick={() => navigate('/checkout')}>
            Оформить заказ <ArrowRight size={18} />
          </button>
          <div className="cart-summary__note">
            <ShieldCheck size={13} style={{ display: 'inline', marginRight: 4, color: 'var(--green)' }} />
            Безопасная оплата · Шифрование 256-bit
          </div>
        </div>
      </div>
    </div>
  );
}
