import { Link } from 'react-router-dom';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Menu', to: '/menu' },
  { label: 'Restaurants', to: '/restaurants' },
  { label: 'Deals', to: '/deals' },
  { label: 'Track order', to: '/track' },
];

export default function Navbar({ cartCount = 0 }) {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        Equilibrium-Food<span className="nav-logo-dot">.</span>
      </Link>

      <ul className="nav-links">
        {NAV_LINKS.map(link => (
          <li key={link.to}>
            <Link to={link.to} className="nav-link">{link.label}</Link>
          </li>
        ))}
      </ul>

      <div className="nav-right">
        <button className="nav-cart" aria-label={`Cart with ${cartCount} items`}>
          <span>Cart</span>
          <span className="cart-badge">{cartCount}</span>
        </button>
        <button className="btn-signin">Sign in</button>
      </div>
    </nav>
  );
}