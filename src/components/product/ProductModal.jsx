import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import './ProductModal.css';

export default function ProductModal({ product, onClose }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-panel"
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close */}
          <button className="modal-close" onClick={onClose}>✕</button>

          {/* Image */}
          <div className="modal-img-wrap">
            <img src={product.image} alt={product.name} className="modal-img" />
            {product.badge && (
              <span
                className="modal-badge"
                style={{
                  background: product.badge.type === 'new' ? '#f59e0b'
                    : product.badge.type === 'popular' ? '#ef4444'
                    : '#22c55e',
                  color: '#0d0d0d',
                }}
              >
                {product.badge.label}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="modal-body">
            <div className="modal-top">
              <div>
                <h2 className="modal-name">{product.name}</h2>
                {product.restaurant && (
                  <p className="modal-restaurant">{product.restaurant}</p>
                )}
              </div>
              <div className="modal-price">${Number(product.price).toFixed(2)}</div>
            </div>

            <div className="modal-meta">
              <span className="modal-meta-pill">⏱ {product.deliveryTime ?? '25'} min</span>
              <span className="modal-meta-pill">⭐ {product.rating ?? '4.7'}</span>
              <span className="modal-meta-pill">🍽️ {product.category}</span>
            </div>

            {product.description && (
              <p className="modal-desc">{product.description}</p>
            )}

            {/* Quantity + Add */}
            <div className="modal-footer">
              <div className="modal-qty">
                <button
                  className="qty-btn"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                >−</button>
                <span className="qty-num">{qty}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQty(q => q + 1)}
                >+</button>
              </div>

              <button
                className={`modal-add-btn ${added ? 'added' : ''}`}
                onClick={handleAdd}
              >
                {added
                  ? '✓ Added to cart!'
                  : `Add ${qty > 1 ? `${qty}x ` : ''}— $${(product.price * qty).toFixed(2)}`
                }
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}