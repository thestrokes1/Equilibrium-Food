import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface FavoritesContextValue {
  favorites: Set<string>;
  toggle: (menuItemId: string) => Promise<void>;
  isFavorite: (menuItemId: string) => boolean;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

const NOOP: FavoritesContextValue = {
  favorites: new Set(),
  toggle: async () => {},
  isFavorite: () => false,
  loading: false,
};

export function useFavorites(): FavoritesContextValue {
  // Returns a safe no-op default when called outside the provider (e.g. in tests)
  return useContext(FavoritesContext) ?? NOOP;
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Load favorites when user logs in
  useEffect(() => {
    if (!user) {
      setFavorites(new Set());
      return;
    }
    setLoading(true);
    supabase
      .from('favorites')
      .select('menu_item_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        setFavorites(new Set((data ?? []).map((r: { menu_item_id: string }) => r.menu_item_id)));
        setLoading(false);
      });
  }, [user]);

  const toggle = useCallback(
    async (menuItemId: string) => {
      if (!user) return;
      const isFav = favorites.has(menuItemId);
      // Optimistic update
      setFavorites((prev) => {
        const next = new Set(prev);
        isFav ? next.delete(menuItemId) : next.add(menuItemId);
        return next;
      });
      if (isFav) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('menu_item_id', menuItemId);
      } else {
        await supabase.from('favorites').insert({ user_id: user.id, menu_item_id: menuItemId });
      }
    },
    [user, favorites]
  );

  const isFavorite = useCallback((menuItemId: string) => favorites.has(menuItemId), [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, toggle, isFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}
