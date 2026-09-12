import { useNavigate } from 'react-router-dom';
import {
  Sword, Crosshair, Brain, Zap, Car,
  Trophy, Ghost, Gamepad2
} from 'lucide-react';

const ICONS = { Sword, Crosshair, Brain, Zap, Car, Trophy, Ghost, Gamepad2 };

export default function CategoryCard({ category, active = false }) {
  const navigate = useNavigate();
  const Icon = ICONS[category.icon] || Gamepad2;

  return (
    <button
      className={`cat-card ${active ? 'cat-card--active' : ''}`}
      onClick={() => navigate(`/games?category=${category.name}`)}
      style={{ '--cat-color': category.color }}
      aria-label={`Browse ${category.name} games`}
      aria-pressed={active}
    >
      <div className="cat-card__icon">
        <Icon size={24} />
      </div>
      <span className="cat-card__name">{category.name}</span>
      <span className="cat-card__count">{category.count} games</span>
    </button>
  );
}
