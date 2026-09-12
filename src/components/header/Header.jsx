import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Search, ShoppingCart, Heart, User, Menu, X,
  ChevronDown, LogOut, Settings, Package, Gamepad2
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { gamesApi } from '../../api/api';
import useGames from '../../hooks/useGames';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const { getItemCount } = useCart();
  const { user, logout, wishlist } = useAuth();
  const { games: allGames } = useGames();

  const [scrolled, setScrolled]         = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const searchRef   = useRef(null);
  const userMenuRef = useRef(null);
  const debounceRef = useRef(null);

  /* ── scroll shadow ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── search debounce ── */
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    debounceRef.current = setTimeout(() => {
      const q = searchQuery.toLowerCase();
      const results = allGames
        .filter(g => (g.title||'').toLowerCase().includes(q))
        .slice(0, 6);
      setSearchResults(results);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  /* ── close dropdowns on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── close mobile menu on nav ── */
  const closeAll = () => {
    setMobileOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setUserMenuOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/games?search=${encodeURIComponent(searchQuery.trim())}`);
      closeAll();
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/',          label: 'Главная' },
    { to: '/games',     label: 'Игры' },
    { to: '/games?filter=category', label: 'Категории' },
    { to: '/games?sort=discount',   label: 'Скидки' },
    { to: '/news',      label: 'Новости' },
  ];

  const cartCount     = getItemCount();
  const wishlistCount = wishlist.length;

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__inner container">

        {/* Logo */}
        <Link to="/" className="header__logo" onClick={closeAll}>
          <Gamepad2 size={24} className="header__logo-icon" />
          <span className="header__logo-text">
            <span className="header__logo-game">GAME</span>
            <span className="header__logo-zone">ZONE</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="header__nav" aria-label="Main navigation">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `header__nav-link ${isActive && to !== '/games?filter=category' && to !== '/games?sort=discount' ? 'active' : ''}`
              }
              onClick={closeAll}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="header__actions">

          {/* Search */}
          <div className="header__search-wrap" ref={searchRef}>
            <button
              className="header__icon-btn"
              aria-label="Open search"
              onClick={() => { setSearchOpen(v => !v); setSearchQuery(''); setSearchResults([]); }}
            >
              <Search size={20} />
            </button>

            {searchOpen && (
              <div className="header__search-dropdown">
                <form onSubmit={handleSearchSubmit} className="header__search-form">
                  <Search size={16} className="header__search-icon" />
                  <input
                    autoFocus
                    type="text"
                    className="header__search-input"
                    placeholder="Поиск игр…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    aria-label="Search games"
                  />
                  {searchQuery && (
                    <button type="button" className="header__search-clear" onClick={() => setSearchQuery('')}>
                      <X size={14} />
                    </button>
                  )}
                </form>

                {searchQuery.trim() && (
                  <div className="header__search-results">
                    {searchResults.length > 0 ? searchResults.map(game => (
                      <Link
                        key={game.id}
                        to={`/games/${game.slug || game.id}`}
                        className="header__search-item"
                        onClick={closeAll}
                      >
                        <img src={game.image} alt={game.title} loading="lazy" />
                        <div className="header__search-item-info">
                          <span className="header__search-item-title">{game.title}</span>
                          <span className="header__search-item-price">${game.price}</span>
                        </div>
                        {game.discount > 0 && (
                          <span className="header__search-item-disc">-{game.discount}%</span>
                        )}
                      </Link>
                    )) : (
                      <div className="header__search-empty">Игры не найдены</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Wishlist */}
          <Link to="/profile" className="header__icon-btn header__icon-btn--badge" aria-label="Wishlist" onClick={closeAll}>
            <Heart size={20} />
            {wishlistCount > 0 && <span className="header__badge">{wishlistCount}</span>}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="header__icon-btn header__icon-btn--badge" aria-label="Cart" onClick={closeAll}>
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="header__badge">{cartCount}</span>}
          </Link>

          {/* User */}
          <div className="header__user-wrap" ref={userMenuRef}>
            <button
              className="header__icon-btn header__user-btn"
              aria-label="User menu"
              aria-expanded={userMenuOpen}
              onClick={() => setUserMenuOpen(v => !v)}
            >
              {user
                ? <div className="header__avatar">{user.name.charAt(0).toUpperCase()}</div>
                : <User size={20} />
              }
              {user && <ChevronDown size={14} className={`header__chevron ${userMenuOpen ? 'open' : ''}`} />}
            </button>

            {userMenuOpen && (
              <div className="header__user-menu">
                {user ? (
                  <>
                    <div className="header__user-info">
                      <div className="header__avatar header__avatar--lg">{user.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="header__user-name">{user.name}</div>
                        <div className="header__user-email">{user.email}</div>
                      </div>
                    </div>
                    <div className="header__user-divider" />
                    <Link to="/profile" className="header__user-item" onClick={closeAll}>
                      <User size={15} /> Мой профиль
                    </Link>
                    <Link to="/profile?tab=orders" className="header__user-item" onClick={closeAll}>
                      <Package size={15} /> Мои заказы
                    </Link>
                    <Link to="/profile?tab=settings" className="header__user-item" onClick={closeAll}>
                      <Settings size={15} /> Настройки
                    </Link>
                    <div className="header__user-divider" />
                    <button className="header__user-item header__user-item--danger" onClick={handleLogout}>
                      <LogOut size={15} /> Выйти
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login"    className="header__user-item" onClick={closeAll}><User size={15} /> Войти</Link>
                    <Link to="/register" className="header__user-item" onClick={closeAll}><User size={15} /> Регистрация</Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="header__hamburger"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="header__mobile-menu" role="dialog" aria-modal="true">
          <nav className="header__mobile-nav">
            {navLinks.map(({ to, label }) => (
              <Link key={label} to={to} className="header__mobile-link" onClick={closeAll}>{label}</Link>
            ))}
          </nav>
          <div className="header__mobile-divider" />
          <div className="header__mobile-actions">
            {user ? (
              <>
                <Link to="/profile" className="header__mobile-link" onClick={closeAll}><User size={16} /> Профиль</Link>
                <button className="header__mobile-link header__mobile-link--danger" onClick={handleLogout}>
                  <LogOut size={16} /> Выйти
                </button>
              </>
            ) : (
              <>
                <Link to="/login"    className="header__mobile-link" onClick={closeAll}><User size={16} /> Войти</Link>
                <Link to="/register" className="header__mobile-link" onClick={closeAll}>Регистрация</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
