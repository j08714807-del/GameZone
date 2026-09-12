import { useState } from 'react';
import { ChevronRight, RefreshCw } from 'lucide-react';
import NewsCard from '../components/NewsCard';
import useNews from '../hooks/useNews';

export default function News() {
  const { articles, loading, error, refetch } = useNews();
  const [activeCategory, setActiveCategory]   = useState('All');

  const categories = ['All', ...Array.from(new Set(articles.map(n => n.category).filter(Boolean)))];

  const filtered = activeCategory === 'All'
    ? articles
    : articles.filter(n => n.category === activeCategory);

  return (
    <div className="news-page">
      <h1 className="news-page__title">Игровые новости</h1>
      <p className="news-page__sub">
        Будьте в курсе последних игровых событий, обновлений и анонсов
      </p>

      {/* Error */}
      {error && (
        <div className="admin-api-error" style={{ marginBottom:20 }}>
          ⚠ {error}
          <button onClick={refetch} className="btn btn--secondary btn--sm" style={{ marginLeft:'auto' }}>
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {/* Category filter */}
      {!loading && articles.length > 0 && (
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:32 }}>
          {categories.map(cat => (
            <button key={cat}
              className={`btn btn--sm ${activeCategory === cat ? 'btn--primary' : 'btn--secondary'}`}
              onClick={() => setActiveCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
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
      )}

      {/* Featured first article */}
      {!loading && filtered.length > 0 && activeCategory === 'All' && (
        <div style={{ marginBottom:40 }}>
          <FeaturedArticle article={filtered[0]} />
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="news-grid">
          {(activeCategory === 'All' ? filtered.slice(1) : filtered).map(article => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-state__icon">📰</div>
          <h3 className="empty-state__title">Статей пока нет</h3>
          <p className="empty-state__sub">
            Добавьте новости через панель администратора.
          </p>
        </div>
      )}
    </div>
  );
}

function FeaturedArticle({ article }) {
  const date = article.date
    ? new Date(article.date).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })
    : '';
  const href = `/news/${article.id}`;

  return (
    <a href={href}
      style={{
        display:'grid', gridTemplateColumns:'1fr 1fr', gap:0,
        background:'var(--bg-card)', border:'1px solid var(--border)',
        borderRadius:'var(--radius-xl)', overflow:'hidden',
        textDecoration:'none', transition:'var(--transition)',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(124,44,255,.5)'; e.currentTarget.style.transform='translateY(-4px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform=''; }}
    >
      <div style={{ aspectRatio:'16/10', overflow:'hidden' }}>
        <img src={article.image} alt={article.title}
          style={{ width:'100%', height:'100%', objectFit:'cover' }} loading="lazy" />
      </div>
      <div style={{ padding:32, display:'flex', flexDirection:'column', justifyContent:'center', gap:12 }}>
        {article.category && (
          <span style={{
            display:'inline-flex', alignSelf:'flex-start',
            padding:'4px 12px', background:'var(--purple)', color:'#fff',
            borderRadius:'var(--radius-sm)', fontSize:11, fontWeight:700, textTransform:'uppercase'
          }}>
            {article.category}
            {article.isNew && <span style={{ marginLeft:8, background:'var(--green)', color:'#000', padding:'0 6px', borderRadius:3 }}>NEW</span>}
          </span>
        )}
        <h2 style={{ fontSize:22, fontWeight:700, lineHeight:1.3, color:'var(--text-primary)' }}>
          {article.title}
        </h2>
        <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.7 }}>{article.excerpt}</p>
        {date && (
          <div style={{ fontSize:13, color:'var(--text-muted)' }}>
            {date}{article.author ? ` · ${article.author}` : ''}
          </div>
        )}
        <span style={{ display:'inline-flex', alignItems:'center', gap:4, color:'var(--purple-light)', fontWeight:600, fontSize:14 }}>
          Читать далее <ChevronRight size={14} />
        </span>
      </div>
    </a>
  );
}
