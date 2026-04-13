import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FoodCard from '../product/FoodCard';
import SkeletonCard from '../product/SkeletonCard';
import { SKELETON_COUNT, SKELETON_LOADING_MS } from '@/constants';
import type { MenuSectionProps } from '@/types/product';
import './MenuSection.css';

export default function MenuSection({
  categories,
  products,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearch,
  onAddToCart,
  initialLoading = false,
}: MenuSectionProps) {
  const [skeletonLoading, setSkeletonLoading] = useState(true);
  const loading = initialLoading || skeletonLoading;
  const allCategories = ['all', ...categories];

  useEffect(() => {
    const t = setTimeout(() => setSkeletonLoading(false), SKELETON_LOADING_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="menu-section" id="menu">
      <div className="section-head">
        <h2 className="section-title">Browse the menu</h2>
        <button className="see-all">See all →</button>
      </div>

      {/* Search bar */}
      <div className="search-wrap" role="search">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search dishes or restaurants..."
          value={searchQuery}
          aria-label="Search dishes or restaurants"
          onChange={(e: import('react').ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
        />
        {searchQuery && (
          <button className="search-clear" onClick={() => onSearch('')}>
            ✕
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="cat-row">
        {allCategories.map((cat) => (
          <button
            key={cat}
            className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Skeleton grid */}
      {loading && (
        <div className="food-grid">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Real grid */}
      {!loading && (
        <>
          {products.length === 0 && (
            <div className="empty-state">
              <p className="empty-state-icon">🍽️</p>
              <p className="empty-state-title">No dishes found</p>
              <p className="empty-state-sub">Try a different search or category</p>
              <button className="empty-state-btn" onClick={() => onSearch('')}>
                Clear search
              </button>
            </div>
          )}

          <div className="food-grid">
            <AnimatePresence mode="popLayout">
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
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
                    description={product.description}
                    onAdd={onAddToCart}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </section>
  );
}
