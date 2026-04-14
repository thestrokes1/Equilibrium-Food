import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import type { DbOrder, DbOrderItem, Product } from '@/types/product';
import './Orders.css';

const STEPS = [
  { key: 'pending', label: 'Order placed', icon: '📋' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'on_the_way', label: 'On the way', icon: '🚴' },
  { key: 'delivered', label: 'Delivered', icon: '🎉' },
];

function getStepIndex(status: string) {
  return STEPS.findIndex((s) => s.key === status);
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addItem, setIsOpen } = useCart();
  const { addToast } = useToast();
  const [order, setOrder] = useState<DbOrder | null>(null);
  const [items, setItems] = useState<DbOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const handleReorder = () => {
    items.forEach((item) => {
      const product: Product = {
        id: item.menu_item_id ?? item.id,
        name: item.item_name,
        price: item.unit_price,
        image: item.item_image ?? '',
        category: '',
        rating: 0,
        deliveryTime: '',
        restaurant: '',
      };
      addItem(product, item.qty);
    });
    setIsOpen(true);
    addToast({ title: 'Items added to cart', icon: '🛒', type: 'success' });
  };

  useEffect(() => {
    if (!user || !id) return;
    Promise.all([
      supabase.from('orders').select('*').eq('id', id).eq('user_id', user.id).single(),
      supabase.from('order_items').select('*').eq('order_id', id),
    ]).then(([orderRes, itemsRes]) => {
      if (orderRes.error || !orderRes.data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setOrder(orderRes.data as DbOrder);
      setItems((itemsRes.data as DbOrderItem[]) ?? []);
      setLoading(false);
    });
  }, [user, id]);

  // Realtime: update order status as it changes in the DB
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`order-status-${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` },
        (payload) => {
          setOrder((prev) => (prev ? { ...prev, ...(payload.new as DbOrder) } : prev));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="order-skeleton" style={{ height: 300, borderRadius: '1rem' }} />
        </div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <h2>Order not found</h2>
          <Link to="/orders" className="orders-browse-btn" style={{ marginTop: '1rem' }}>
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="order-detail-nav">
          <Link to="/orders" className="order-back-link">
            ← All orders
          </Link>
          <div className="order-detail-actions">
            <button
              className="order-action-btn"
              onClick={handleReorder}
              disabled={items.length === 0}
            >
              🔁 Re-order
            </button>
            <button
              className="order-action-btn order-action-btn--print"
              onClick={() => window.print()}
            >
              🖨️ Print ticket
            </button>
          </div>
        </div>

        <motion.div
          className="order-detail-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="order-detail-header">
            <div>
              <h1 className="order-detail-id">
                Order #{order.id.slice(0, 8).toUpperCase()}
                {!isCancelled && order.status !== 'delivered' && (
                  <span className="order-live-badge" title="Status updates in real-time">
                    <span className="order-live-dot" /> LIVE
                  </span>
                )}
              </h1>
              <p className="order-detail-date">
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <p className="order-detail-total">${Number(order.total).toFixed(2)}</p>
          </div>

          {/* Status timeline */}
          {!isCancelled && (
            <div className="order-timeline">
              {STEPS.map((step, i) => (
                <div
                  key={step.key}
                  className={`order-timeline-step ${i <= currentStep ? 'done' : ''} ${i === currentStep ? 'active' : ''}`}
                >
                  <div className="order-timeline-dot">{i <= currentStep ? step.icon : ''}</div>
                  <p className="order-timeline-label">{step.label}</p>
                  {i < STEPS.length - 1 && (
                    <div className={`order-timeline-line ${i < currentStep ? 'done' : ''}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {isCancelled && <div className="order-cancelled-notice">❌ This order was cancelled</div>}

          {/* Address */}
          {order.address_snapshot && (
            <div className="order-address-block">
              <p className="order-address-label">📍 Delivery address</p>
              <p className="order-address-text">
                {order.address_snapshot.street}, {order.address_snapshot.city}
                {order.address_snapshot.zip ? ` ${order.address_snapshot.zip}` : ''}
              </p>
            </div>
          )}

          {order.notes && (
            <div className="order-notes-block">
              <p className="order-notes-label">📝 Notes</p>
              <p className="order-notes-text">&quot;{order.notes}&quot;</p>
            </div>
          )}

          {/* Items */}
          <h3 className="order-items-title">Items</h3>
          <ul className="order-items-list">
            {items.map((item) => (
              <li key={item.id} className="order-item-row">
                {item.item_image && (
                  <img
                    src={item.item_image}
                    alt={item.item_name}
                    className="order-item-img"
                    loading="lazy"
                  />
                )}
                <div className="order-item-info">
                  <p className="order-item-name">
                    {item.qty}× {item.item_name}
                  </p>
                  <p className="order-item-unit">${Number(item.unit_price).toFixed(2)} each</p>
                </div>
                <p className="order-item-subtotal">${(item.unit_price * item.qty).toFixed(2)}</p>
              </li>
            ))}
          </ul>

          {/* Totals */}
          <div className="order-totals">
            <div className="order-total-row">
              <span>Subtotal</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="order-total-row">
              <span>Delivery</span>
              <span className={order.delivery_fee === 0 ? 'order-free' : ''}>
                {order.delivery_fee === 0 ? 'Free 🎉' : `$${Number(order.delivery_fee).toFixed(2)}`}
              </span>
            </div>
            <div className="order-total-row order-total-final">
              <span>Total</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>

          <p className="order-eta">Estimated delivery: ~{order.estimated_minutes} minutes</p>
        </motion.div>
      </div>
    </div>
  );
}
