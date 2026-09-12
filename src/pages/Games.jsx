import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import GameCard from '../components/GameCard';
import useGames from '../hooks/useGames';
import { categories } from '../data/categories';

const SORT_OPTIONS = [
  { value: 'popular',    label: 'По популярности' },
  { value: 'newest',     label: 'Сначала новые' },
  { value: 'price-asc',  label: 'Цена: по возрастанию' },
  { value: 'price-desc', label: 'Цена: по убыванию' },
  { value: 'rating',     label: 'По рейтингу' },
  { value: 'discount',   label: 'По размеру скидки' },
];

const PRICE_RANGES = [
  { label: 'Любая цена', min: 0,  max: Infinity },
  { label: 'До 2 000 ₽',  min: 0,  max: 20 },
  { label: '2 000 – 4 000 ₽',  min: 20, max: 40 },
  { label: '4 000 – 6 000 ₽',  min: 40, max: 60 },
  { label: 'Дороже 6 000 ₽',       min: 60, max: Infinity },
];
const PLATFORMS  = ['PC', 'PlayStation', 'Xbox', 'Nintendo'];
const MIN_RATINGS = [4.5, 4.0, 3.5];

function GameCardSkeleton() {
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
      <div className="skeleton" style={{ aspectRatio:'16/9' }} />
      <div style={{ padding:14, display:'flex', flexDirection:'column', gap:8 }}>
        <div className="skeleton" style={{ height:12, width:'60%', borderRadius:4 }} />
        <div className="skeleton" style={{ height:14, width:'90%', borderRadius:4 }} />
        <div className="skeleton" style={{ height:18, width:'40%', borderRadius:4 }} />
      </div>
    </div>
  );
}

export default function Games() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { games, loading, error, refetch } = useGames();
  const [sidebarOpen,    setSidebarOpen]   = useState(false);
  const [searchQuery,    setSearchQuery]   = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory]= useState(searchParams.get('category') || 'All');
  const [activePlatforms,setActivePlatforms]= useState([]);
  const [priceRangeIdx,  setPriceRangeIdx] = useState(0);
  const [minRating,      setMinRating]     = useState(0);
  const [sortBy,         setSortBy]        = useState(searchParams.get('sort') || 'popular');
  const [onlyNew,        setOnlyNew]       = useState(searchParams.get('filter') === 'new');
  const [displayQuery,   setDisplayQuery]  = useState(searchParams.get('search') || '');

  /* sync URL params */
  useEffect(() => {
    const cat  = searchParams.get('category');
    const sort = searchParams.get('sort');
    const srch = searchParams.get('search');
    const fltr = searchParams.get('filter');
    if (cat)  setActiveCategory(cat);
    if (sort) setSortBy(sort);
    if (srch) { setSearchQuery(srch); setDisplayQuery(srch); }
    if (fltr === 'new') setOnlyNew(true);
  }, [searchParams]);

  /* debounce search */
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(displayQuery), 300);
    return () => clearTimeout(t);
  }, [displayQuery]);

  const togglePlatform = (p) =>
    setActivePlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const clearFilters = () => {
    setActiveCategory('All'); setActivePlatforms([]); setPriceRangeIdx(0);
    setMinRating(0); setDisplayQuery(''); setSearchQuery(''); setOnlyNew(false);
    setSortBy('popular'); setSearchParams({});
  };

  const filtered = useMemo(() => {
    let list = [...games];
    if (searchQuery.trim())
      list = list.filter(g => (g.title||'').toLowerCase().includes(searchQuery.toLowerCase()));
    if (activeCategory !== 'All')
      list = list.filter(g => g.category === activeCategory);
    if (activePlatforms.length > 0)
      list = list.filter(g => {
        const plat = Array.isArray(g.platform) ? g.platform : (g.platform||'').split(',').map(s=>s.trim());
        return activePlatforms.some(p => plat.includes(p));
      });
    const range = PRICE_RANGES[priceRangeIdx];
    list = list.filter(g => parseFloat(g.price) >= range.min && parseFloat(g.price) <= range.max);
    if (minRating > 0) list = list.filter(g => parseFloat(g.rating) >= minRating);
    if (onlyNew) list = list.filter(g => g.isNew);
    switch (sortBy) {
      case 'newest':    list.sort((a,b) => new Date(b.releaseDate||0) - new Date(a.releaseDate||0)); break;
      case 'price-asc': list.sort((a,b) => parseFloat(a.price) - parseFloat(b.price)); break;
      case 'price-desc':list.sort((a,b) => parseFloat(b.price) - parseFloat(a.price)); break;
      case 'rating':    list.sort((a,b) => parseFloat(b.rating) - parseFloat(a.rating)); break;
      case 'discount':  list.sort((a,b) => parseInt(b.discount) - parseInt(a.discount)); break;
      default:          list.sort((a,b) => parseInt(b.reviews||0) - parseInt(a.reviews||0));
    }
    return list;
  }, [games, searchQuery, activeCategory, activePlatforms, priceRangeIdx, minRating, sortBy, onlyNew]);

  const hasActiveFilters = activeCategory !== 'All' || activePlatforms.length > 0 ||
    priceRangeIdx !== 0 || minRating !== 0 || onlyNew || searchQuery;

  /* sidebar categories from API data */
  const apiCats = ['All', ...Array.from(new Set(games.map(g => g.category).filter(Boolean)))];

  const SidebarContent = () => (
    <div className="sidebar">
      <div className="sidebar__section">
        <div className="sidebar__title">Категории</div>
        {apiCats.map(cat => (
          <button key={cat}
            className={`sidebar__item ${activeCategory === cat ? 'sidebar__item--active' : ''}`}
            onClick={() => { setActiveCategory(cat); setSidebarOpen(false); }}
          >
            <span>{cat}</span>
            {cat !== 'All' && (
              <span className="sidebar__item-count">
                {games.filter(g => g.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="sidebar__divider" />
      <div className="sidebar__section">
        <div className="sidebar__title">Ценовой диапазон</div>
        {PRICE_RANGES.map((r, i) => (
          <button key={r.label}
            className={`sidebar__item ${priceRangeIdx === i ? 'sidebar__item--active' : ''}`}
            onClick={() => setPriceRangeIdx(i)}>{r.label}
          </button>
        ))}
      </div>
      <div className="sidebar__divider" />
      <div className="sidebar__section">
        <div className="sidebar__title">Платформа</div>
        {PLATFORMS.map(p => (
          <button key={p}
            className={`sidebar__item ${activePlatforms.includes(p) ? 'sidebar__item--active' : ''}`}
            onClick={() => togglePlatform(p)}
          >
            {p}{activePlatforms.includes(p) && <span style={{ marginLeft:'auto', fontSize:10 }}>✓</span>}
          </button>
        ))}
      </div>
      <div className="sidebar__divider" />
      <div className="sidebar__section">
        <div className="sidebar__title">Мин. рейтинг</div>
        <button className={`sidebar__item ${minRating === 0 ? 'sidebar__item--active' : ''}`}
          onClick={() => setMinRating(0)}>Все рейтинги</button>
        {MIN_RATINGS.map(r => (
          <button key={r}
            className={`sidebar__item ${minRating === r ? 'sidebar__item--active' : ''}`}
            onClick={() => setMinRating(r)}>
            {'★'.repeat(Math.floor(r))}{'☆'.repeat(5-Math.floor(r))} {r}+
          </button>
        ))}
      </div>
      <div className="sidebar__divider" />
      <div className="sidebar__section">
        <div className="sidebar__title">Релиз</div>
        <button
          className={`sidebar__item ${onlyNew ? 'sidebar__item--active' : ''}`}
          onClick={() => setOnlyNew(v => !v)}
        >
          Только новинки
          {onlyNew && <span style={{ marginLeft:'auto', fontSize:10 }}>✓</span>}
        </button>
      </div>
      {hasActiveFilters && (
        <>
          <div className="sidebar__divider" />
          <button className="btn btn--secondary btn--sm"
            style={{ width:'100%', justifyContent:'center' }} onClick={clearFilters}>
            <X size={13} /> Сбросить фильтры
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="games-page container">
      <div className="games-page__header">
        <h1 className="games-page__title">Каталог игр</h1>
        <p className="games-page__sub">
          {loading ? 'Загрузка игр…' : `${games.length} игр в каталоге`}
        </p>
      </div>

      {/* API error */}
      {error && (
        <div className="admin-api-error" style={{ marginBottom:20 }}>
          ⚠ {error}
          <button onClick={refetch} className="btn btn--secondary btn--sm" style={{ marginLeft:'auto' }}>
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      <div className="games-page__layout">
        <aside><SidebarContent /></aside>

        <div className="games-main">
          {/* Toolbar */}
          <div className="games-toolbar">
            <div className="games-toolbar__search">
              <Search size={16} className="games-toolbar__search-icon" />
              <input type="text" className="games-toolbar__search-input"
                placeholder="Поиск игр…"
                value={displayQuery}
                onChange={e => setDisplayQuery(e.target.value)} />
            </div>
            <div className="games-toolbar__right">
              <span className="games-toolbar__count">
                {loading ? '…' : `${filtered.length} игр`}
              </span>
              <select className="games-toolbar__sort" value={sortBy}
                onChange={e => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Mobile sidebar toggle */}
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(v => !v)}>
            <SlidersHorizontal size={16} />
            Фильтры
            {hasActiveFilters && <span className="header__badge" style={{ position:'static', marginLeft:4 }}>!</span>}
            {sidebarOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {sidebarOpen && <div style={{ marginBottom:20 }}><SidebarContent /></div>}

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="games-filter-chips">
              {activeCategory !== 'All' && (
                <span className="filter-chip">{activeCategory}
                  <button onClick={() => setActiveCategory('All')}><X size={11} /></button>
                </span>
              )}
              {activePlatforms.map(p => (
                <span key={p} className="filter-chip">{p}
                  <button onClick={() => togglePlatform(p)}><X size={11} /></button>
                </span>
              ))}
              {priceRangeIdx !== 0 && (
                <span className="filter-chip">{PRICE_RANGES[priceRangeIdx].label}
                  <button onClick={() => setPriceRangeIdx(0)}><X size={11} /></button>
                </span>
              )}
              {minRating > 0 && (
                <span className="filter-chip">{minRating}★+
                  <button onClick={() => setMinRating(0)}><X size={11} /></button>
                </span>
              )}
              {onlyNew && (
                <span className="filter-chip">New Only
                  <button onClick={() => setOnlyNew(false)}><X size={11} /></button>
                </span>
              )}
              {searchQuery && (
                <span className="filter-chip">"{searchQuery}"
                  <button onClick={() => { setDisplayQuery(''); setSearchQuery(''); }}><X size={11} /></button>
                </span>
              )}
              <button className="filter-chip filter-chip--clear" onClick={clearFilters}>Сбросить всё</button>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="games-grid games-grid--3">
              {Array.from({ length: 9 }).map((_, i) => <GameCardSkeleton key={i} />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="games-grid games-grid--3">
              {filtered.map(game => <GameCard key={game.id} game={game} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon">🎮</div>
              <h3 className="empty-state__title">Игры не найдены</h3>
              <p className="empty-state__sub">
                {games.length === 0
                  ? 'Каталог пуст. Добавьте игры через панель администратора.'
                  : 'Попробуйте изменить фильтры или поисковый запрос.'}
              </p>
              {games.length > 0 && (
                <button className="btn btn--primary" onClick={clearFilters}>Сбросить фильтры</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
