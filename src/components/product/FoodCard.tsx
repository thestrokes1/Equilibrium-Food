import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CART_ADDED_FEEDBACK_MS } from '@/constants';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import type { FoodCardProps } from '@/types/product';
import LazyImage from '@/components/ui/LazyImage';
import ProductModal from './ProductModal';
import { transformImageUrl } from '@/lib/imageUrl';
import './FoodCard.css';

const BADGE_STYLES = {
  sale: { background: '#22c55e', color: '#0d0d0d' },
  new: { background: '#f59e0b', color: '#0d0d0d' },
  popular: { background: '#ef4444', color: '#ffffff' },
};

export default function FoodCard({
  id,
  name,
  price,
  image,
  rating = 4.7,
  deliveryTime = '25',
  restaurant = '',
  badge,
  category,
  description,
  onAdd,
}: FoodCardProps) {
  const [added, setAdded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const favId = String(id);
  const faved = isFavorite(favId);

  const handleFavorite = (e: import('react').MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    toggle(favId);
  };

  const handleAdd = (e: import('react').MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdded(true);
    onAdd?.({ id, name, price, image, restaurant, deliveryTime, rating, category });
    setTimeout(() => setAdded(false), CART_ADDED_FEEDBACK_MS);
  };

  const badgeStyle = badge ? (BADGE_STYLES[badge.type] ?? BADGE_STYLES.sale) : null;
  const product = {
    id,
    name,
    price,
    image,
    rating,
    deliveryTime,
    restaurant,
    badge,
    category,
    description,
  };

  return (
    <>
      <div className="food-card" onClick={() => setModalOpen(true)}>
        <div className="food-img-wrap">
          <LazyImage
            src={transformImageUrl(image, { width: 480, quality: 80 })}
            alt={name}
            className="food-img"
            decoding="async"
          />
          {badge && (
            <span className="food-badge" style={badgeStyle}>
              {badge.label}
            </span>
          )}
          {user && (
            <motion.button
              className={`food-fav ${faved ? 'faved' : ''}`}
              onClick={handleFavorite}
              whileTap={{ scale: 0.8 }}
              aria-label={faved ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
            >
              {faved ? '♥' : '♡'}
            </motion.button>
          )}
        </div>

        <div className="food-body">
          <div className="food-name">{name}</div>
          <div className="food-meta">
            <span>⏱ {deliveryTime} min</span>
            <span>⭐ {rating}</span>
          </div>
          {restaurant && <div className="food-restaurant">{restaurant}</div>}
          <div className="food-footer">
            <span className="food-price">${Number(price).toFixed(2)}</span>
            <motion.button
              className={`food-add ${added ? 'added' : ''}`}
              onClick={handleAdd}
              whileTap={{ scale: 0.88 }}
              aria-label={`Add ${name} to cart`}
            >
              {added ? '✓' : '+'}
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && <ProductModal product={product} onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
