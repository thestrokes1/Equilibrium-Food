import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Seo from '@/components/ui/Seo';
import FoodCard from '@/components/product/FoodCard';
import SkeletonCard from '@/components/product/SkeletonCard';
import { useCart } from '@/context/CartContext';
import { getRestaurantBySlug, getMenuItemsByRestaurant } from '@/services/restaurantService';
import type { DbRestaurant, Product } from '@/types/product';
import './RestaurantDetail.css';

export default function RestaurantDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();

  const [restaurant, setRestaurant] = useState<DbRestaurant | null>(null);
  const [menu, setMenu] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    Promise.all([getRestaurantBySlug(slug), null]).then(async ([r]) => {
      if (!r) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const items = await getMenuItemsByRestaurant(r.id).catch(() => []);
      setRestaurant(r);
      setMenu(items);
      setLoading(false);
    });
  }, [slug]);

  if (notFound) {
    return (
      <div className="page-root">
        <Header />
        <main className="rd-page">
          <div className="rd-container">
            <h2 className="rd-not-found">Restaurant not found</h2>
            <Link to="/restaurants" className="rd-back-btn">
              ← All restaurants
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-root">
      <Seo
        title={restaurant?.name ?? 'Restaurant'}
        description={restaurant?.description ?? undefined}
      />
      <Header />
      <main className="rd-page">
        {/* Hero banner */}
        <div className="rd-hero">
          {restaurant?.cover_url ? (
            <img src={restaurant.cover_url} alt={restaurant.name} className="rd-hero-img" />
          ) : (
            <div className="rd-hero-placeholder" />
          )}
          <div className="rd-hero-overlay" />
          <div className="rd-hero-content">
            <Link to="/restaurants" className="rd-back-link">
              ← All restaurants
            </Link>
            {loading ? (
              <div className="rd-hero-skeleton" />
            ) : (
              <>
                <h1 className="rd-name">{restaurant?.name}</h1>
                {restaurant?.description && <p className="rd-desc">{restaurant.description}</p>}
                <div className="rd-stats">
                  <span className="rd-stat">⭐ {Number(restaurant?.rating).toFixed(1)}</span>
                  <span className="rd-stat">⏱ {restaurant?.delivery_time_min} min</span>
                  <span className="rd-stat">
                    {restaurant?.delivery_fee === 0
                      ? '🎉 Free delivery'
                      : `🚚 $${Number(restaurant?.delivery_fee).toFixed(2)}`}
                  </span>
                  <span className="rd-stat">
                    💳 ${Number(restaurant?.min_order).toFixed(0)} min order
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="rd-container">
          <h2 className="rd-menu-title">Menu</h2>

          {loading && (
            <div className="rd-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!loading && menu.length === 0 && (
            <p className="rd-empty">No menu items available right now.</p>
          )}

          {!loading && menu.length > 0 && (
            <div className="rd-grid">
              <AnimatePresence mode="popLayout">
                {menu.map((product, i) => (
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
                      onAdd={addItem}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
