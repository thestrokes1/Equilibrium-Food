import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './FoodCard.css';

const BADGE_STYLES = {
  sale:    { background: '#22c55e', color: '#0d0d0d' },
  new:     { background: '#f59e0b', color: '#0d0d0d' },
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
  onAdd,
}) {
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    setAdded(true);
    onAdd?.({ id, name, price, image, restaurant });
    setTimeout(() => setAdded(false), 1200);
  };

  const badgeStyle = badge ? BADGE_STYLES[badge.type] ?? BADGE_STYLES.sale : null;

  return (
    <Link to={`/product/${id}`} className="food-card" tabIndex={0}>
      {/* Image */}
      <div className="food-img-wrap">
        <img src={image} alt={name} className="food-img" loading="lazy" />
        {badge && (
          <span className="food-badge" style={badgeStyle}>
            {badge.label}
          </span>
        )}
      </div>

      {/* Body */}
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
    </Link>
  );
}