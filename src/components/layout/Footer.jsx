import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import './Footer.css';

const LINKS = {
  explore: [
    { label: 'Menu',        href: '#menu'  },
    { label: 'Deals',       href: '#deals' },
    { label: 'Restaurants', href: '#'      },
    { label: 'Track order', href: '#'      },
  ],
  company: [
    { label: 'About us',    href: '#' },
    { label: 'Careers',     href: '#' },
    { label: 'Blog',        href: '#' },
    { label: 'Press',       href: '#' },
  ],
  legal: [
    { label: 'Privacy',     href: '#' },
    { label: 'Terms',       href: '#' },
    { label: 'Cookies',     href: '#' },
  ],
};

const SOCIALS = [
  { label: 'X',         icon: '𝕏', href: '#' },
  { label: 'Instagram', icon: '◈', href: '#' },
  { label: 'TikTok',    icon: '♪', href: '#' },
];

export default function Footer() {
  const { addToast } = useToast();

  const handleNewsletter = (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    if (!input.value.includes('@')) {
      addToast({ title: 'Enter a valid email', icon: '⚠️', type: 'error' });
      return;
    }
    addToast({
      title: 'You\'re subscribed!',
      sub: 'Fresh deals landing in your inbox soon.',
      icon: '🎉',
      type: 'success',
    });
    input.value = '';
  };

  return (
    <footer className="footer" id="footer">

      {/* Top row */}
      <div className="footer-top">

        {/* Brand */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            Equilibrium<span className="footer-dot">.</span>
          </Link>
          <p className="footer-tagline">
            Real food, real fast.<br />Delivered fresh to your door.
          </p>
          <div className="footer-socials">
            {SOCIALS.map(s => (
              <a key={s.label} href={s.href} className="social-btn" aria-label={s.label}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="footer-links-grid">
          <div className="footer-col">
            <p className="footer-col-title">Explore</p>
            {LINKS.explore.map(l => (
              <a key={l.label} href={l.href} className="footer-link">{l.label}</a>
            ))}
          </div>
          <div className="footer-col">
            <p className="footer-col-title">Company</p>
            {LINKS.company.map(l => (
              <a key={l.label} href={l.href} className="footer-link">{l.label}</a>
            ))}
          </div>
          <div className="footer-col">
            <p className="footer-col-title">Legal</p>
            {LINKS.legal.map(l => (
              <a key={l.label} href={l.href} className="footer-link">{l.label}</a>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="footer-newsletter">
          <p className="footer-col-title">Stay in the loop</p>
          <p className="newsletter-sub">
            Get exclusive deals and new arrivals straight to your inbox.
          </p>
          <form className="newsletter-form" onSubmit={handleNewsletter}>
            <input
              type="email"
              placeholder="your@email.com"
              className="newsletter-input"
            />
            <button type="submit" className="newsletter-btn">Subscribe</button>
          </form>
        </div>

      </div>

      {/* Bottom row */}
      <div className="footer-bottom">
        <p className="footer-copy">© 2026 Equilibrium. All rights reserved.</p>
        <p className="footer-made">Made with 🍔 in Resistencia, Argentina</p>
      </div>

    </footer>
  );
}