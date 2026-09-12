import { Link } from 'react-router-dom';
import { Calendar, User, Tag } from 'lucide-react';

export default function NewsCard({ article }) {
  const date = new Date(article.date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <Link to={`/news/${article.slug}`} className="news-card" aria-label={article.title}>
      <div className="news-card__img-wrap">
        <img
          src={article.image}
          alt={article.title}
          className="news-card__img"
          loading="lazy"
        />
        <span className="news-card__category">{article.category}</span>
        {article.isNew && <span className="news-card__new">NEW</span>}
      </div>

      <div className="news-card__body">
        <div className="news-card__meta">
          <span className="news-card__meta-item">
            <Calendar size={12} />{date}
          </span>
          <span className="news-card__meta-item">
            <User size={12} />{article.author}
          </span>
        </div>

        <h3 className="news-card__title">{article.title}</h3>
        <p className="news-card__excerpt">{article.excerpt}</p>

        <div className="news-card__tags">
          {article.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="news-card__tag">
              <Tag size={10} />{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
