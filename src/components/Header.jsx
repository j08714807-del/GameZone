import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, Gamepad2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { searchGames } from '../data/games';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const { getItemCount } = useCart();
  const { user, wishlist } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      setSearchResults(searchGames(searchQuery).slice(0, 6));
    }, 300);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/games', label: 'Games' },
    { to: '/games?category=Action', label: 'Categories' },
    { to: '/games?sort=discount', label: 'Deals' },
    { to: '/news', label: 'News' },
    { to: '/', label: 'Community' },
  ];

  const handleSearchSelect = (game) => {
    navigate(`/games/${game.slug}`);
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <header className={`header${scrolled ? ' header--scrolled' : ''}`}>
      <div className="header__inner">
        {/* Logo */}
        <Link to="/" className="header__logo">
          <Gamepad2 size={26} className="header__logo-icon" />
          <span>GAME<span className="header__logo-accent">ZONE</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="header__nav">
          {navLinks.map(link => (
            <Link
              key={link.label}
              to={link.to}
              className={`header__nav-link${location.pathname === link.to ? ' header__nav-link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="header__actions">
          {/* Search */}
          <div className="header__search-wrap" ref={searchRef}>
            <button
              className="header__icon-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {searchOpen && (
              <div className="header__search-dropdown">
                <div className="header__search-input-wrap">
                  <Search size={16} />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search games..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="header__search-input"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        navigate(`/games?search=${encodeURIComponent(searchQuery)}`);
                        setSearchOpen(false);
                        setSearchQuery('');
                        setSearchResults([]);
                      }
                    }}
                  />
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(''); setSearchResults([]); }}>
                      <X size={14} />
                    </button>
                  )}
                </div>
                {searchResults.length > 0 && (
                  <ul className="header__search-results">
                    {searchResults.map(game => (
                      <li key={game.id} onClick={() => handleSearchSelect(game)} className="header__search-result">
                        <img src={game.image} alt={game.title} loading="lazy" />
                        <div>
                          <span className="header__search-result-title">{game.title}</span>
                          <span className="header__search-result-price">${game.price}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                  <p className="header__search-empty">No games found</p>
                )}
              </div>
            )}
          </div>

          {/* Wishlist */}
          <Link to="/profile?tab=wishlist" className="header__icon-btn header__icon-btn--rel" aria-label="Wishlist">
            <Heart size={20} />
            {wishlist.length > 0 && (
              <span className="header__badge">{wishlist.length}</span>
            )}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="header__icon-btn header__icon-btn--rel" aria-label="Cart">
            <ShoppingCart size={20} />
            {getItemCount() > 0 && (
              <span className="header__badge">{getItemCount()}</span>
            )}
          </Link>

          {/* User */}
          <Link to={user ? '/profile' : '/login'} className="header__icon-btn" aria-label="Profile">
            <User size={20} />
          </Link>

          {/* Mobile toggle */}
          <button
            className="header__mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="header__mobile-menu">
          {navLinks.map(link => (
            <Link key={link.label} to={link.to} className="header__mobile-link">
              {link.label}
            </Link>
          ))}
          <div className="header__mobile-divider" />
          <Link to="/cart" className="header__mobile-link">Cart ({getItemCount()})</Link>
          <Link to={user ? '/profile' : '/login'} className="header__mobile-link">
            {user ? user.name : 'Login'}
          </Link>
        </div>
      )}
    </header>
  );
}
