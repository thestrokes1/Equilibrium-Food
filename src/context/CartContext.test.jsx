import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from './CartContext';
import { ToastProvider } from './ToastContext';

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

const product2 = {
  id: 2,
  name: 'Pepperoni Feast',
  price: 16.5,
  image: '/images/pepperoni.jpg',
  category: 'pizza',
  rating: 4.7,
  deliveryTime: '22',
  restaurant: 'Pizza Palace',
};

function TestConsumer() {
  const { items, totalItems, totalPrice, addItem, removeItem, updateQty, clearCart } = useCart();
  return (
    <div>
      <span data-testid="total-items">{totalItems}</span>
      <span data-testid="total-price">{totalPrice.toFixed(2)}</span>
      <span data-testid="item-count">{items.length}</span>
      <button onClick={() => addItem(product)}>add</button>
      <button onClick={() => addItem(product, 3)}>add-3</button>
      <button onClick={() => addItem(product2)}>add2</button>
      <button onClick={() => removeItem(product.id)}>remove</button>
      <button onClick={() => updateQty(product.id, 5)}>set-5</button>
      <button onClick={() => updateQty(product.id, 0)}>set-0</button>
      <button onClick={clearCart}>clear</button>
    </div>
  );
}

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

describe('CartContext', () => {
  it('starts empty', () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    expect(screen.getByTestId('total-items').textContent).toBe('0');
    expect(screen.getByTestId('total-price').textContent).toBe('0.00');
  });

  it('addItem adds a new product with qty 1', async () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    await userEvent.click(screen.getByText('add'));
    expect(screen.getByTestId('total-items').textContent).toBe('1');
    expect(screen.getByTestId('item-count').textContent).toBe('1');
  });

  it('addItem increments qty for existing product', async () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    await userEvent.click(screen.getByText('add'));
    await userEvent.click(screen.getByText('add'));
    expect(screen.getByTestId('total-items').textContent).toBe('2');
    expect(screen.getByTestId('item-count').textContent).toBe('1');
  });

  it('addItem with qty adds that many units', async () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    await userEvent.click(screen.getByText('add-3'));
    expect(screen.getByTestId('total-items').textContent).toBe('3');
    expect(screen.getByTestId('item-count').textContent).toBe('1');
  });

  it('totalPrice is calculated correctly', async () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    await userEvent.click(screen.getByText('add'));
    await userEvent.click(screen.getByText('add'));
    // 2 × $12.90 = $25.80
    expect(screen.getByTestId('total-price').textContent).toBe('25.80');
  });

  it('removeItem removes the product entirely', async () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    await userEvent.click(screen.getByText('add'));
    await userEvent.click(screen.getByText('remove'));
    expect(screen.getByTestId('total-items').textContent).toBe('0');
    expect(screen.getByTestId('item-count').textContent).toBe('0');
  });

  it('updateQty sets the quantity', async () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    await userEvent.click(screen.getByText('add'));
    await userEvent.click(screen.getByText('set-5'));
    expect(screen.getByTestId('total-items').textContent).toBe('5');
  });

  it('updateQty with 0 removes the product', async () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    await userEvent.click(screen.getByText('add'));
    await userEvent.click(screen.getByText('set-0'));
    expect(screen.getByTestId('item-count').textContent).toBe('0');
  });

  it('clearCart removes all items', async () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    await userEvent.click(screen.getByText('add'));
    await userEvent.click(screen.getByText('add2'));
    await userEvent.click(screen.getByText('clear'));
    expect(screen.getByTestId('total-items').textContent).toBe('0');
    expect(screen.getByTestId('item-count').textContent).toBe('0');
  });

  it('totals account for multiple different products', async () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    await userEvent.click(screen.getByText('add')); // $12.90
    await userEvent.click(screen.getByText('add2')); // $16.50
    expect(screen.getByTestId('total-items').textContent).toBe('2');
    expect(screen.getByTestId('total-price').textContent).toBe('29.40');
  });
});
