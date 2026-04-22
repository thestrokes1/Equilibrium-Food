import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '@/context/ToastContext';

// Override the global setup.js mock — we need the REAL AuthContext here
vi.unmock('@/context/AuthContext');

// vi.hoisted ensures these are initialized before the vi.mock factory runs
const {
  mockSignInWithPassword,
  mockSignUp,
  mockSignOut,
  mockResetPasswordForEmail,
  mockUpdateUser,
  mockGetSession,
  mockOnAuthStateChange,
} = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn().mockResolvedValue({ error: null }),
  mockSignUp: vi.fn().mockResolvedValue({ error: null }),
  mockSignOut: vi.fn().mockResolvedValue({}),
  mockResetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
  mockUpdateUser: vi.fn().mockResolvedValue({ error: null }),
  mockGetSession: vi.fn().mockResolvedValue({ data: { session: null } }),
  mockOnAuthStateChange: vi.fn().mockImplementation((callback) => {
    callback('INITIAL_SESSION', null);
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  }),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: mockOnAuthStateChange,
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
      signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }),
    }),
  },
}));

// Import after mocks are declared
import { AuthProvider, useAuth } from '@/context/AuthContext';

function Wrapper({ children }) {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

function AuthStatus() {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading...</p>;
  return <p>{user ? `Signed in as ${user.email}` : 'Not signed in'}</p>;
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockImplementation((callback) => {
      callback('INITIAL_SESSION', null);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
  });

  it('starts as not signed in when no session', async () => {
    await act(async () => render(<AuthStatus />, { wrapper: Wrapper }));
    expect(screen.getByText('Not signed in')).toBeInTheDocument();
  });

  it('signIn calls supabase.auth.signInWithPassword with correct args', async () => {
    function SignInBtn() {
      const { signIn } = useAuth();
      return <button onClick={() => signIn('test@test.com', 'pass123')}>Sign in</button>;
    }
    await act(async () => render(<SignInBtn />, { wrapper: Wrapper }));
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'pass123',
    });
  });

  it('signIn returns error message on failure', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      error: { message: 'Invalid credentials' },
    });
    let result;
    function SignInBtn() {
      const { signIn } = useAuth();
      return (
        <button
          onClick={async () => {
            result = await signIn('bad@test.com', 'wrong');
          }}
        >
          Sign in
        </button>
      );
    }
    await act(async () => render(<SignInBtn />, { wrapper: Wrapper }));
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    });
    expect(result.error).toBe('Invalid credentials');
  });

  it('resetPasswordForEmail calls correct supabase method with redirectTo', async () => {
    function ResetBtn() {
      const { resetPasswordForEmail } = useAuth();
      return <button onClick={() => resetPasswordForEmail('user@test.com')}>Reset</button>;
    }
    await act(async () => render(<ResetBtn />, { wrapper: Wrapper }));
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
      'user@test.com',
      expect.objectContaining({ redirectTo: expect.stringContaining('/auth/reset-password') })
    );
  });

  it('signOut calls supabase.auth.signOut', async () => {
    function SignOutBtn() {
      const { signOut } = useAuth();
      return <button onClick={signOut}>Sign out</button>;
    }
    await act(async () => render(<SignOutBtn />, { wrapper: Wrapper }));
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('updatePassword calls supabase.auth.updateUser with password', async () => {
    function UpdateBtn() {
      const { updatePassword } = useAuth();
      return <button onClick={() => updatePassword('newpass123')}>Update</button>;
    }
    await act(async () => render(<UpdateBtn />, { wrapper: Wrapper }));
    await userEvent.click(screen.getByRole('button', { name: 'Update' }));
    expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'newpass123' });
  });
});
