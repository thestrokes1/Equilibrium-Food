import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider, useCart } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import CartDrawer from '@/components/cart/CartDrawer';
import FoodCard from '@/components/product/FoodCard';

const product = {
  id: 1,
  name: 'Smash Burger',
  price: 12.9,
  image: '/images/smash-burger.jpg',
  category: 'burgers',
  rating: 4.8,
  deliveryTime: '18',
  restaurant: 'Burger Republic',
};

// Mirror how Home.jsx connects the card to the cart context
function ConnectedFoodCard(props) {
  const { addItem } = useCart();
  return <FoodCard {...props} onAdd={addItem} />;
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          <ConnectedFoodCard {...product} />
          <CartDrawer />
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('Cart flow integration', () => {
  it('adds a product and opens the cart drawer', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /add smash burger/i }));
    // Drawer title is visible
    expect(screen.getByText('Your cart')).toBeInTheDocument();
    // Product appears inside the drawer (FoodCard also shows the name, use getAllByText)
    const matches = screen.getAllByText('Smash Burger');
    expect(matches.length).toBeGreaterThanOrEqual(2); // card + drawer item
  });

  it('shows correct item subtotal in the drawer', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /add smash burger/i }));
    const drawer = screen.getByText('Your cart').closest('.cart-drawer');
    // Both item-price and subtotal-price show $12.90 — check subtotal label row
    const subtotalEl = within(drawer).getByText('Subtotal').closest('div');
    expect(within(subtotalEl).getByText(/\$12\.90/)).toBeInTheDocument();
  });

  it('shows free delivery when threshold is met', async () => {
    render(<App />);
    // 2 × $12.90 = $25.80 ≥ $25 threshold
    await userEvent.click(screen.getByRole('button', { name: /add smash burger/i }));
    await userEvent.click(screen.getByRole('button', { name: /add smash burger/i }));
    const drawer = screen.getByText('Your cart').closest('.cart-drawer');
    expect(within(drawer).getByText('Free 🎉')).toBeInTheDocument();
  });

  it('shows delivery fee when below threshold', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /add smash burger/i }));
    const drawer = screen.getByText('Your cart').closest('.cart-drawer');
    expect(within(drawer).getByText('$3.99')).toBeInTheDocument();
  });

  it('closes the drawer when close button is clicked', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /add smash burger/i }));
    expect(screen.getByText('Your cart')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Close cart' }));
    expect(screen.queryByText('Your cart')).not.toBeInTheDocument();
  });

  it('shows updated item count after adding twice', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /add smash burger/i }));
    await userEvent.click(screen.getByRole('button', { name: /add smash burger/i }));
    expect(screen.getByText('2 items')).toBeInTheDocument();
  });

  it('shows toast notification after adding to cart', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /add smash burger/i }));
    expect(screen.getByText('Added to your cart')).toBeInTheDocument();
  });
});
