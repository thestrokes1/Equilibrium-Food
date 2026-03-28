import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <Link to="/" className="footer-logo">
        Equilibrium<span className="footer-dot">.</span>
      </Link>
      <p className="footer-note">© 2026 Equilibrium. · All rights reserved</p>
    </footer>
  );
}