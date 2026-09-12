import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, ChevronRight, Star, TrendingUp, Sparkles } from 'lucide-react';
import GameCard from '../components/GameCard';
import CategoryCard from '../components/CategoryCard';
import NewsCard from '../components/NewsCard';
import useGames from '../hooks/useGames';
import useNews from '../hooks/useNews';
import { categories } from '../data/categories';
import useScrollReveal from '../hooks/useScrollReveal';

function RevealSection({ children, direction = '', delay = 0, style = {} }) {
  const ref = useScrollReveal();
  const cls = `reveal${direction ? ` reveal-${direction}` : ''}`;
  return (
    <div ref={ref} className={cls} style={{ transitionDelay: `${delay}s`, ...style }}>
      {children}
    </div>
  );
}

/* Skeleton placeholder for game cards */
function GameCardSkeleton() {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <div className="skeleton" style={{ aspectRatio: '16/9', width: '100%' }} />
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skeleton" style={{ height: 12, width: '60%', borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 14, width: '90%', borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 18, width: '40%', borderRadius: 4 }} />
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { games, loading: gLoading } = useGames();
  const { articles, loading: nLoading } = useNews();

  /* derive sections from API data */
  const popular     = games.filter(g => g.isFeatured).slice(0, 5);
  const newReleases = games.filter(g => g.isNew).slice(0, 5);
  const deals       = games.filter(g => g.isOnSale && g.discount > 0).slice(0, 4);
  const topRated    = [...games].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const latestNews  = articles.slice(0, 3);

  /* fallback: if no featured games yet show first 5 */
  const popularFinal = popular.length > 0 ? popular : games.slice(0, 5);
  const newFinal     = newReleases.length > 0 ? newReleases : games.slice(5, 10);
  const topFinal     = topRated.length > 0 ? topRated : games.slice(0, 4);
  const heroBg = games[0]?.image ||
    'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/capsule_616x353.jpg';

  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__bg">
          <img src={heroBg} alt="Hero" className="hero__bg-img" />
          <div className="hero__gradient" />
          <div className="hero__gradient-bottom" />
          <div className="hero__purple-glow" />
          <div className="hero__particles" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => <span key={i} className="hero__particle" />)}
          </div>
        </div>
        <div className="hero__content">
          <div className="hero__text">
            <span className="hero__tag"><Zap size={12} /> Новинки этой недели</span>
            <h1 className="hero__title">
              <span className="hero__title-white">ОТКРОЙ ДЛЯ СЕБЯ</span>
              <span className="hero__title-purple">СВОЮ СЛЕДУЮЩУЮ ИГРУ</span>
            </h1>
            <p className="hero__sub">Лучшие игры по лучшим ценам. Тысячи тайтлов во всех жанрах.</p>
            <div className="hero__actions">
              <button className="btn btn--primary btn--lg" onClick={() => navigate('/games')}>
                В каталог <ArrowRight size={18} />
              </button>
              <button className="btn btn--ghost btn--lg" onClick={() => navigate('/games?sort=discount')}>
                Скидки
              </button>
            </div>
            <div className="hero__stats">
              <div className="hero__stat"><strong>{games.length || '20'}+</strong><span>Игр</span></div>
              <div className="hero__stat-divider" />
              <div className="hero__stat"><strong>70%</strong><span>Макс. скидка</span></div>
              <div className="hero__stat-divider" />
              <div className="hero__stat"><strong>4.8★</strong><span>Ср. рейтинг</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Popular Games ── */}
      <section className="section">
        <div className="container">
          <RevealSection>
            <div className="section__header">
              <div>
                <div className="section__label"><TrendingUp size={14} /> В тренде</div>
                <h2 className="section__title">Популярные игры</h2>
                <p className="section__sub">Самые играемые и любимые геймерами по всему миру</p>
              </div>
              <Link to="/games" className="section__link">Смотреть все <ChevronRight size={16} /></Link>
            </div>
          </RevealSection>
          <div className="games-grid games-grid--5">
            {gLoading
              ? Array.from({ length: 5 }).map((_, i) => <GameCardSkeleton key={i} />)
              : popularFinal.map((game, i) => (
                  <RevealSection key={game.id} delay={i * 0.07}>
                    <GameCard game={game} />
                  </RevealSection>
                ))
            }
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <RevealSection>
            <div className="section__header">
              <div>
                <h2 className="section__title">Каталог по категориям</h2>
                <p className="section__sub">Найдите игры в своём жанре</p>
              </div>
              <Link to="/games" className="section__link">Все категории <ChevronRight size={16} /></Link>
            </div>
          </RevealSection>
          <div className="categories-grid">
            {categories.map((cat, i) => (
              <RevealSection key={cat.id} direction="scale" delay={i * 0.05}>
                <CategoryCard category={cat} />
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Best Deals Banner ── */}
      {deals.length > 0 && (
        <div className="container" style={{ paddingBottom: 0 }}>
          <RevealSection>
            <section className="deals-banner">
              <div className="deals-banner__content">
                <RevealSection direction="left">
                  <div className="deals-banner__text">
                    <span className="deals-banner__tag"><Zap size={12} /> Ограниченное предложение</span>
                    <h2 className="deals-banner__title">МЕГА РАСПРОДАЖА</h2>
                    <p className="deals-banner__sub">ДО <span>70% СКИДКИ</span> на избранные тайтлы!</p>
                    <p className="deals-banner__desc">Ограниченное по времени предложение. Не упустите!</p>
                    <button className="btn btn--primary btn--lg" onClick={() => navigate('/games?sort=discount')}>
                      Смотреть скидки <ArrowRight size={18} />
                    </button>
                  </div>
                </RevealSection>
                <div className="deals-banner__games">
                  {deals.map((game, i) => (
                    <RevealSection key={game.id} direction="right" delay={i * 0.1}>
                      <Link to={`/games/${game.id}`} className="deals-banner__item">
                        <img src={game.image} alt={game.title} loading="lazy" />
                        <div className="deals-banner__item-info">
                          <span className="deals-banner__item-title">{game.title}</span>
                          <div className="deals-banner__item-prices">
                            <span className="deals-banner__item-price">${parseFloat(game.price).toFixed(2)}</span>
                            <span className="deals-banner__item-old">${parseFloat(game.oldPrice).toFixed(2)}</span>
                          </div>
                        </div>
                        <span className="deals-banner__item-disc">-{game.discount}%</span>
                      </Link>
                    </RevealSection>
                  ))}
                </div>
              </div>
            </section>
          </RevealSection>
        </div>
      )}

      {/* ── New Releases ── */}
      <section className="section">
        <div className="container">
          <RevealSection>
            <div className="section__header">
              <div>
                <div className="section__label"><Sparkles size={14} /> Только вышли</div>
                <h2 className="section__title">Новинки</h2>
                <p className="section__sub">Будьте первым кто поиграет в новые тайтлы</p>
              </div>
              <Link to="/games?filter=new" className="section__link">Смотреть все <ChevronRight size={16} /></Link>
            </div>
          </RevealSection>
          <div className="games-grid games-grid--5">
            {gLoading
              ? Array.from({ length: 5 }).map((_, i) => <GameCardSkeleton key={i} />)
              : newFinal.map((game, i) => (
                  <RevealSection key={game.id} delay={i * 0.07}>
                    <GameCard game={game} />
                  </RevealSection>
                ))
            }
          </div>
        </div>
      </section>

      {/* ── Top Rated ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <RevealSection>
            <div className="section__header">
              <div>
                <div className="section__label"><Star size={14} /> Выбор редакции</div>
                <h2 className="section__title">Топ по рейтингу</h2>
                <p className="section__sub">Игры с наивысшими оценками сообщества</p>
              </div>
              <Link to="/games?sort=rating" className="section__link">Смотреть все <ChevronRight size={16} /></Link>
            </div>
          </RevealSection>
          <div className="games-grid">
            {gLoading
              ? Array.from({ length: 4 }).map((_, i) => <GameCardSkeleton key={i} />)
              : topFinal.map((game, i) => (
                  <RevealSection key={game.id} delay={i * 0.08}>
                    <GameCard game={game} />
                  </RevealSection>
                ))
            }
          </div>
        </div>
      </section>

      {/* ── News ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <RevealSection>
            <div className="section__header">
              <div>
                <h2 className="section__title">Игровые новости</h2>
                <p className="section__sub">Будьте в курсе игровых событий</p>
              </div>
              <Link to="/news" className="section__link">Все новости <ChevronRight size={16} /></Link>
            </div>
          </RevealSection>
          {nLoading ? (
            <div className="news-grid">
              {[1,2,3].map(i => (
                <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
                  <div className="skeleton" style={{ aspectRatio:'16/9' }} />
                  <div style={{ padding:16, display:'flex', flexDirection:'column', gap:8 }}>
                    <div className="skeleton" style={{ height:12, width:'40%', borderRadius:4 }} />
                    <div className="skeleton" style={{ height:16, width:'85%', borderRadius:4 }} />
                    <div className="skeleton" style={{ height:12, width:'70%', borderRadius:4 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : latestNews.length > 0 ? (
            <div className="news-grid">
              {latestNews.map((article, i) => (
                <RevealSection key={article.id} delay={i * 0.1}>
                  <NewsCard article={article} />
                </RevealSection>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Новостей пока нет. Добавьте статьи через панель администратора.
            </p>
          )}
        </div>
      </section>

    </div>
  );
}
