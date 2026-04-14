import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.profile?.role !== 'admin') return <Navigate to="/" replace />;

  return <>{children}</>;
}
