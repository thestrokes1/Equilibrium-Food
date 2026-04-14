import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mutable auth state — change .user between tests to simulate logged-in/out
const auth = vi.hoisted(() => ({ user: null }));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: auth.user, loading: false }),
  AuthProvider: ({ children }) => children,
}));

// Supabase mock with thenable query builder so .then() chains work
vi.mock('@/lib/supabase', () => {
  // Factory creates a fresh chainable mock object; configurable response per call
  const makeQuery = (resolveWith = { data: [], error: null }) => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    then(onFulfilled) {
      return Promise.resolve(resolveWith).then(onFulfilled);
    },
  });

  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange: vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } },
        }),
      },
      from: vi.fn(() => makeQuery()),
    },
  };
});

import { FavoritesProvider, useFavorites } from '@/context/FavoritesContext';
import { supabase } from '@/lib/supabase';

function Wrapper({ children }) {
  return <FavoritesProvider>{children}</FavoritesProvider>;
}

describe('FavoritesContext', () => {
  beforeEach(() => {
    auth.user = null;
    vi.clearAllMocks();
    // Re-wire from to return a fresh thenable query mock after clearAllMocks
    supabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      then(onFulfilled) {
        return Promise.resolve({ data: [], error: null }).then(onFulfilled);
      },
    }));
  });

  // ── NOOP outside provider ──────────────────────────────────────────────────

  it('useFavorites outside provider returns safe NOOP — no throw', () => {
    function Check() {
      const { favorites, isFavorite, loading } = useFavorites();
      const ok = favorites.size === 0 && !isFavorite('anything') && loading === false;
      return <p data-testid="out">{String(ok)}</p>;
    }
    render(<Check />);
    expect(screen.getByTestId('out').textContent).toBe('true');
  });

  it('toggle NOOP does not throw when called outside provider', async () => {
    function Check() {
      const { toggle } = useFavorites();
      return <button onClick={() => toggle('item-1')}>Toggle</button>;
    }
    render(<Check />);
    await userEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    // passes if no error thrown
  });

  // ── Inside provider, no user ───────────────────────────────────────────────

  it('isFavorite returns false when no user', async () => {
    function Check() {
      const { isFavorite } = useFavorites();
      return <p>{isFavorite('item-1') ? 'yes' : 'no'}</p>;
    }
    await act(async () => render(<Check />, { wrapper: Wrapper }));
    expect(screen.getByText('no')).toBeInTheDocument();
  });

  it('favorites is empty Set and loading is false when no user', async () => {
    function Check() {
      const { favorites, loading } = useFavorites();
      return <p data-testid="state">{`${favorites.size}:${loading}`}</p>;
    }
    await act(async () => render(<Check />, { wrapper: Wrapper }));
    expect(screen.getByTestId('state').textContent).toBe('0:false');
  });

  it('toggle does not call supabase when user is null', async () => {
    function Check() {
      const { toggle } = useFavorites();
      return <button onClick={() => toggle('item-1')}>Toggle</button>;
    }
    await act(async () => render(<Check />, { wrapper: Wrapper }));
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  // ── Inside provider, with user ─────────────────────────────────────────────

  it('loads favorites from supabase when user is set (empty list)', async () => {
    auth.user = { id: 'user-123', email: 'test@test.com', profile: null };
    function Check() {
      const { favorites, loading } = useFavorites();
      return <p data-testid="info">{loading ? 'loading' : `size:${favorites.size}`}</p>;
    }
    await act(async () => render(<Check />, { wrapper: Wrapper }));
    await waitFor(() => expect(screen.getByTestId('info').textContent).toBe('size:0'));
  });

  it('toggle optimistically adds item to favorites', async () => {
    auth.user = { id: 'user-123', email: 'test@test.com', profile: null };
    function Check() {
      const { isFavorite, toggle } = useFavorites();
      return (
        <>
          <p data-testid="fav">{isFavorite('item-1') ? 'yes' : 'no'}</p>
          <button onClick={() => toggle('item-1')}>Toggle</button>
        </>
      );
    }
    await act(async () => render(<Check />, { wrapper: Wrapper }));
    await waitFor(() => expect(screen.getByTestId('fav').textContent).toBe('no'));

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    });
    expect(screen.getByTestId('fav').textContent).toBe('yes');
  });

  it('toggle optimistically removes item when already favorited', async () => {
    auth.user = { id: 'user-123', email: 'test@test.com', profile: null };
    function Check() {
      const { isFavorite, toggle } = useFavorites();
      return (
        <>
          <p data-testid="fav">{isFavorite('item-1') ? 'yes' : 'no'}</p>
          <button onClick={() => toggle('item-1')}>Toggle</button>
        </>
      );
    }
    await act(async () => render(<Check />, { wrapper: Wrapper }));
    await waitFor(() => expect(screen.getByTestId('fav').textContent).toBe('no'));

    // Add
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    });
    expect(screen.getByTestId('fav').textContent).toBe('yes');

    // Remove
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    });
    expect(screen.getByTestId('fav').textContent).toBe('no');
  });
});
