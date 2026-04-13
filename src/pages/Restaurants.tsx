import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TopBar from '@/components/layout/TopBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Seo from '@/components/ui/Seo';
import { getRestaurants } from '@/services/restaurantService';
import type { DbRestaurant } from '@/types/product';
import './Restaurants.css';

const CATEGORY_EMOJI: Record<string, string> = {
  burgers: '🍔',
  pizza: '🍕',
  sushi: '🍣',
  vegan: '🥗',
  pasta: '🍝',
  tacos: '🌮',
  mains: '🍽️',
};

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState<DbRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getRestaurants()
      .then((data) => {
        setRestaurants(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load restaurants. Please try again.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="page-root">
      <Seo title="Restaurants" description="Browse all restaurants on Equilibrium Food." />
      <TopBar />
      <Navbar />
      <main className="restaurants-page">
        <div className="restaurants-container">
          <div className="restaurants-header">
            <h1 className="restaurants-title">All restaurants</h1>
            <p className="restaurants-sub">Pick a spot and explore their full menu</p>
          </div>

          {loading && (
            <div className="restaurants-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="restaurant-skeleton" />
              ))}
            </div>
          )}

          {error && <p className="restaurants-error">{error}</p>}

          {!loading && !error && restaurants.length === 0 && (
            <p className="restaurants-empty">No restaurants available right now.</p>
          )}

          {!loading && !error && restaurants.length > 0 && (
            <div className="restaurants-grid">
              {restaurants.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/restaurants/${r.slug}`} className="restaurant-card">
                    <div className="restaurant-cover">
                      {r.cover_url ? (
                        <img
                          src={r.cover_url}
                          alt={r.name}
                          className="restaurant-cover-img"
                          loading="lazy"
                        />
                      ) : (
                        <div className="restaurant-cover-placeholder">
                          {CATEGORY_EMOJI[r.category] ?? '🍽️'}
                        </div>
                      )}
                      <span className="restaurant-category-tag">
                        {CATEGORY_EMOJI[r.category] ?? ''} {r.category}
                      </span>
                    </div>

                    <div className="restaurant-info">
                      <div className="restaurant-name-row">
                        <h2 className="restaurant-name">{r.name}</h2>
                        <span className="restaurant-rating">⭐ {Number(r.rating).toFixed(1)}</span>
                      </div>
                      {r.description && <p className="restaurant-desc">{r.description}</p>}
                      <div className="restaurant-meta">
                        <span>⏱ {r.delivery_time_min} min</span>
                        <span>
                          {r.delivery_fee === 0
                            ? '🎉 Free delivery'
                            : `🚚 $${Number(r.delivery_fee).toFixed(2)} delivery`}
                        </span>
                        <span>💳 ${Number(r.min_order).toFixed(0)} min</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
