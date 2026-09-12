import { Link } from 'react-router-dom';
import { Gamepad2, MessageCircle, AtSign, Send, Video, Heart } from 'lucide-react';
import './footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner container">

        {/* Бренд */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <Gamepad2 size={22} className="footer__logo-icon" />
            <span>
              <span className="footer__logo-game">GAME</span>
              <span className="footer__logo-zone">ZONE</span>
            </span>
          </Link>
          <p className="footer__brand-desc">
            Откройте для себя следующую любимую игру. Лучшие цены на лучшие тайтлы — всё в одном месте.
          </p>
          <div className="footer__social">
            <a href="#" className="footer__social-link" aria-label="Discord"><MessageCircle size={18} /></a>
            <a href="#" className="footer__social-link" aria-label="Instagram"><AtSign size={18} /></a>
            <a href="#" className="footer__social-link" aria-label="Twitter"><Send size={18} /></a>
            <a href="#" className="footer__social-link" aria-label="YouTube"><Video size={18} /></a>
          </div>
        </div>

        {/* Навигация */}
        <div className="footer__col">
          <h4 className="footer__col-title">Навигация</h4>
          <ul className="footer__links">
            <li><Link to="/"     className="footer__link">Главная</Link></li>
            <li><Link to="/games" className="footer__link">Игры</Link></li>
            <li><Link to="/games?sort=discount" className="footer__link">Скидки</Link></li>
            <li><Link to="/news" className="footer__link">Новости</Link></li>
            <li><Link to="/games?filter=category" className="footer__link">Категории</Link></li>
          </ul>
        </div>

        {/* Поддержка */}
        <div className="footer__col">
          <h4 className="footer__col-title">Поддержка</h4>
          <ul className="footer__links">
            <li><a href="#" className="footer__link">Центр помощи</a></li>
            <li><a href="#" className="footer__link">Связаться с нами</a></li>
            <li><a href="#" className="footer__link">FAQ</a></li>
            <li><a href="#" className="footer__link">Условия использования</a></li>
            <li><a href="#" className="footer__link">Политика конфиденциальности</a></li>
          </ul>
        </div>

        {/* Аккаунт */}
        <div className="footer__col">
          <h4 className="footer__col-title">Аккаунт</h4>
          <ul className="footer__links">
            <li><Link to="/login"    className="footer__link">Войти</Link></li>
            <li><Link to="/register" className="footer__link">Регистрация</Link></li>
            <li><Link to="/profile"  className="footer__link">Мой профиль</Link></li>
            <li><Link to="/cart"     className="footer__link">Корзина</Link></li>
            <li><Link to="/profile?tab=orders" className="footer__link">Мои заказы</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span>© {year} GAMEZONE. Все права защищены.</span>
          <span className="footer__made">
            Сделано с <Heart size={12} className="footer__heart" /> для геймеров
          </span>
        </div>
      </div>
    </footer>
  );
}
