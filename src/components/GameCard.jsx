import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function GameCard({ game }) {
  const { addToCart, isInCart }          = useCart();
  const { toggleWishlist, isInWishlist } = useAuth();
  const [imgError, setImgError]          = useState(false);

  const inCart     = isInCart(game.id);
  const inWishlist = isInWishlist(game.id);

  /* Use id for routing — works with both local data and MockAPI */
  const detailPath = `/games/${game.slug || game.id}`;

  const handleCart = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!inCart) addToCart(game);
  };
  const handleWishlist = (e) => {
    e.preventDefault(); e.stopPropagation();
    toggleWishlist(game);
  };

  return (
    <Link to={detailPath} className="game-card" aria-label={`View ${game.title}`}>
      <div className="game-card__img-wrap">
        {!imgError && game.image ? (
          <img src={game.image} alt={game.title} className="game-card__img"
            loading="lazy" onError={() => setImgError(true)} />
        ) : (
          <div className="game-card__img-fallback">🎮</div>
        )}

        <div className="game-card__badges">
          {parseInt(game.discount) > 0 && (
            <span className="game-card__badge game-card__badge--discount">-{game.discount}%</span>
          )}
          {game.isNew && <span className="game-card__badge game-card__badge--new">NEW</span>}
        </div>

        <button className={`game-card__wishlist ${inWishlist ? 'active' : ''}`}
          onClick={handleWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        <div className="game-card__overlay">
          <span className="game-card__view"><Eye size={15} /> View Details</span>
        </div>
      </div>

      <div className="game-card__body">
        {game.rating && (
          <div className="game-card__rating">
            <Star size={12} fill="currentColor" />
            <span>{game.rating}</span>
            {game.reviews && (
              <span className="game-card__reviews">({parseInt(game.reviews).toLocaleString()})</span>
            )}
          </div>
        )}

        <h3 className="game-card__title">{game.title}</h3>

        {game.category && (
          <div className="game-card__meta">
            <span className="game-card__category">{game.category}</span>
          </div>
        )}

        <div className="game-card__footer">
          <div className="game-card__prices">
            <span className="game-card__price">${parseFloat(game.price || 0).toFixed(2)}</span>
            {parseFloat(game.oldPrice) > parseFloat(game.price) && (
              <span className="game-card__old-price">${parseFloat(game.oldPrice).toFixed(2)}</span>
            )}
          </div>
          <button className={`game-card__cart-btn ${inCart ? 'in-cart' : ''}`}
            onClick={handleCart} aria-label={inCart ? 'In cart' : 'Add to cart'}>
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
    </Link>
  );
}
