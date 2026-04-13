import { useState } from 'react';
import { motion } from 'framer-motion';
import { CART_ADDED_FEEDBACK_MS } from '@/constants';
import type { FoodCardProps } from '@/types/product';
import ProductModal from './ProductModal';
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
          <img src={image} alt={name} className="food-img" loading="lazy" />
          {badge && (
            <span className="food-badge" style={badgeStyle}>
              {badge.label}
            </span>
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

      {modalOpen && <ProductModal product={product} onClose={() => setModalOpen(false)} />}
    </>
  );
}
