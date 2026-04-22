import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading, profileReady } = useAuth();

  if (loading || !profileReady) return <PageSpinner />;
  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.profile?.role !== 'admin') return <Navigate to="/" replace />;

  return <>{children}</>;
}

function PageSpinner() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0d0d0d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: '3px solid #222',
          borderTopColor: '#f59e0b',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
