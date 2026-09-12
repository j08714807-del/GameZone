import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star, Heart, ShoppingCart, ChevronRight,
  X, ChevronLeft, ChevronRight as ChevRight,
  Calendar, User, Monitor, Tag, CheckCircle, Loader
} from 'lucide-react';
import { gamesApi } from '../api/api';
import useGames from '../hooks/useGames';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import GameCard from '../components/GameCard';

export default function GameDetails() {
  /* The route uses :slug — which may be a real slug OR a numeric ID
     from MockAPI (MockAPI returns id as a string like "1","2"…)       */
  const { slug } = useParams();
  const navigate = useNavigate();

  const { addToCart, isInCart }          = useCart();
  const { toggleWishlist, isInWishlist } = useAuth();
  const { games: allGames }              = useGames();

  const [game,           setGame]          = useState(null);
  const [loading,        setLoading]       = useState(true);
  const [error,          setError]         = useState(null);
  const [screenshotIdx,  setScreenshotIdx] = useState(null);
  const [addedToCart,    setAddedToCart]   = useState(false);

  /* Fetch by ID first; if MockAPI returns 404 try to match by slug */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        /* If slug looks like a numeric ID, fetch directly */
        if (/^\d+$/.test(slug)) {
          const data = await gamesApi.getOne(slug);
          if (!cancelled) setGame(data);
        } else {
          /* slug — search in already-fetched list */
          const found = allGames.find(
            g => g.slug === slug || g.title?.toLowerCase().replace(/\s+/g, '-') === slug
          );
          if (found) {
            if (!cancelled) setGame(found);
          } else {
            /* last resort: fetch all and find */
            const all = await gamesApi.getAll();
            const match = all.find(
              g => g.slug === slug || g.title?.toLowerCase().replace(/\s+/g, '-') === slug
            );
            if (!cancelled) setGame(match || null);
            if (!match) setError('Game not found');
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [slug, allGames]);

  if (loading) return (
    <div style={{ padding:'80px 24px', textAlign:'center' }}>
      <Loader size={36} style={{ color:'var(--purple-light)', animation:'spin 1s linear infinite' }} />
      <p style={{ marginTop:16, color:'var(--text-muted)' }}>Загрузка игры…</p>
    </div>
  );

  if (error || !game) return (
    <div className="container" style={{ padding:'80px 24px', textAlign:'center' }}>
      <div style={{ fontSize:64, marginBottom:16 }}>🎮</div>
      <h2 style={{ marginBottom:12 }}>Игра не найдена</h2>
      <p style={{ color:'var(--text-muted)', marginBottom:24 }}>{error || 'Такой игры не существует.'}</p>
      <Link to="/games" className="btn btn--primary">Назад в каталог</Link>
    </div>
  );

  const inCart     = isInCart(game.id);
  const inWishlist = isInWishlist(game.id);
  const screenshots = Array.isArray(game.screenshots) ? game.screenshots : [];

  /* Related: same category, different id */
  const related = allGames
    .filter(g => String(g.id) !== String(game.id) && g.category === game.category)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!inCart) {
      addToCart(game);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } else {
      navigate('/cart');
    }
  };

  const prevScreenshot = () => setScreenshotIdx(i => (i - 1 + screenshots.length) % screenshots.length);
  const nextScreenshot = () => setScreenshotIdx(i => (i + 1) % screenshots.length);

  return (
    <div className="game-details">

      {/* Hero */}
      <div className="game-details__hero">
        <img src={game.image} alt={game.title} className="game-details__hero-img" />
        <div className="game-details__hero-gradient" />
        <div className="game-details__hero-gradient-bottom" />
        <div className="game-details__hero-content">
          <div className="game-details__hero-inner">
            <nav className="game-details__breadcrumb">
              <Link to="/">Главная</Link><ChevronRight size={12} />
              <Link to="/games">Каталог</Link><ChevronRight size={12} />
              <span>{game.title}</span>
            </nav>
            <h1 className="game-details__hero-title">{game.title}</h1>
            <div className="game-details__hero-meta">
              {game.rating && (
                <span className="game-details__hero-rating">
                  <Star size={14} fill="currentColor" /> {game.rating}
                  <span style={{ color:'var(--text-muted)', fontWeight:400, marginLeft:4 }}>
                    ({parseInt(game.reviews || 0).toLocaleString()} reviews)
                  </span>
                </span>
              )}
              {game.category && <span className="game-details__hero-cat">{game.category}</span>}
              {game.isNew && <span className="badge badge--purple">NEW</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="game-details__body container" style={{ maxWidth:'var(--max-w)' }}>

        {/* Main */}
        <div className="game-details__main">

          <div className="game-details__section">
            <h2 className="game-details__section-title">Об игре</h2>
            <p className="game-details__desc">{game.description || 'Описание отсутствует.'}</p>
          </div>

          {screenshots.length > 0 && (
            <div className="game-details__section">
              <h2 className="game-details__section-title">Скриншоты</h2>
              <div className="game-details__screenshots">
                {screenshots.map((src, i) => (
                  <button key={i} className="game-details__screenshot"
                    onClick={() => setScreenshotIdx(i)} aria-label={`Screenshot ${i+1}`}>
                    <img src={src} alt={`Screenshot ${i+1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="game-details__section">
            <h2 className="game-details__section-title">Подробности</h2>
            <div className="game-details__specs">
              {[
                ['Разработчик', game.developer,   <User size={12} />],
                ['Издатель',    game.publisher,   <Tag size={12} />],
                ['Дата выхода', game.releaseDate ? new Date(game.releaseDate).toLocaleDateString('ru-RU',{year:'numeric',month:'long',day:'numeric'}) : null, <Calendar size={12} />],
                ['Жанр',        game.genre,       <Tag size={12} />],
                ['Платформа',   Array.isArray(game.platform) ? game.platform.join(', ') : game.platform, <Monitor size={12} />],
                ['Рейтинг',     game.rating ? `${game.rating} / 5.0` : null, <Star size={12} />],
              ].filter(([,v]) => v).map(([k,v,icon]) => (
                <div key={k} className="game-details__spec">
                  <span className="game-details__spec-key">{icon} {k}</span>
                  <span className="game-details__spec-val">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Purchase sidebar */}
        <aside className="game-details__sidebar">
          <img src={game.image} alt={game.title} className="game-details__sidebar-img" />
          <div className="game-details__sidebar-prices">
            <span className="game-details__sidebar-price">${parseFloat(game.price||0).toFixed(2)}</span>
            {parseFloat(game.oldPrice) > parseFloat(game.price) && (
              <>
                <span className="game-details__sidebar-old">${parseFloat(game.oldPrice).toFixed(2)}</span>
                <span className="game-details__sidebar-disc">-{game.discount}%</span>
              </>
            )}
          </div>
          <div className="game-details__sidebar-actions">
            <button className={`btn ${inCart ? 'btn--secondary' : 'btn--primary'} btn--lg`}
              onClick={handleAddToCart}>
              {addedToCart ? <><CheckCircle size={18} /> Добавлено!</>
               : inCart    ? <><ShoppingCart size={18} /> Перейти в корзину</>
               :              <><ShoppingCart size={18} /> В корзину</>}
            </button>
            <button className={`btn ${inWishlist ? 'btn--danger' : 'btn--ghost'} btn--lg`}
              onClick={() => toggleWishlist(game)}>
              <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
              {inWishlist ? 'В избранном' : 'В избранное'}
            </button>
          </div>
          {game.platform && (
            <div className="game-details__sidebar-platforms">
              {(Array.isArray(game.platform) ? game.platform : [game.platform]).map(p => (
                <span key={p} className="game-details__platform">{p}</span>
              ))}
            </div>
          )}
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="game-details__related container">
          <div className="section__header" style={{ marginBottom:24 }}>
            <div>
              <h2 className="section__title">Похожие игры</h2>
              <p className="section__sub">Другие игры в жанре {game.category}</p>
            </div>
            <Link to={`/games?category=${game.category}`} className="section__link">
              Ещё {game.category} <ChevronRight size={16} />
            </Link>
          </div>
          <div className="games-grid">
            {related.map(g => <GameCard key={g.id} game={g} />)}
          </div>
        </div>
      )}

      {/* Screenshot lightbox */}
      {screenshotIdx !== null && (
        <div className="screenshot-modal" onClick={() => setScreenshotIdx(null)}
          role="dialog" aria-modal="true">
          <div className="screenshot-modal__img-wrap" onClick={e => e.stopPropagation()}>
            <img src={screenshots[screenshotIdx]} alt={`Screenshot ${screenshotIdx+1}`}
              className="screenshot-modal__img" />
            {screenshots.length > 1 && (
              <>
                <button className="screenshot-modal__prev" onClick={prevScreenshot}><ChevronLeft size={20} /></button>
                <button className="screenshot-modal__next" onClick={nextScreenshot}><ChevRight size={20} /></button>
              </>
            )}
          </div>
          <button className="screenshot-modal__close" onClick={() => setScreenshotIdx(null)}
            aria-label="Close"><X size={20} /></button>
        </div>
      )}
    </div>
  );
}
