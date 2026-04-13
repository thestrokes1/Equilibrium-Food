import { motion, useReducedMotion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import type { HeroProps } from '@/types/product';
import './Hero.css';

const STATS = [
  { num: '25 min', label: 'Avg delivery' },
  { num: '4.9 ★', label: 'Avg rating' },
  { num: '1M+', label: 'Happy orders' },
  { num: '24/7', label: 'Always open' },
];

export default function Hero({ onSelectCategory }: HeroProps) {
  const { setIsOpen } = useCart();
  const reduceMotion = useReducedMotion();

  const fadeLeft = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : { hidden: { opacity: 0, x: -40 }, show: { opacity: 1, x: 0 } };
  const fadeRight = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : { hidden: { opacity: 0, x: 40 }, show: { opacity: 1, x: 0 } };

  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  const goToTopRated = () => {
    onSelectCategory?.('burgers');
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero">
      {/* ── LEFT ── */}
      <motion.div
        className="hero-left"
        variants={fadeLeft}
        initial="hidden"
        animate="show"
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <div className="hero-tag">
          <span className="hero-tag-dot" />
          1,000+ restaurants live now
        </div>

        <h1 className="hero-heading">
          Crave it.
          <br />
          Get it <span className="hero-accent">fresh.</span>
        </h1>

        <p className="hero-sub">
          Your favorite meals delivered to your door in under 30 minutes. Real food, real fast.
        </p>

        <div className="hero-actions">
          <motion.button
            className="btn-hero-primary"
            onClick={scrollToMenu}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
          >
            Order now
          </motion.button>
          <motion.button
            className="btn-hero-ghost"
            onClick={() => setIsOpen(true)}
            whileTap={{ scale: 0.97 }}
          >
            <span className="play-icon">🛒</span> View cart
          </motion.button>
        </div>

        <div className="hero-stats">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className="hero-stat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
            >
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── RIGHT ── */}
      <motion.div
        className="hero-right"
        variants={fadeRight}
        initial="hidden"
        animate="show"
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <div className="hero-img-wrap">
          <img
            src="/images/smash-burger.jpg"
            alt="Delicious food"
            className="hero-img"
            loading="eager"
          />
        </div>

        {/* Delivery card — bottom left, not clickable */}
        <motion.div
          className="float-card float-card-bl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="float-icon">🚴</div>
          <div>
            <div className="float-title">On the way</div>
            <div className="float-sub">Arrives in 12 min</div>
          </div>
        </motion.div>

        {/* Top rated card — clickable, filters to burgers */}
        <motion.button
          className="float-card float-card-tr float-card-clickable"
          onClick={goToTopRated}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.97 }}
          aria-label="View top rated burgers"
        >
          <div className="float-icon">⭐</div>
          <div>
            <div className="float-title">Top rated</div>
            <div className="float-sub">1,204 reviews</div>
          </div>
          <div className="float-arrow">→</div>
        </motion.button>
      </motion.div>
    </section>
  );
}
