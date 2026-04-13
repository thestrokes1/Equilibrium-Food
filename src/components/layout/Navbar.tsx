import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import './Navbar.css';

interface NavLink {
  label: string;
  href: string | null;
  soon: boolean;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Menu', href: '#menu', soon: false },
  { label: 'Restaurants', href: null, soon: true },
  { label: 'Deals', href: '#deals', soon: false },
  { label: 'Track order', href: null, soon: true },
];

export default function Navbar() {
  const { totalItems, setIsOpen } = useCart();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
    navigate('/');
  };

  const initials = user?.profile?.full_name
    ? user.profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : (user?.email?.[0]?.toUpperCase() ?? '?');

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="nav-logo">
          Equilibrium<span className="nav-logo-dot">.</span>
        </Link>

        <ul className="nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              {link.soon ? (
                <span className="nav-link nav-link-soon">
                  {link.label}
                  <span className="nav-soon-badge">Soon</span>
                </span>
              ) : (
                <a href={link.href ?? '#'} className="nav-link">
                  {link.label}
                </a>
              )}
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
            <span className={`cart-badge ${totalItems > 0 ? 'has-items' : ''}`}>{totalItems}</span>
          </button>

          {user ? (
            <div className="nav-user-wrap">
              <button
                className="nav-avatar"
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-label="User menu"
                aria-expanded={userMenuOpen}
              >
                {initials}
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <motion.div
                      className="nav-user-backdrop"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <motion.div
                      className="nav-user-menu"
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                    >
                      <p className="nav-user-email">{user.email}</p>
                      <Link
                        to="/orders"
                        className="nav-user-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My orders
                      </Link>
                      <Link
                        to="/profile"
                        className="nav-user-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button className="nav-user-item nav-signout" onClick={handleSignOut}>
                        Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/auth/login" className="btn-signin">
              Sign in
            </Link>
          )}

          <button
            className="hamburger"
            onClick={() => setMobileOpen((o) => !o)}
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
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href ?? '#'}
                className="mobile-link"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {user && (
              <>
                <Link to="/orders" className="mobile-link" onClick={() => setMobileOpen(false)}>
                  My orders
                </Link>
                <Link to="/profile" className="mobile-link" onClick={() => setMobileOpen(false)}>
                  Profile
                </Link>
              </>
            )}
            <div className="mobile-divider" />
            <button
              className="mobile-cart-btn"
              onClick={() => {
                setIsOpen(true);
                setMobileOpen(false);
              }}
            >
              🛒 Cart {totalItems > 0 && <span className="mobile-cart-count">{totalItems}</span>}
            </button>
            {!user && (
              <Link to="/auth/login" className="mobile-link" onClick={() => setMobileOpen(false)}>
                Sign in
              </Link>
            )}
            {user && (
              <button className="mobile-link mobile-signout" onClick={handleSignOut}>
                Sign out
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
