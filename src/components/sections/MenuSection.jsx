import { motion, AnimatePresence } from 'framer-motion';
import FoodCard from '../product/FoodCard';
import './MenuSection.css';

export default function MenuSection({
  categories,
  products,
  selectedCategory,
  onSelectCategory,
  onAddToCart,
}) {
  const allCategories = ['all', ...categories];

  return (
    <section className="menu-section">
      <div className="section-head">
        <h2 className="section-title">Browse the menu</h2>
        <button className="see-all">See all →</button>
      </div>

      {/* Category pills */}
      <div className="cat-row">
        {allCategories.map(cat => (
          <button
            key={cat}
            className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="food-grid">
        <AnimatePresence mode="popLayout">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <FoodCard
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                category={product.category}
                rating={product.rating}
                deliveryTime={product.deliveryTime}
                restaurant={product.restaurant}
                badge={product.badge}
                onAdd={onAddToCart}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}