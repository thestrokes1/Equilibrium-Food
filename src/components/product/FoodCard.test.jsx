import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import FoodCard from './FoodCard';

function Wrapper({ children }) {
  return (
    <ToastProvider>
      <CartProvider>{children}</CartProvider>
    </ToastProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
});

const baseProps = {
  id: 1,
  name: 'Smash Burger',
  price: 12.9,
  image: '/images/smash-burger.jpg',
  category: 'burgers',
  rating: 4.8,
  deliveryTime: '18',
  restaurant: 'Burger Republic',
  onAdd: vi.fn(),
};

describe('FoodCard', () => {
  it('renders product name, price and restaurant', () => {
    render(<FoodCard {...baseProps} />);
    expect(screen.getByText('Smash Burger')).toBeInTheDocument();
    expect(screen.getByText('$12.90')).toBeInTheDocument();
    expect(screen.getByText('Burger Republic')).toBeInTheDocument();
  });

  it('renders delivery time and rating', () => {
    render(<FoodCard {...baseProps} />);
    expect(screen.getByText(/18 min/)).toBeInTheDocument();
    expect(screen.getByText(/4\.8/)).toBeInTheDocument();
  });

  it('renders badge when provided', () => {
    render(<FoodCard {...baseProps} badge={{ type: 'sale', label: '20% OFF' }} />);
    expect(screen.getByText('20% OFF')).toBeInTheDocument();
  });

  it('does not render badge when not provided', () => {
    render(<FoodCard {...baseProps} />);
    expect(screen.queryByText('20% OFF')).not.toBeInTheDocument();
  });

  it('calls onAdd with correct product data when add button is clicked', async () => {
    const onAdd = vi.fn();
    render(<FoodCard {...baseProps} onAdd={onAdd} />);
    const addBtn = screen.getByRole('button', { name: /add smash burger/i });
    await userEvent.click(addBtn);
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, name: 'Smash Burger', price: 12.9 })
    );
  });

  it('shows ✓ briefly after clicking add', async () => {
    render(<FoodCard {...baseProps} />);
    const addBtn = screen.getByRole('button', { name: /add smash burger/i });
    await userEvent.click(addBtn);
    expect(addBtn.textContent).toBe('✓');
  });

  it('opens product modal when card is clicked', async () => {
    render(<FoodCard {...baseProps} description="A great burger." />, { wrapper: Wrapper });
    const card = screen.getByText('Smash Burger').closest('.food-card');
    await userEvent.click(card);
    expect(screen.getByRole('heading', { name: 'Smash Burger' })).toBeInTheDocument();
  });

  it('does not call onAdd when the card body (not add button) is clicked', async () => {
    const onAdd = vi.fn();
    render(<FoodCard {...baseProps} onAdd={onAdd} />, { wrapper: Wrapper });
    const card = screen.getByText('Smash Burger').closest('.food-card');
    await userEvent.click(card);
    expect(onAdd).not.toHaveBeenCalled();
  });
});
