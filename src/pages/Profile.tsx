import { useState, type FormEvent, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Seo from '@/components/ui/Seo';
import LazyImage from '@/components/ui/LazyImage';
import type { DbAddress, Product, DbMenuItem } from '@/types/product';
import './Profile.css';

function dbItemToProduct(item: DbMenuItem): Product {
  return {
    id: item.id as unknown as number,
    name: item.name,
    price: Number(item.price),
    image: item.image_url ?? '/images/smash-burger.jpg',
    category: item.category,
    rating: Number(item.rating),
    deliveryTime: item.delivery_time,
    restaurant: item.restaurants?.name ?? '',
    description: item.description ?? undefined,
    badge: item.badge_type
      ? { type: item.badge_type, label: item.badge_label ?? item.badge_type }
      : undefined,
  };
}

export default function Profile() {
  const { user, signOut, refreshProfile } = useAuth();
  const { addItem } = useCart();
  const { favorites, toggle } = useFavorites();

  const [fullName, setFullName] = useState(user?.profile?.full_name ?? '');
  const [phone, setPhone] = useState(user?.profile?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  const [addresses, setAddresses] = useState<DbAddress[]>([]);
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newZip, setNewZip] = useState('');
  const [newLabel, setNewLabel] = useState('Home');
  const [addingAddr, setAddingAddr] = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);

  const [favItems, setFavItems] = useState<Product[]>([]);
  const [favLoading, setFavLoading] = useState(false);
  // Track which items just got added to cart for feedback
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Load addresses
  useEffect(() => {
    if (!user) return;
    supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at')
      .then(({ data }) => {
        setAddresses((data as DbAddress[]) ?? []);
        setLoadingAddr(false);
      });
  }, [user]);

  // Load favorited menu items whenever the favorites set changes
  useEffect(() => {
    if (favorites.size === 0) {
      setFavItems([]);
      setFavLoading(false);
      return;
    }
    setFavLoading(true);
    supabase
      .from('menu_items')
      .select('*, restaurants(name)')
      .in('id', Array.from(favorites))
      .then(({ data }) => {
        setFavItems((data ?? []).map((d) => dbItemToProduct(d as DbMenuItem)));
        setFavLoading(false);
      });
  }, [favorites]);

  const handleAddFavToCart = (item: Product) => {
    addItem(item, 1);
    const key = String(item.id);
    setAddedIds((prev) => new Set(prev).add(key));
    setTimeout(
      () =>
        setAddedIds((prev) => {
          const n = new Set(prev);
          n.delete(key);
          return n;
        }),
      1200
    );
  };

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileError('');
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone })
      .eq('id', user!.id);
    setSaving(false);
    if (error) {
      setProfileError(error.message);
      return;
    }
    await refreshProfile();
    setSavedMsg('Saved!');
    setTimeout(() => setSavedMsg(''), 2500);
  };

  const saveAddress = async (e: FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim() || !newCity.trim()) return;
    setAddingAddr(true);
    const { data, error } = await supabase
      .from('addresses')
      .insert({ user_id: user!.id, label: newLabel, street: newStreet, city: newCity, zip: newZip })
      .select()
      .single();
    setAddingAddr(false);
    if (error || !data) return;
    setAddresses((prev) => [...prev, data as DbAddress]);
    setNewStreet('');
    setNewCity('');
    setNewZip('');
    setNewLabel('Home');
    setShowAddrForm(false);
  };

  const deleteAddress = async (id: string) => {
    await supabase.from('addresses').delete().eq('id', id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const setDefault = async (id: string) => {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user!.id);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })));
  };

  return (
    <div className="page-root">
      <Header />
      <Seo title="My profile" description="Manage your profile, addresses and favorites." />
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-header">
            <Link to="/" className="profile-back">
              ← Menu
            </Link>
            <h1 className="profile-title">My profile</h1>
            <Link to="/orders" className="profile-orders-link">
              My orders
            </Link>
          </div>

          <div className="profile-grid">
            {/* Personal info */}
            <motion.section
              className="profile-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="profile-card-title">Personal information</h2>
              <p className="profile-email">{user?.email}</p>

              {profileError && <div className="profile-error">{profileError}</div>}

              <form onSubmit={saveProfile} className="profile-form">
                <div className="profile-field">
                  <label htmlFor="fullName">Full name</label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Smith"
                  />
                </div>
                <div className="profile-field">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 000 0000"
                  />
                </div>
                <button type="submit" className="profile-save-btn" disabled={saving}>
                  {savedMsg || (saving ? 'Saving…' : 'Save changes')}
                </button>
              </form>

              <button className="profile-signout-btn" onClick={signOut}>
                Sign out
              </button>
            </motion.section>

            {/* Addresses */}
            <motion.section
              className="profile-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="profile-card-header">
                <h2 className="profile-card-title">Saved addresses</h2>
                <button className="profile-add-btn" onClick={() => setShowAddrForm((v) => !v)}>
                  {showAddrForm ? 'Cancel' : '+ Add'}
                </button>
              </div>

              {showAddrForm && (
                <form onSubmit={saveAddress} className="profile-addr-form">
                  <div className="profile-field-row">
                    {['Home', 'Work', 'Other'].map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        className={`profile-label-pill ${newLabel === lbl ? 'active' : ''}`}
                        onClick={() => setNewLabel(lbl)}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                  <div className="profile-field">
                    <label>Street *</label>
                    <input
                      type="text"
                      required
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      placeholder="123 Main St"
                    />
                  </div>
                  <div className="profile-field-2col">
                    <div className="profile-field">
                      <label>City *</label>
                      <input
                        type="text"
                        required
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        placeholder="New York"
                      />
                    </div>
                    <div className="profile-field">
                      <label>ZIP</label>
                      <input
                        type="text"
                        value={newZip}
                        onChange={(e) => setNewZip(e.target.value)}
                        placeholder="10001"
                      />
                    </div>
                  </div>
                  <button type="submit" className="profile-save-btn" disabled={addingAddr}>
                    {addingAddr ? 'Saving…' : 'Save address'}
                  </button>
                </form>
              )}

              {loadingAddr ? (
                <div className="profile-addr-skeleton" />
              ) : addresses.length === 0 ? (
                <p className="profile-no-addr">No saved addresses yet.</p>
              ) : (
                <ul className="profile-addr-list">
                  {addresses.map((addr) => (
                    <li
                      key={addr.id}
                      className={`profile-addr-item ${addr.is_default ? 'default' : ''}`}
                    >
                      <div className="profile-addr-info">
                        <p className="profile-addr-label">
                          {addr.label}{' '}
                          {addr.is_default && <span className="profile-default-tag">Default</span>}
                        </p>
                        <p className="profile-addr-text">
                          {addr.street}, {addr.city} {addr.zip}
                        </p>
                      </div>
                      <div className="profile-addr-actions">
                        {!addr.is_default && (
                          <button className="profile-addr-btn" onClick={() => setDefault(addr.id)}>
                            Set default
                          </button>
                        )}
                        <button className="profile-addr-del" onClick={() => deleteAddress(addr.id)}>
                          ✕
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>
          </div>

          {/* ── FAVORITES ── */}
          <motion.section
            className="profile-card profile-favs-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="profile-card-title">Favorite items ♥</h2>

            {favLoading ? (
              <div className="profile-favs-grid">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="profile-fav-skeleton" />
                ))}
              </div>
            ) : favItems.length === 0 ? (
              <p className="profile-no-addr">
                No favorites yet — heart items on the menu to save them here.
              </p>
            ) : (
              <div className="profile-favs-grid">
                {favItems.map((item) => {
                  const key = String(item.id);
                  const wasAdded = addedIds.has(key);
                  return (
                    <div key={key} className="profile-fav-card">
                      <LazyImage src={item.image} alt={item.name} className="profile-fav-img" />
                      <div className="profile-fav-body">
                        <p className="profile-fav-name">{item.name}</p>
                        {item.restaurant && <p className="profile-fav-rest">{item.restaurant}</p>}
                        <p className="profile-fav-price">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="profile-fav-actions">
                        <button
                          className={`profile-fav-add ${wasAdded ? 'added' : ''}`}
                          onClick={() => handleAddFavToCart(item)}
                          aria-label={`Add ${item.name} to cart`}
                        >
                          {wasAdded ? '✓' : '+'}
                        </button>
                        <button
                          className="profile-fav-heart"
                          onClick={() => toggle(key)}
                          aria-label={`Remove ${item.name} from favorites`}
                        >
                          ♥
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
