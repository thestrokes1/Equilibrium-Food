import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import Checkout from '@/pages/Checkout';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'user-123',
      email: 'test@test.com',
      profile: { full_name: 'Test User', role: 'customer' },
    },
    loading: false,
  }),
}));

const cartItem = {
  id: 1,
  name: 'Smash Burger',
  price: 12.9,
  image: '',
  category: 'burgers',
  rating: 4.8,
  deliveryTime: '18',
  restaurant: 'Burger Republic',
  qty: 1,
};

function setupCart() {
  // CartContext uses the key 'cart'
  localStorage.setItem('cart', JSON.stringify([cartItem]));
}

function Wrapper({ children }) {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>{children}</CartProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

describe('Checkout validation', () => {
  beforeEach(() => {
    localStorage.clear();
    setupCart();
    vi.clearAllMocks();
  });

  it('shows address form on first step', () => {
    render(<Checkout />, { wrapper: Wrapper });
    expect(screen.getByLabelText(/street address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
  });

  it('shows empty cart message when cart is empty', () => {
    localStorage.setItem('cart', JSON.stringify([]));
    render(<Checkout />, { wrapper: Wrapper });
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('shows validation error when street is empty', async () => {
    render(<Checkout />, { wrapper: Wrapper });
    await userEvent.type(screen.getByLabelText(/city/i), 'New York');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText(/street and city are required/i)).toBeInTheDocument();
  });

  it('shows validation error when city is empty', async () => {
    render(<Checkout />, { wrapper: Wrapper });
    await userEvent.type(screen.getByLabelText(/street address/i), '123 Main St');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText(/street and city are required/i)).toBeInTheDocument();
  });

  it('advances to review step when address is valid', async () => {
    render(<Checkout />, { wrapper: Wrapper });
    await userEvent.type(screen.getByLabelText(/street address/i), '123 Main St');
    await userEvent.type(screen.getByLabelText(/city/i), 'New York');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText(/review your order/i)).toBeInTheDocument();
  });

  it('shows cart item in address step', () => {
    render(<Checkout />, { wrapper: Wrapper });
    expect(screen.getByText('Smash Burger')).toBeInTheDocument();
  });
});
