import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Seo from '@/components/ui/Seo';
import type { DbOrder } from '@/types/product';
import './Orders.css';

const ACTIVE_STATUSES = ['pending', 'confirmed', 'preparing', 'on_the_way'];

export default function TrackOrder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeOrder, setActiveOrder] = useState<DbOrder | null | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ACTIVE_STATUSES)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        const order = (data as DbOrder[])?.[0] ?? null;
        if (order) {
          navigate(`/orders/${order.id}`, { replace: true });
        } else {
          setActiveOrder(null);
        }
      });
  }, [user, navigate]);

  const isLoading = activeOrder === undefined;

  return (
    <div className="page-root">
      <Header />
      <Seo
        title="Track order"
        description="Track your active Equilibrium Food order in real time."
      />
      <main className="orders-page">
        <div className="orders-container">
          {isLoading ? (
            <div className="order-skeleton" style={{ height: 160, borderRadius: '1rem' }} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="orders-empty"
            >
              <p className="orders-empty-icon">📦</p>
              <h2>No active orders</h2>
              <p style={{ color: '#a3a3a3', marginBottom: '1.5rem' }}>
                You don&apos;t have any orders in progress right now.
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                <Link to="/" className="orders-browse-btn">
                  Order now
                </Link>
                <Link
                  to="/orders"
                  className="orders-browse-btn"
                  style={{ background: '#1a1a1a', color: '#f0ede6', border: '1px solid #333' }}
                >
                  Order history
                </Link>
              </div>
              {user && (
                <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#555' }}>
                  Tip: active orders redirect here automatically for real-time tracking
                </p>
              )}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
