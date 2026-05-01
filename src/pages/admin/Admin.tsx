import { useEffect, useState, useCallback, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Seo from '@/components/ui/Seo';
import ImageUploadField from '@/components/ui/ImageUploadField';
import { supabase } from '@/lib/supabase';
import AdminRestaurantsTab from './AdminRestaurantsTab';
import type {
  DbOrder,
  DbMenuItem,
  DbRestaurant,
  DbOrderReview,
  OrderStatus,
} from '@/types/product';
import './Admin.css';

type Tab = 'dashboard' | 'orders' | 'menu' | 'restaurants';

const STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'on_the_way',
  'delivered',
  'cancelled',
];

const STATUS_COLOR: Record<string, string> = {
  pending: '#a3a3a3',
  confirmed: '#60a5fa',
  preparing: '#f59e0b',
  on_the_way: '#34d399',
  delivered: '#22c55e',
  cancelled: '#ef4444',
};

const BADGE_OPTIONS = ['', 'new', 'popular', 'sale'] as const;
const CATEGORIES = [
  'burgers',
  'pizza',
  'sushi',
  'pasta',
  'salads',
  'desserts',
  'drinks',
  'bowls',
  'tacos',
  'other',
];

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalRestaurants: number;
  totalMenuItems: number;
  pendingOrders: number;
  totalReviews: number;
  avgRating: number;
}

type ItemForm = {
  id?: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  image_url: string;
  rating: string;
  delivery_time: string;
  badge_type: string;
  badge_label: string;
  is_available: boolean;
};

const EMPTY_FORM: ItemForm = {
  restaurant_id: '',
  name: '',
  description: '',
  price: '',
  category: '',
  image_url: '',
  rating: '4.5',
  delivery_time: '25',
  badge_type: '',
  badge_label: '',
  is_available: true,
};

export default function Admin() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [recentReviews, setRecentReviews] = useState<(DbOrderReview & { order_id: string })[]>([]);
  const [menu, setMenu] = useState<(DbMenuItem & { restaurants?: DbRestaurant })[]>([]);
  const [restaurants, setRestaurants] = useState<DbRestaurant[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  // Item modal
  const [itemForm, setItemForm] = useState<ItemForm>(EMPTY_FORM);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // ── Stats ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      supabase.from('orders').select('total, status'),
      supabase.from('restaurants').select('id', { count: 'exact', head: true }),
      supabase.from('menu_items').select('id', { count: 'exact', head: true }),
      supabase
        .from('order_reviews')
        .select('rating, order_id, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ]).then(([ordersRes, restRes, menuRes, reviewsRes]) => {
      const rows = (ordersRes.data ?? []) as { total: number; status: string }[];
      const reviews = (reviewsRes.data ?? []) as (DbOrderReview & { order_id: string })[];
      const avgRating = reviews.length
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;
      setStats({
        totalOrders: rows.length,
        totalRevenue: rows.reduce((s, r) => s + Number(r.total), 0),
        totalRestaurants: restRes.count ?? 0,
        totalMenuItems: menuRes.count ?? 0,
        pendingOrders: rows.filter((r) => r.status === 'pending').length,
        totalReviews: reviews.length,
        avgRating,
      });
      setRecentReviews(reviews);
      setLoadingStats(false);
    });
  }, []);

  // ── Orders ─────────────────────────────────────────────────────────────────
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const loadOrders = useCallback(() => {
    setLoadingOrders(true);
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setOrders((data as DbOrder[]) ?? []);
        setLoadingOrders(false);
      });
  }, []);

  // ── Menu ───────────────────────────────────────────────────────────────────
  const loadMenu = useCallback(() => {
    setLoadingMenu(true);
    supabase
      .from('menu_items')
      .select('*, restaurants(name)')
      .order('name')
      .then(({ data }) => {
        setMenu((data as (DbMenuItem & { restaurants?: DbRestaurant })[]) ?? []);
        setLoadingMenu(false);
      });
  }, []);

  const loadRestaurants = useCallback(() => {
    supabase
      .from('restaurants')
      .select('id, name')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => setRestaurants((data as DbRestaurant[]) ?? []));
  }, []);

  useEffect(() => {
    if (tab === 'orders' && orders.length === 0) loadOrders();
    if (tab === 'menu') {
      if (menu.length === 0) loadMenu();
      if (restaurants.length === 0) loadRestaurants();
    }
  }, [tab, orders.length, menu.length, restaurants.length, loadOrders, loadMenu, loadRestaurants]);

  // Realtime subscription — keeps order list current while orders tab is open
  useEffect(() => {
    if (tab !== 'orders') return;
    const channel = supabase
      .channel('admin-orders-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        setOrders((prev) => [payload.new as DbOrder, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        setOrders((prev) =>
          prev.map((o) => (o.id === (payload.new as DbOrder).id ? (payload.new as DbOrder) : o))
        );
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tab]);

  // ── Order status ───────────────────────────────────────────────────────────
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingOrder(orderId);
    await supabase.from('orders').update({ status }).eq('id', orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    setUpdatingOrder(null);

    // Fire-and-forget push notification to the order's customer
    const order = orders.find((o) => o.id === orderId);
    if (order?.user_id) {
      supabase.functions
        .invoke('push-notify', { body: { userId: order.user_id, orderId, status } })
        .catch(() => {});
    }
  };

  // ── Toggle availability ────────────────────────────────────────────────────
  const toggleItemAvailability = async (itemId: string, current: boolean) => {
    await supabase.from('menu_items').update({ is_available: !current }).eq('id', itemId);
    setMenu((prev) => prev.map((m) => (m.id === itemId ? { ...m, is_available: !current } : m)));
  };

  // ── Open modal ─────────────────────────────────────────────────────────────
  const openNew = () => {
    setItemForm({ ...EMPTY_FORM, restaurant_id: restaurants[0]?.id ?? '' });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (item: DbMenuItem) => {
    setItemForm({
      id: item.id,
      restaurant_id: item.restaurant_id,
      name: item.name,
      description: item.description ?? '',
      price: String(item.price),
      category: item.category,
      image_url: item.image_url ?? '',
      rating: String(item.rating),
      delivery_time: item.delivery_time ?? '25',
      badge_type: item.badge_type ?? '',
      badge_label: item.badge_label ?? '',
      is_available: item.is_available,
    });
    setFormError('');
    setModalOpen(true);
  };

  // ── Save (create or update) ────────────────────────────────────────────────
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!itemForm.name.trim() || !itemForm.price || !itemForm.category || !itemForm.restaurant_id) {
      setFormError('Name, price, category, and restaurant are required.');
      return;
    }
    setSaving(true);
    setFormError('');

    const payload = {
      restaurant_id: itemForm.restaurant_id,
      name: itemForm.name.trim(),
      description: itemForm.description.trim() || null,
      price: parseFloat(itemForm.price),
      category: itemForm.category,
      image_url: itemForm.image_url.trim() || null,
      rating: parseFloat(itemForm.rating) || 4.5,
      delivery_time: itemForm.delivery_time || '25',
      badge_type: (itemForm.badge_type || null) as DbMenuItem['badge_type'],
      badge_label: itemForm.badge_label.trim() || null,
      is_available: itemForm.is_available,
    };

    if (itemForm.id) {
      const { error } = await supabase.from('menu_items').update(payload).eq('id', itemForm.id);
      if (error) {
        setFormError(error.message);
        setSaving(false);
        return;
      }
      setMenu((prev) =>
        prev.map((m) =>
          m.id === itemForm.id ? { ...m, ...payload, restaurants: m.restaurants } : m
        )
      );
    } else {
      const { data, error } = await supabase
        .from('menu_items')
        .insert({ ...payload, sort_order: 0 })
        .select('*, restaurants(name)')
        .single();
      if (error) {
        setFormError(error.message);
        setSaving(false);
        return;
      }
      if (data) setMenu((prev) => [...prev, data as DbMenuItem & { restaurants?: DbRestaurant }]);
    }

    setSaving(false);
    setModalOpen(false);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await supabase.from('menu_items').delete().eq('id', deletingId);
    setMenu((prev) => prev.filter((m) => m.id !== deletingId));
    setDeletingId(null);
    setDeleteConfirmOpen(false);
  };

  const filteredOrders =
    statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter);

  const field = (label: string, content: ReactNode, required = false) => (
    <div className="admin-field">
      <label className="admin-field-label">
        {label}
        {required && <span className="admin-field-req"> *</span>}
      </label>
      {content}
    </div>
  );

  const inp = (key: keyof ItemForm, type = 'text', placeholder = '') => (
    <input
      className="admin-input"
      type={type}
      value={String(itemForm[key])}
      placeholder={placeholder}
      onChange={(e) => setItemForm((f) => ({ ...f, [key]: e.target.value }))}
    />
  );

  return (
    <div className="admin-page">
      <Seo title="Admin" description="Admin panel" />
      <div className="admin-header">
        <div className="admin-header-inner">
          <div>
            <h1 className="admin-title">Admin Panel</h1>
            <p className="admin-sub">Equilibrium Food</p>
          </div>
          <Link to="/" className="admin-home-link">
            ← Back to site
          </Link>
        </div>
      </div>

      <div className="admin-body">
        {/* Tab bar */}
        <div className="admin-tabs">
          {(['dashboard', 'orders', 'menu', 'restaurants'] as Tab[]).map((t) => (
            <button
              key={t}
              className={`admin-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'dashboard'
                ? '📊 Dashboard'
                : t === 'orders'
                  ? '📦 Orders'
                  : t === 'menu'
                    ? '🍽️ Menu'
                    : '🏪 Restaurants'}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <div className="admin-section">
            {loadingStats ? (
              <div className="admin-stats-grid">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="admin-stat-skeleton" />
                ))}
              </div>
            ) : (
              <div className="admin-stats-grid">
                {[
                  { label: 'Total orders', value: stats?.totalOrders ?? 0 },
                  { label: 'Revenue', value: `$${(stats?.totalRevenue ?? 0).toFixed(2)}` },
                  { label: 'Pending orders', value: stats?.pendingOrders ?? 0, accent: true },
                  { label: 'Restaurants', value: stats?.totalRestaurants ?? 0 },
                  { label: 'Menu items', value: stats?.totalMenuItems ?? 0 },
                  {
                    label: 'Reviews',
                    value: stats?.totalReviews
                      ? `${stats.totalReviews} · ⭐ ${stats.avgRating.toFixed(1)}`
                      : '0',
                  },
                ].map(({ label, value, accent }, i) => (
                  <motion.div
                    key={label}
                    className={`admin-stat-card ${accent ? 'accent' : ''}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <p className="admin-stat-label">{label}</p>
                    <p className="admin-stat-value">{value}</p>
                  </motion.div>
                ))}
              </div>
            )}
            <div className="admin-quick-actions">
              <h2 className="admin-section-title">Quick actions</h2>
              <div className="admin-action-row">
                <button className="admin-action-btn" onClick={() => setTab('orders')}>
                  View all orders →
                </button>
                <button className="admin-action-btn" onClick={() => setTab('menu')}>
                  Manage menu →
                </button>
              </div>
            </div>

            {recentReviews.length > 0 && (
              <div className="admin-reviews-panel">
                <h2 className="admin-section-title">Recent reviews</h2>
                <ul className="admin-reviews-list">
                  {recentReviews.map((r) => (
                    <li key={r.id} className="admin-review-row">
                      <div className="admin-review-stars">
                        {'★'.repeat(r.rating)}
                        {'☆'.repeat(5 - r.rating)}
                      </div>
                      <div className="admin-review-body">
                        {r.comment && <p className="admin-review-comment">{r.comment}</p>}
                        <p className="admin-review-meta">
                          Order #{r.order_id.slice(0, 8).toUpperCase()} ·{' '}
                          {new Date(r.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === 'orders' && (
          <div className="admin-section">
            <div className="admin-orders-header">
              <h2 className="admin-section-title">Orders</h2>
              <div className="admin-filter-row">
                <select
                  className="admin-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All statuses</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                <button className="admin-action-btn" onClick={loadOrders}>
                  Refresh
                </button>
              </div>
            </div>

            {loadingOrders ? (
              <div className="admin-table-skeleton">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="admin-row-skeleton" />
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <p className="admin-empty">No orders found.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Change status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const isExpanded = expandedOrderId === order.id;
                      const itemCount = order.order_items?.length ?? 0;
                      return (
                        <>
                          <tr key={order.id}>
                            <td className="admin-order-id">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </td>
                            <td className="admin-order-date">
                              {new Date(order.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td>
                              <button
                                className={`admin-expand-btn ${isExpanded ? 'open' : ''}`}
                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                              >
                                {itemCount} item{itemCount !== 1 ? 's' : ''}{' '}
                                <span className="admin-expand-arrow">{isExpanded ? '▲' : '▼'}</span>
                              </button>
                            </td>
                            <td className="admin-order-total">${Number(order.total).toFixed(2)}</td>
                            <td>
                              <span
                                className="admin-status-badge"
                                style={{ color: STATUS_COLOR[order.status] ?? '#a3a3a3' }}
                              >
                                {order.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td>
                              <select
                                className="admin-select admin-select--sm"
                                value={order.status}
                                disabled={updatingOrder === order.id}
                                onChange={(e) =>
                                  updateOrderStatus(order.id, e.target.value as OrderStatus)
                                }
                              >
                                {STATUS_OPTIONS.map((s) => (
                                  <option key={s} value={s}>
                                    {s.replace('_', ' ')}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr key={`${order.id}-detail`} className="admin-order-detail-row">
                              <td colSpan={6}>
                                <div className="admin-order-detail">
                                  {order.order_items && order.order_items.length > 0 ? (
                                    <ul className="admin-order-items-list">
                                      {order.order_items.map((item) => (
                                        <li key={item.id} className="admin-order-item-row">
                                          <span className="admin-order-item-qty">{item.qty}×</span>
                                          <span className="admin-order-item-name">
                                            {item.item_name}
                                          </span>
                                          <span className="admin-order-item-price">
                                            ${(item.unit_price * item.qty).toFixed(2)}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="admin-order-no-items">No items recorded</p>
                                  )}
                                  {order.notes && (
                                    <p className="admin-order-meta">
                                      <span className="admin-order-meta-label">Note:</span>{' '}
                                      {order.notes}
                                    </p>
                                  )}
                                  {order.address_snapshot && (
                                    <p className="admin-order-meta">
                                      <span className="admin-order-meta-label">Deliver to:</span>{' '}
                                      {order.address_snapshot.street}, {order.address_snapshot.city}
                                    </p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── MENU ── */}
        {tab === 'menu' && (
          <div className="admin-section">
            <div className="admin-orders-header">
              <h2 className="admin-section-title">Menu items</h2>
              <div className="admin-filter-row">
                <button className="admin-action-btn" onClick={loadMenu}>
                  Refresh
                </button>
                <button className="admin-add-btn" onClick={openNew}>
                  + Add item
                </button>
              </div>
            </div>

            {loadingMenu ? (
              <div className="admin-table-skeleton">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="admin-row-skeleton" />
                ))}
              </div>
            ) : menu.length === 0 ? (
              <p className="admin-empty">No menu items found.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Restaurant</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Available</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menu.map((item) => (
                      <tr
                        key={item.id}
                        className={!item.is_available ? 'admin-row-unavailable' : ''}
                      >
                        <td className="admin-item-name">{item.name}</td>
                        <td className="admin-item-rest">{item.restaurants?.name ?? '—'}</td>
                        <td className="admin-item-cat">{item.category}</td>
                        <td className="admin-item-price">${Number(item.price).toFixed(2)}</td>
                        <td>
                          <button
                            className={`admin-toggle-btn ${item.is_available ? 'on' : 'off'}`}
                            onClick={() => toggleItemAvailability(item.id, item.is_available)}
                          >
                            {item.is_available ? 'Available' : 'Hidden'}
                          </button>
                        </td>
                        <td className="admin-actions-cell">
                          <button className="admin-edit-btn" onClick={() => openEdit(item)}>
                            Edit
                          </button>
                          <button
                            className="admin-delete-btn"
                            onClick={() => confirmDelete(item.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── RESTAURANTS ── */}
        {tab === 'restaurants' && <AdminRestaurantsTab />}
      </div>

      {/* ── ITEM MODAL ── */}
      {modalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setModalOpen(false)}>
          <motion.div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.18 }}
          >
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">{itemForm.id ? 'Edit item' : 'New menu item'}</h2>
              <button className="admin-modal-close" onClick={() => setModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} noValidate>
              <div className="admin-modal-body">
                {formError && <p className="admin-form-error">{formError}</p>}

                <div className="admin-field-row-2">
                  {field('Name', inp('name', 'text', 'e.g. Smash Burger'), true)}
                  {field('Price ($)', inp('price', 'number', '12.90'), true)}
                </div>

                <div className="admin-field-row-2">
                  {field(
                    'Category',
                    <select
                      className="admin-input"
                      value={itemForm.category}
                      onChange={(e) => setItemForm((f) => ({ ...f, category: e.target.value }))}
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>,
                    true
                  )}
                  {field(
                    'Restaurant',
                    <select
                      className="admin-input"
                      value={itemForm.restaurant_id}
                      onChange={(e) =>
                        setItemForm((f) => ({ ...f, restaurant_id: e.target.value }))
                      }
                    >
                      <option value="">Select restaurant</option>
                      {restaurants.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>,
                    true
                  )}
                </div>

                <div className="admin-field-row-2">
                  {field('Rating (0–5)', inp('rating', 'number', '4.5'))}
                  {field('Delivery time (min)', inp('delivery_time', 'text', '25'))}
                </div>

                {field(
                  'Image',
                  <ImageUploadField
                    value={itemForm.image_url}
                    onChange={(url) => setItemForm((f) => ({ ...f, image_url: url }))}
                    folder="menu"
                    placeholder="https://..."
                  />
                )}
                {field(
                  'Description',
                  <textarea
                    className="admin-input admin-textarea"
                    value={itemForm.description}
                    placeholder="Short description..."
                    onChange={(e) => setItemForm((f) => ({ ...f, description: e.target.value }))}
                  />
                )}

                <div className="admin-field-row-2">
                  {field(
                    'Badge type',
                    <select
                      className="admin-input"
                      value={itemForm.badge_type}
                      onChange={(e) => setItemForm((f) => ({ ...f, badge_type: e.target.value }))}
                    >
                      {BADGE_OPTIONS.map((b) => (
                        <option key={b} value={b}>
                          {b || 'None'}
                        </option>
                      ))}
                    </select>
                  )}
                  {field('Badge label', inp('badge_label', 'text', 'e.g. 20% off'))}
                </div>

                <div className="admin-field">
                  <label className="admin-toggle-label">
                    <input
                      type="checkbox"
                      checked={itemForm.is_available}
                      onChange={(e) =>
                        setItemForm((f) => ({ ...f, is_available: e.target.checked }))
                      }
                    />
                    Available for ordering
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-action-btn"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-save-btn" disabled={saving}>
                  {saving ? 'Saving…' : itemForm.id ? 'Save changes' : 'Create item'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteConfirmOpen && (
        <div className="admin-modal-backdrop" onClick={() => setDeleteConfirmOpen(false)}>
          <motion.div
            className="admin-modal admin-modal--sm"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Delete item?</h2>
            </div>
            <div className="admin-modal-body">
              <p className="admin-confirm-text">
                This action cannot be undone. The menu item will be permanently removed.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-action-btn" onClick={() => setDeleteConfirmOpen(false)}>
                Cancel
              </button>
              <button className="admin-delete-confirm-btn" onClick={handleDelete}>
                Yes, delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
