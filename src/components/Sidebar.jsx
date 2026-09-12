import { Star } from 'lucide-react';

const CATEGORIES = ['All', 'Action', 'RPG', 'Shooter', 'Strategy', 'Racing', 'Sports', 'Horror', 'Indie'];
const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Nintendo'];
const PRICE_RANGES = [
  { label: '$0 — $20', min: 0, max: 20 },
  { label: '$20 — $40', min: 20, max: 40 },
  { label: '$40 — $60', min: 40, max: 60 },
  { label: '$60+', min: 60, max: Infinity },
];
const RATINGS = [5, 4, 3];

export default function Sidebar({ filters, onChange }) {
  const { category, platforms, priceRange, rating } = filters;

  const togglePlatform = (p) => {
    const next = platforms.includes(p)
      ? platforms.filter(x => x !== p)
      : [...platforms, p];
    onChange({ ...filters, platforms: next });
  };

  const togglePrice = (range) => {
    const isSame = priceRange && priceRange.label === range.label;
    onChange({ ...filters, priceRange: isSame ? null : range });
  };

  const setRating = (r) => {
    onChange({ ...filters, rating: rating === r ? 0 : r });
  };

  return (
    <aside className="sidebar">
      {/* Categories */}
      <div className="sidebar__section">
        <h3 className="sidebar__title">Categories</h3>
        <ul className="sidebar__list">
          {CATEGORIES.map(cat => (
            <li key={cat}>
              <button
                className={`sidebar__item${category === cat ? ' sidebar__item--active' : ''}`}
                onClick={() => onChange({ ...filters, category: cat })}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div className="sidebar__section">
        <h3 className="sidebar__title">Price</h3>
        <ul className="sidebar__list">
          {PRICE_RANGES.map(range => (
            <li key={range.label}>
              <button
                className={`sidebar__item${priceRange?.label === range.label ? ' sidebar__item--active' : ''}`}
                onClick={() => togglePrice(range)}
              >
                {range.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Platforms */}
      <div className="sidebar__section">
        <h3 className="sidebar__title">Platform</h3>
        <ul className="sidebar__list">
          {PLATFORMS.map(p => (
            <li key={p}>
              <label className="sidebar__check">
                <input
                  type="checkbox"
                  checked={platforms.includes(p)}
                  onChange={() => togglePlatform(p)}
                />
                {p}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Rating */}
      <div className="sidebar__section">
        <h3 className="sidebar__title">Rating</h3>
        <ul className="sidebar__list">
          {RATINGS.map(r => (
            <li key={r}>
              <button
                className={`sidebar__item sidebar__item--stars${rating === r ? ' sidebar__item--active' : ''}`}
                onClick={() => setRating(r)}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < r ? '#ffc857' : 'none'} color={i < r ? '#ffc857' : '#555'} />
                ))}
                <span>& up</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Reset */}
      <button
        className="sidebar__reset"
        onClick={() => onChange({ category: 'All', platforms: [], priceRange: null, rating: 0 })}
      >
        Reset Filters
      </button>
    </aside>
  );
}
