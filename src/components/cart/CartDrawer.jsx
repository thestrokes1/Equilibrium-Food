import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import './CartDrawer.css';

export default function CartDrawer() {
  const {
    items,
    isOpen,
    setIsOpen,
    removeItem,
    updateQty,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();

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
            className="cart-drawer"
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
                  <p className="drawer-count">{totalItems} item{totalItems > 1 ? 's' : ''}</p>
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
                <button
                  className="btn-continue"
                  onClick={() => setIsOpen(false)}
                >
                  Browse menu
                </button>
              </div>
            ) : (
              <>
                {/* Items list */}
                <div className="drawer-items">
                  <AnimatePresence>
                    {items.map(item => (
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
                          />
                        </div>
                        <div className="item-info">
                          <p className="item-name">{item.name}</p>
                          <p className="item-rest">{item.restaurant}</p>
                          <p className="item-price">
                            ${(item.price * item.qty).toFixed(2)}
                          </p>
                        </div>
                        <div className="item-controls">
                          <button
                            className="qty-btn"
                            onClick={() => updateQty(item.id, item.qty - 1)}
                            aria-label="Decrease quantity"
                          >−</button>
                          <span className="qty-num">{item.qty}</span>
                          <button
                            className="qty-btn"
                            onClick={() => updateQty(item.id, item.qty + 1)}
                            aria-label="Increase quantity"
                          >+</button>
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
                    <span className={totalPrice >= 25 ? 'free-tag' : ''}>
                      {totalPrice >= 25 ? 'Free 🎉' : '$3.99'}
                    </span>
                  </div>
                  <div className="drawer-total">
                    <span>Total</span>
                    <span>
                      ${(totalPrice >= 25
                        ? totalPrice
                        : totalPrice + 3.99
                      ).toFixed(2)}
                    </span>
                  </div>
                  <button className="btn-checkout">
                    Checkout →
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