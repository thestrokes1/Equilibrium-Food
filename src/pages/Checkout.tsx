import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { FREE_DELIVERY_THRESHOLD, DELIVERY_FEE } from '@/constants';
import Seo from '@/components/ui/Seo';
import './Checkout.css';

type Step = 'address' | 'review';

interface AddressForm {
  label: string;
  street: string;
  city: string;
  zip: string;
  notes: string;
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const deliveryFee = totalPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = totalPrice + deliveryFee;

  const [step, setStep] = useState<Step>('address');
  const [form, setForm] = useState<AddressForm>({
    label: 'Home',
    street: '',
    city: '',
    zip: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <p className="checkout-empty-icon">🛒</p>
        <h2>Your cart is empty</h2>
        <p>Add some items before checking out.</p>
        <Link to="/" className="checkout-back-btn">
          Browse menu
        </Link>
      </div>
    );
  }

  const handleAddress = (e: FormEvent) => {
    e.preventDefault();
    if (!form.street.trim() || !form.city.trim()) {
      setError('Street and city are required.');
      return;
    }
    setError('');
    setStep('review');
  };

  const handlePlaceOrder = async () => {
    if (!user) return;
    setSubmitting(true);
    setError('');

    const addressSnapshot = {
      label: form.label,
      street: form.street,
      city: form.city,
      zip: form.zip,
    };

    // Insert order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        subtotal: totalPrice,
        delivery_fee: deliveryFee,
        total,
        address_snapshot: addressSnapshot,
        notes: form.notes || null,
        estimated_minutes: 30,
      })
      .select()
      .single();

    if (orderErr || !order) {
      setError('Failed to place order. Please try again.');
      setSubmitting(false);
      return;
    }

    // Insert order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      menu_item_id: typeof item.id === 'string' ? item.id : null,
      qty: item.qty,
      unit_price: item.price,
      item_name: item.name,
      item_image: item.image,
    }));

    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);

    if (itemsErr) {
      setError('Order created but items failed. Contact support.');
      setSubmitting(false);
      return;
    }

    clearCart();
    addToast({
      title: 'Order placed!',
      sub: 'Your food is on the way 🚴',
      icon: '🎉',
      type: 'success',
    });
    navigate(`/orders/${order.id}`);
  };

  return (
    <div className="checkout-page">
      <Seo title="Checkout" description="Complete your order on Equilibrium Food." />
      <div className="checkout-container">
        {/* Header */}
        <div className="checkout-header">
          <Link to="/" className="checkout-logo">
            Equilibrium<span>.</span>
          </Link>
          <div className="checkout-steps">
            <span className={`checkout-step ${step === 'address' ? 'active' : 'done'}`}>
              1 · Delivery
            </span>
            <span className="checkout-step-sep">→</span>
            <span className={`checkout-step ${step === 'review' ? 'active' : ''}`}>2 · Review</span>
          </div>
        </div>

        <div className="checkout-body">
          {/* Left — form */}
          <motion.div
            className="checkout-left"
            key={step}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            {step === 'address' ? (
              <>
                <h2 className="checkout-section-title">Delivery address</h2>
                {error && <div className="checkout-error">{error}</div>}
                <form onSubmit={handleAddress} className="checkout-form" noValidate>
                  <div className="checkout-field-row">
                    {(['Home', 'Work', 'Other'] as const).map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        className={`checkout-label-pill ${form.label === lbl ? 'active' : ''}`}
                        onClick={() => setForm((f) => ({ ...f, label: lbl }))}
                      >
                        {lbl === 'Home' ? '🏠' : lbl === 'Work' ? '💼' : '📍'} {lbl}
                      </button>
                    ))}
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="street">Street address *</label>
                    <input
                      id="street"
                      type="text"
                      required
                      placeholder="123 Main St, Apt 4B"
                      value={form.street}
                      onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
                    />
                  </div>

                  <div className="checkout-field-2col">
                    <div className="checkout-field">
                      <label htmlFor="city">City *</label>
                      <input
                        id="city"
                        type="text"
                        required
                        placeholder="New York"
                        value={form.city}
                        onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      />
                    </div>
                    <div className="checkout-field">
                      <label htmlFor="zip">ZIP code</label>
                      <input
                        id="zip"
                        type="text"
                        placeholder="10001"
                        value={form.zip}
                        onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="notes">
                      Delivery notes <span className="optional">(optional)</span>
                    </label>
                    <input
                      id="notes"
                      type="text"
                      placeholder="Leave at door, ring bell, etc."
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    />
                  </div>

                  <button type="submit" className="checkout-cta">
                    Continue to review →
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2 className="checkout-section-title">Review your order</h2>

                <div className="checkout-address-preview">
                  <span className="checkout-address-icon">📍</span>
                  <div>
                    <p className="checkout-address-label">{form.label}</p>
                    <p className="checkout-address-text">
                      {form.street}, {form.city} {form.zip}
                    </p>
                    {form.notes && (
                      <p className="checkout-address-notes">&quot;{form.notes}&quot;</p>
                    )}
                  </div>
                  <button className="checkout-edit-link" onClick={() => setStep('address')}>
                    Edit
                  </button>
                </div>

                <ul className="checkout-items-list">
                  {items.map((item) => (
                    <li key={item.id} className="checkout-item">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="checkout-item-img"
                        loading="lazy"
                      />
                      <div className="checkout-item-info">
                        <p className="checkout-item-name">
                          {item.qty}× {item.name}
                        </p>
                        <p className="checkout-item-rest">{item.restaurant}</p>
                      </div>
                      <p className="checkout-item-price">${(item.price * item.qty).toFixed(2)}</p>
                    </li>
                  ))}
                </ul>

                {error && <div className="checkout-error">{error}</div>}
                <button className="checkout-cta" onClick={handlePlaceOrder} disabled={submitting}>
                  {submitting ? 'Placing order…' : `Place order — $${total.toFixed(2)}`}
                </button>
                <button className="checkout-back" onClick={() => setStep('address')}>
                  ← Back
                </button>
              </>
            )}
          </motion.div>

          {/* Right — order summary */}
          <div className="checkout-right">
            <h3 className="checkout-summary-title">Order summary</h3>
            <ul className="checkout-summary-list">
              {items.map((item) => (
                <li key={item.id} className="checkout-summary-item">
                  <span className="checkout-summary-qty">{item.qty}×</span>
                  <span className="checkout-summary-name">{item.name}</span>
                  <span className="checkout-summary-price">
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="checkout-summary-divider" />
            <div className="checkout-summary-row">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="checkout-summary-row">
              <span>Delivery</span>
              <span className={deliveryFee === 0 ? 'checkout-free' : ''}>
                {deliveryFee === 0 ? 'Free 🎉' : `$${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <div className="checkout-summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            {totalPrice < FREE_DELIVERY_THRESHOLD && (
              <p className="checkout-free-hint">
                Add ${(FREE_DELIVERY_THRESHOLD - totalPrice).toFixed(2)} more for free delivery
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
