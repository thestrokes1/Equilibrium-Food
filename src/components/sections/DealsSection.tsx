import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import type { DealsSectionProps } from '@/types/product';
import './DealsSection.css';

const SECONDARY_DEALS = [
  {
    id: 'pizza',
    icon: '🍕',
    title: 'Pizza Party',
    desc: '$5 off every pizza this weekend',
    discount: '$5 off',
    discountColor: '#f59e0b',
    category: 'pizza',
    cta: 'Shop pizzas →',
  },
  {
    id: 'sushi',
    icon: '🍣',
    title: 'Sushi Night',
    desc: 'Free miso soup on orders over $40',
    discount: 'Free gift',
    discountColor: '#ef4444',
    category: 'sushi',
    cta: 'Shop sushi →',
  },
  {
    id: 'vegan',
    icon: '🥗',
    title: 'Vegan Delight',
    desc: 'New plant-based arrivals every week',
    discount: 'New arrival',
    discountColor: '#22c55e',
    category: 'vegan',
    cta: 'Shop vegan →',
  },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const scrollToMenuWithCategory = (category: string, onSelectCategory?: (_c: string) => void) => {
  onSelectCategory?.(category);
  document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
};

export default function DealsSection({ onSelectCategory }: DealsSectionProps) {
  const { setIsOpen } = useCart();

  return (
    <motion.section
      className="deals-section"
      id="deals"
      variants={sectionVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="section-head">
        <h2 className="section-title">Limited time deals</h2>
        <button className="see-all" onClick={() => setIsOpen(true)}>
          View cart →
        </button>
      </div>

      <div className="deals-grid">
        {/* Main deal */}
        <motion.div
          className="deal-main"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: 'spring', stiffness: 300 }}
          onClick={() => scrollToMenuWithCategory('burgers', onSelectCategory)}
          style={{ cursor: 'pointer' }}
        >
          <div>
            <span className="deal-tag">TODAY ONLY</span>
            <h3 className="deal-title">
              Burger
              <br />
              Bonanza 🍔
            </h3>
            <p className="deal-sub">All burgers. All day. All yours.</p>
          </div>
          <div className="deal-bottom">
            <div className="deal-discount">20% off</div>
            <button
              className="btn-deal"
              onClick={(e) => {
                e.stopPropagation();
                scrollToMenuWithCategory('burgers', onSelectCategory);
              }}
            >
              Shop burgers →
            </button>
          </div>
        </motion.div>

        {/* Secondary deals */}
        <div className="deals-secondary">
          {SECONDARY_DEALS.map((deal, i) => (
            <motion.div
              key={deal.id}
              className="deal-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300 }}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              custom={i}
              style={{ cursor: 'pointer' }}
              onClick={() => scrollToMenuWithCategory(deal.category, onSelectCategory)}
            >
              <div>
                <div className="deal-sm-icon">{deal.icon}</div>
                <div className="deal-sm-title">{deal.title}</div>
                <div className="deal-sm-sub">{deal.desc}</div>
                <div className="deal-sm-discount" style={{ color: deal.discountColor }}>
                  {deal.discount}
                </div>
              </div>
              <button
                className="btn-deal-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToMenuWithCategory(deal.category, onSelectCategory);
                }}
              >
                {deal.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
