import { createContext, useContext, useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { useToast } from './ToastContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { CartContextValue, CartItem, Product } from '@/types/product';

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<CartItem[]>('cart', []);
  const [isOpen, setIsOpen] = useState(false);
  const { addToast } = useToast();

  const addItem = useCallback(
    (product: Product, qty = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        if (existing) {
          return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i));
        }
        return [...prev, { ...product, qty }];
      });

      addToast({
        title: product.name,
        sub: 'Added to your cart',
        icon: '🛒',
        type: 'success',
      });

      setIsOpen(true);
    },
    [addToast, setItems]
  );

  const removeItem = useCallback(
    (id: number | string) => {
      setItems((prev) => prev.filter((i) => i.id !== id));
    },
    [setItems]
  );

  const updateQty = useCallback(
    (id: number | string, qty: number) => {
      if (qty < 1) return removeItem(id);
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
    },
    [removeItem, setItems]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    addToast({ title: 'Cart cleared', icon: '🗑️', type: 'info' });
  }, [addToast, setItems]);

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}
