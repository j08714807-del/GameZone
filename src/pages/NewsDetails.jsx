import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, User, Tag, ChevronRight, ArrowLeft, Loader } from 'lucide-react';
import { newsApi } from '../api/api';
import useNews from '../hooks/useNews';
import NewsCard from '../components/NewsCard';

export default function NewsDetails() {
  const { slug }              = useParams(); // may be id or slug
  const { articles: allNews } = useNews();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);

    const load = async () => {
      try {
        if (/^\d+$/.test(slug)) {
          const data = await newsApi.getOne(slug);
          if (!cancelled) setArticle(data);
        } else {
          const found = allNews.find(
            a => a.slug === slug || a.title?.toLowerCase().replace(/\s+/g, '-') === slug
          );
          if (found) {
            if (!cancelled) setArticle(found);
          } else {
            const all   = await newsApi.getAll();
            const match = all.find(a => a.slug === slug);
            if (!cancelled) { setArticle(match || null); if (!match) setError('Article not found'); }
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
  }, [slug, allNews]);

  const related = allNews
    .filter(a => String(a.id) !== String(article?.id))
    .slice(0, 4);

  if (loading) return (
    <div style={{ padding:'80px 24px', textAlign:'center' }}>
      <Loader size={36} style={{ color:'var(--purple-light)', animation:'spin 1s linear infinite' }} />
    </div>
  );

  if (error || !article) return (
    <div className="container" style={{ padding:'80px 24px', textAlign:'center' }}>
      <div style={{ fontSize:64, marginBottom:16 }}>📰</div>
      <h2 style={{ marginBottom:12 }}>Статья не найдена</h2>
      <Link to="/news" className="btn btn--primary">Назад к новостям</Link>
    </div>
  );

  const date = article.date
    ? new Date(article.date).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
    : '';

  return (
    <div className="news-details container">

      {/* Breadcrumb */}
      <nav style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--text-muted)', marginBottom:24 }}>
        <Link to="/" style={{ color:'var(--text-muted)', textDecoration:'none' }}>Главная</Link>
        <ChevronRight size={12} />
        <Link to="/news" style={{ color:'var(--text-muted)', textDecoration:'none' }}>Новости</Link>
        <ChevronRight size={12} />
        <span style={{ color:'var(--text-secondary)' }}>{article.title}</span>
      </nav>

      <div className="news-details__layout">

        {/* Article */}
        <article>
          {article.image && (
            <img src={article.image} alt={article.title}
              className="news-details__hero" loading="lazy" />
          )}

          {article.category && (
            <span className="news-details__category">{article.category}</span>
          )}

          <h1 className="news-details__title">{article.title}</h1>

          <div className="news-details__meta">
            {date && (
              <span className="news-details__meta-item">
                <Calendar size={14} /> {date}
              </span>
            )}
            {article.author && (
              <span className="news-details__meta-item">
                <User size={14} /> {article.author}
              </span>
            )}
            {Array.isArray(article.tags) && article.tags.map(tag => (
              <span key={tag} className="news-details__meta-item">
                <Tag size={12} /> {tag}
              </span>
            ))}
          </div>

          <div className="news-details__content">
            {article.content || article.excerpt}
          </div>

          <div style={{ marginTop:40 }}>
            <Link to="/news" className="btn btn--ghost">
              <ArrowLeft size={16} /> Назад к новостям
            </Link>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="news-details__sidebar">
          <h3 className="news-details__sidebar-title">Похожие новости</h3>
          <div className="related-news-list">
            {related.map(item => {
              const d = item.date
                ? new Date(item.date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
                : '';
              return (
                <Link key={item.id} to={`/news/${item.id}`} className="related-news-item">
                  {item.image && <img src={item.image} alt={item.title} loading="lazy" />}
                  <div className="related-news-item__info">
                    <div className="related-news-item__title">{item.title}</div>
                    {d && <div className="related-news-item__date">{d}</div>}
                  </div>
                </Link>
              );
            })}
            {related.length === 0 && (
              <p style={{ fontSize:13, color:'var(--text-muted)' }}>Похожих статей пока нет.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
