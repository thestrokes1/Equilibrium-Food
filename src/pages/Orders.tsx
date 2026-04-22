import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Seo from '@/components/ui/Seo';
import type { DbOrder } from '@/types/product';
import './Orders.css';

const STATUS_LABEL: Record<string, string> = {
  pending: '⏳ Pending',
  confirmed: '✅ Confirmed',
  preparing: '👨‍🍳 Preparing',
  on_the_way: '🚴 On the way',
  delivered: '🎉 Delivered',
  cancelled: '❌ Cancelled',
};

const STATUS_COLOR: Record<string, string> = {
  pending: '#a3a3a3',
  confirmed: '#60a5fa',
  preparing: '#f59e0b',
  on_the_way: '#34d399',
  delivered: '#22c55e',
  cancelled: '#ef4444',
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as DbOrder[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="page-root">
      <Header />
      <Seo title="Your orders" description="Track and manage your Equilibrium Food orders." />
      <main className="orders-page">
        <div className="orders-container">
          {loading ? (
            <>
              <h1 className="orders-title">Your orders</h1>
              <div className="orders-loading">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="order-skeleton" />
                ))}
              </div>
            </>
          ) : orders.length === 0 ? (
            <div className="orders-empty">
              <p className="orders-empty-icon">🛒</p>
              <h2>No orders yet</h2>
              <p>When you place your first order, it will appear here.</p>
              <Link to="/" className="orders-browse-btn">
                Order now
              </Link>
            </div>
          ) : (
            <>
              <div className="orders-header">
                <h1 className="orders-title">Your orders</h1>
                <Link to="/" className="orders-browse-btn">
                  Browse menu
                </Link>
              </div>
              <ul className="orders-list">
                {orders.map((order, i) => (
                  <motion.li
                    key={order.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link to={`/orders/${order.id}`} className="order-card">
                      <div className="order-card-top">
                        <div>
                          <p className="order-id">#{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="order-date">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div>
                          <span
                            className="order-status-badge"
                            style={{ color: STATUS_COLOR[order.status] }}
                          >
                            {STATUS_LABEL[order.status] ?? order.status}
                          </span>
                        </div>
                      </div>
                      <div className="order-card-bottom">
                        <p className="order-address">
                          📍{' '}
                          {order.address_snapshot
                            ? `${order.address_snapshot.street}, ${order.address_snapshot.city}`
                            : 'Address not available'}
                        </p>
                        <p className="order-total">${Number(order.total).toFixed(2)}</p>
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
