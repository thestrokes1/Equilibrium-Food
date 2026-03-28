import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './DealsSection.css';

const SECONDARY_DEALS = [
  {
    id: 'pizza',
    icon: '🍕',
    title: 'Pizza Party',
    desc: '$5 off every pizza this weekend',
    discount: '$5 off',
    discountColor: '#f59e0b',
    to: '/deals/pizza',
    cta: 'Shop pizzas →',
  },
  {
    id: 'sushi',
    icon: '🍣',
    title: 'Sushi Night',
    desc: 'Free miso soup on orders over $40',
    discount: 'Free gift',
    discountColor: '#ef4444',
    to: '/deals/sushi',
    cta: 'Shop sushi →',
  },
];

export default function DealsSection() {
  return (
    <section className="deals-section">
      <div className="section-head">
        <h2 className="section-title">Limited time deals</h2>
        <button className="see-all">All deals →</button>
      </div>

      <div className="deals-grid">
        {/* Main deal — full height left card */}
        <motion.div
          className="deal-main"
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div>
            <span className="deal-tag">TODAY ONLY</span>
            <h3 className="deal-title">Burger<br />Bonanza🍔</h3>
            <p className="deal-sub">All burgers. All day. All yours.</p>
          </div>
          <div className="deal-bottom">
            <div className="deal-discount">20% off</div>
            <Link to="/deals/burgers" className="btn-deal">Shop burgers →</Link>
          </div>
        </motion.div>

        {/* Secondary deals stacked */}
        <div className="deals-secondary">
          {SECONDARY_DEALS.map((deal, i) => (
            <motion.div
              key={deal.id}
              className="deal-sm"
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300 }}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div>
                <div className="deal-sm-icon">{deal.icon}</div>
                <div className="deal-sm-title">{deal.title}</div>
                <div className="deal-sm-sub">{deal.desc}</div>
                <div
                  className="deal-sm-discount"
                  style={{ color: deal.discountColor }}
                >
                  {deal.discount}
                </div>
              </div>
              <Link to={deal.to} className="btn-deal-sm">{deal.cta}</Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}