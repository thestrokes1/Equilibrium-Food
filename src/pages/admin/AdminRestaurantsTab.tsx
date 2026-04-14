import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import type { DbRestaurant } from '@/types/product';

const CATEGORIES = ['burgers', 'pizza', 'sushi', 'pasta', 'tacos', 'vegan', 'mains', 'other'];

type RestForm = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  rating: string;
  delivery_time_min: string;
  delivery_fee: string;
  min_order: string;
  is_active: boolean;
  logo_url: string;
  cover_url: string;
};

const EMPTY: RestForm = {
  name: '',
  slug: '',
  description: '',
  category: '',
  rating: '4.5',
  delivery_time_min: '30',
  delivery_fee: '3.99',
  min_order: '10',
  is_active: true,
  logo_url: '',
  cover_url: '',
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function AdminRestaurantsTab() {
  const [restaurants, setRestaurants] = useState<DbRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<RestForm>(EMPTY);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    supabase
      .from('restaurants')
      .select('*')
      .order('name')
      .then(({ data }) => {
        setRestaurants((data as DbRestaurant[]) ?? []);
        setLoading(false);
      });

    // Realtime: auto-refresh when another admin edits restaurants
    const channel = supabase
      .channel('admin-restaurants-rt')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'restaurants' },
        (payload) => setRestaurants((prev) => [...prev, payload.new as DbRestaurant])
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'restaurants' },
        (payload) =>
          setRestaurants((prev) =>
            prev.map((r) =>
              r.id === (payload.new as DbRestaurant).id ? (payload.new as DbRestaurant) : r
            )
          )
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'restaurants' },
        (payload) =>
          setRestaurants((prev) => prev.filter((r) => r.id !== (payload.old as DbRestaurant).id))
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const openNew = () => {
    setForm(EMPTY);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (r: DbRestaurant) => {
    setForm({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description ?? '',
      category: r.category,
      rating: String(r.rating),
      delivery_time_min: String(r.delivery_time_min),
      delivery_fee: String(r.delivery_fee),
      min_order: String(r.min_order),
      is_active: r.is_active,
      logo_url: r.logo_url ?? '',
      cover_url: r.cover_url ?? '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim() || !form.category) {
      setFormError('Name, slug, and category are required.');
      return;
    }
    setSaving(true);
    setFormError('');

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      category: form.category,
      rating: parseFloat(form.rating) || 4.5,
      delivery_time_min: parseInt(form.delivery_time_min) || 30,
      delivery_fee: parseFloat(form.delivery_fee) || 0,
      min_order: parseFloat(form.min_order) || 0,
      is_active: form.is_active,
      logo_url: form.logo_url.trim() || null,
      cover_url: form.cover_url.trim() || null,
    };

    if (form.id) {
      const { error } = await supabase.from('restaurants').update(payload).eq('id', form.id);
      if (error) {
        setFormError(error.message);
        setSaving(false);
        return;
      }
      setRestaurants((prev) => prev.map((r) => (r.id === form.id ? { ...r, ...payload } : r)));
    } else {
      const { data, error } = await supabase
        .from('restaurants')
        .insert(payload)
        .select('*')
        .single();
      if (error) {
        setFormError(error.message);
        setSaving(false);
        return;
      }
      if (data) setRestaurants((prev) => [...prev, data as DbRestaurant]);
    }

    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await supabase.from('restaurants').delete().eq('id', deletingId);
    setRestaurants((prev) => prev.filter((r) => r.id !== deletingId));
    setDeletingId(null);
    setDeleteConfirmOpen(false);
  };

  const setF = (key: keyof RestForm, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const inp = (key: keyof RestForm, type = 'text', placeholder = '') => (
    <input
      className="admin-input"
      type={type}
      value={String(form[key])}
      placeholder={placeholder}
      onChange={(e) => setF(key, e.target.value)}
    />
  );

  return (
    <>
      <div className="admin-section">
        <div className="admin-orders-header">
          <h2 className="admin-section-title">Restaurants</h2>
          <button className="admin-add-btn" onClick={openNew}>
            + Add restaurant
          </button>
        </div>

        {loading ? (
          <div className="admin-table-skeleton">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="admin-row-skeleton" />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <p className="admin-empty">No restaurants found.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Category</th>
                  <th>Rating</th>
                  <th>Delivery</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((r) => (
                  <tr key={r.id} className={!r.is_active ? 'admin-row-unavailable' : ''}>
                    <td className="admin-item-name">{r.name}</td>
                    <td className="admin-item-cat">{r.slug}</td>
                    <td className="admin-item-cat">{r.category}</td>
                    <td className="admin-item-price">⭐ {Number(r.rating).toFixed(1)}</td>
                    <td className="admin-item-cat">⏱ {r.delivery_time_min} min</td>
                    <td>
                      <span className={`admin-toggle-btn ${r.is_active ? 'on' : 'off'}`}>
                        {r.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="admin-actions-cell">
                      <button className="admin-edit-btn" onClick={() => openEdit(r)}>
                        Edit
                      </button>
                      <button
                        className="admin-delete-btn"
                        onClick={() => {
                          setDeletingId(r.id);
                          setDeleteConfirmOpen(true);
                        }}
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

      {/* ── CREATE / EDIT MODAL ── */}
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
              <h2 className="admin-modal-title">
                {form.id ? 'Edit restaurant' : 'New restaurant'}
              </h2>
              <button className="admin-modal-close" onClick={() => setModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} noValidate>
              <div className="admin-modal-body">
                {formError && <p className="admin-form-error">{formError}</p>}

                <div className="admin-field-row-2">
                  <div className="admin-field">
                    <label className="admin-field-label">
                      Name <span className="admin-field-req">*</span>
                    </label>
                    <input
                      className="admin-input"
                      type="text"
                      value={form.name}
                      placeholder="e.g. Burger Republic"
                      onChange={(e) => {
                        const name = e.target.value;
                        setForm((f) => ({
                          ...f,
                          name,
                          slug: f.id ? f.slug : slugify(name),
                        }));
                      }}
                    />
                  </div>
                  <div className="admin-field">
                    <label className="admin-field-label">
                      Slug <span className="admin-field-req">*</span>
                    </label>
                    {inp('slug', 'text', 'burger-republic')}
                  </div>
                </div>

                <div className="admin-field-row-2">
                  <div className="admin-field">
                    <label className="admin-field-label">
                      Category <span className="admin-field-req">*</span>
                    </label>
                    <select
                      className="admin-input"
                      value={form.category}
                      onChange={(e) => setF('category', e.target.value)}
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-field">
                    <label className="admin-field-label">Rating (0–5)</label>
                    {inp('rating', 'number', '4.5')}
                  </div>
                </div>

                <div className="admin-field-row-2">
                  <div className="admin-field">
                    <label className="admin-field-label">Delivery time (min)</label>
                    {inp('delivery_time_min', 'number', '30')}
                  </div>
                  <div className="admin-field">
                    <label className="admin-field-label">Delivery fee ($)</label>
                    {inp('delivery_fee', 'number', '3.99')}
                  </div>
                </div>

                <div className="admin-field-row-2">
                  <div className="admin-field">
                    <label className="admin-field-label">Min order ($)</label>
                    {inp('min_order', 'number', '10')}
                  </div>
                  <div className="admin-field" />
                </div>

                <div className="admin-field">
                  <label className="admin-field-label">Description</label>
                  <textarea
                    className="admin-input admin-textarea"
                    value={form.description}
                    placeholder="Short description..."
                    onChange={(e) => setF('description', e.target.value)}
                  />
                </div>

                <div className="admin-field-row-2">
                  <div className="admin-field">
                    <label className="admin-field-label">Logo URL</label>
                    {inp('logo_url', 'text', 'https://...')}
                  </div>
                  <div className="admin-field">
                    <label className="admin-field-label">Cover URL</label>
                    {inp('cover_url', 'text', 'https://...')}
                  </div>
                </div>

                <div className="admin-field">
                  <label className="admin-toggle-label">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setF('is_active', e.target.checked)}
                    />
                    Active (visible to customers)
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
                  {saving ? 'Saving…' : form.id ? 'Save changes' : 'Create restaurant'}
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
              <h2 className="admin-modal-title">Delete restaurant?</h2>
            </div>
            <div className="admin-modal-body">
              <p className="admin-confirm-text">
                All menu items for this restaurant will also be affected. This cannot be undone.
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
    </>
  );
}
