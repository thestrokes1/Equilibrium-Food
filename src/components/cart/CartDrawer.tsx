import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useKeyPress } from '@/hooks/useKeyPress';
import { FREE_DELIVERY_THRESHOLD, DELIVERY_FEE } from '@/constants';
import './CartDrawer.css';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQty, clearCart, totalItems, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const close = useCallback(() => setIsOpen(false), [setIsOpen]);
  const drawerRef = useRef<HTMLDivElement>(null);
  useKeyPress('Escape', close);
  useFocusTrap(drawerRef, isOpen);

  const deliveryFee = totalPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

  const handleCheckout = () => {
    setIsOpen(false);
    if (!user) {
      navigate('/auth/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer panel */}
          <motion.div
            ref={drawerRef}
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="drawer-header">
              <div>
                <h2 className="drawer-title">Your cart</h2>
                {totalItems > 0 && (
                  <p className="drawer-count">
                    {totalItems} item{totalItems > 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <button
                className="drawer-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close cart"
              >
                ✕
              </button>
            </div>

            {/* Empty state */}
            {items.length === 0 ? (
              <div className="drawer-empty">
                <div className="empty-icon">🛒</div>
                <p className="empty-title">Your cart is empty</p>
                <p className="empty-sub">Add some delicious items to get started</p>
                <button className="btn-continue" onClick={() => setIsOpen(false)}>
                  Browse menu
                </button>
              </div>
            ) : (
              <>
                {/* Items list */}
                <div className="drawer-items">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        className="drawer-item"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        layout
                      >
                        <div className="item-img-wrap">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="item-img"
                            loading="lazy"
                          />
                        </div>
                        <div className="item-info">
                          <p className="item-name">{item.name}</p>
                          <p className="item-rest">{item.restaurant}</p>
                          <p className="item-price">${(item.price * item.qty).toFixed(2)}</p>
                        </div>
                        <div className="item-controls">
                          <button
                            className="qty-btn"
                            onClick={() => updateQty(item.id, item.qty - 1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            −
                          </button>
                          <span className="qty-num" aria-label={`${item.qty} in cart`}>
                            {item.qty}
                          </span>
                          <button
                            className="qty-btn"
                            onClick={() => updateQty(item.id, item.qty + 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            +
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="drawer-footer">
                  <div className="drawer-subtotal">
                    <span>Subtotal</span>
                    <span className="subtotal-price">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="drawer-delivery">
                    <span>Delivery</span>
                    <span className={deliveryFee === 0 ? 'free-tag' : ''}>
                      {deliveryFee === 0 ? 'Free 🎉' : `$${DELIVERY_FEE.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="drawer-total">
                    <span>Total</span>
                    <span>${(totalPrice + deliveryFee).toFixed(2)}</span>
                  </div>
                  <button className="btn-checkout" onClick={handleCheckout}>
                    {user ? 'Checkout →' : 'Sign in to checkout →'}
                  </button>
                  <button className="btn-clear" onClick={clearCart}>
                    Clear cart
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
