import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Menu',        href: '#menu'        },
  { label: 'Restaurants', href: '#restaurants'  },
  { label: 'Deals',       href: '#deals'        },
  { label: 'Track order', href: '#track'        },
];

export default function Navbar() {
  const { totalItems, setIsOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="nav-logo">
          Equilibrium<span className="nav-logo-dot">.</span>
        </Link>

        <ul className="nav-links">
          {NAV_LINKS.map(link => (
            <li key={link.href}>
              <a href={link.href} className="nav-link">{link.label}</a>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          <button
            className="nav-cart"
            onClick={() => setIsOpen(true)}
            aria-label={`Open cart, ${totalItems} items`}
          >
            <span>Cart</span>
            <span className={`cart-badge ${totalItems > 0 ? 'has-items' : ''}`}>
              {totalItems}
            </span>
          </button>

          <button className="btn-signin">Sign in</button>

          <button
            className="hamburger"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span className={`ham-line ${mobileOpen ? 'open' : ''}`} />
            <span className={`ham-line ${mobileOpen ? 'open' : ''}`} />
            <span className={`ham-line ${mobileOpen ? 'open' : ''}`} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="mobile-link"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mobile-divider" />
            <button
              className="mobile-cart-btn"
              onClick={() => { setIsOpen(true); setMobileOpen(false); }}
            >
              🛒 Cart {totalItems > 0 && <span className="mobile-cart-count">{totalItems}</span>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}