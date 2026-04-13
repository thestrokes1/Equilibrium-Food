import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { useKeyPress } from '@/hooks/useKeyPress';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import type { Product } from '@/types/product';
import './ProductModal.css';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useKeyPress('Escape', useCallback(onClose, [onClose]));
  useFocusTrap(panelRef, true);

  if (!product) return null;

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1000);
  };

  // Render into document.body via portal so position:fixed is relative
  // to the viewport, not any transformed Framer Motion ancestor.
  return createPortal(
    <AnimatePresence>
      {/* Backdrop and panel are siblings so aria-hidden on backdrop
          doesn't suppress the dialog from the accessibility tree */}
      <>
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          aria-hidden="true"
        />
        <motion.div
          ref={panelRef}
          className="modal-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>

          {/* Image */}
          <div className="modal-img-wrap">
            <img src={product.image} alt={product.name} className="modal-img" loading="lazy" />
            {product.badge && (
              <span
                className="modal-badge"
                style={{
                  background:
                    product.badge.type === 'new'
                      ? '#f59e0b'
                      : product.badge.type === 'popular'
                        ? '#ef4444'
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
                <h2 id="modal-title" className="modal-name">
                  {product.name}
                </h2>
                {product.restaurant && <p className="modal-restaurant">{product.restaurant}</p>}
              </div>
              <div className="modal-price">${Number(product.price).toFixed(2)}</div>
            </div>

            <div className="modal-meta">
              <span className="modal-meta-pill">⏱ {product.deliveryTime ?? '25'} min</span>
              <span className="modal-meta-pill">⭐ {product.rating ?? '4.7'}</span>
              <span className="modal-meta-pill">🍽️ {product.category}</span>
            </div>

            {product.description && <p className="modal-desc">{product.description}</p>}

            {/* Quantity + Add */}
            <div className="modal-footer">
              <div className="modal-qty">
                <button
                  className="qty-btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="qty-num" aria-label={`Quantity: ${qty}`}>
                  {qty}
                </span>
                <button
                  className="qty-btn"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button className={`modal-add-btn ${added ? 'added' : ''}`} onClick={handleAdd}>
                {added
                  ? '✓ Added to cart!'
                  : `Add ${qty > 1 ? `${qty}x ` : ''}— $${(product.price * qty).toFixed(2)}`}
              </button>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>,
    document.body
  );
}
