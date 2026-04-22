import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { AuthContextValue, AuthUser, DbProfile } from '@/types/product';

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

async function fetchProfile(userId: string): Promise<DbProfile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return (data as DbProfile) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileReady, setProfileReady] = useState(false);

  const refreshProfile = useCallback(async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) {
      setUser(null);
      return;
    }
    const profile = await fetchProfile(authUser.id);
    setUser({ id: authUser.id, email: authUser.email, profile });
  }, []);

  useEffect(() => {
    let loadingResolved = false;

    const resolveLoading = () => {
      if (!loadingResolved) {
        loadingResolved = true;
        setLoading(false);
      }
    };

    // Safety net: never spin longer than 5 seconds regardless of network state
    const safetyTimer = setTimeout(resolveLoading, 5000);

    // onAuthStateChange fires INITIAL_SESSION from localStorage (no Web Lock needed),
    // avoiding the token-refresh lock contention that caused getSession() to hang.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Immediately mark authenticated — unblocks auth guards without waiting for profile
        setUser({ id: session.user.id, email: session.user.email, profile: null });
        setProfileReady(false);
        resolveLoading();
        // Fetch profile in background; update user once ready
        try {
          const profile = await fetchProfile(session.user.id);
          setUser({ id: session.user.id, email: session.user.email, profile });
        } catch {
          // profile stays null — user remains authenticated
        } finally {
          setProfileReady(true);
        }
      } else {
        setUser(null);
        setProfileReady(true);
        resolveLoading();
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    return { error: error?.message ?? null };
  }, []);

  const resetPasswordForEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error: error?.message ?? null };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error?.message ?? null };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        profileReady,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        refreshProfile,
        resetPasswordForEmail,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
