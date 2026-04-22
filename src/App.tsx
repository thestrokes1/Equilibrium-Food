import { lazy, Suspense, type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/ui/AuthGuard';
import AdminGuard from '@/components/ui/AdminGuard';
import ErrorBoundary from '@/components/ErrorBoundary';
import CartDrawer from '@/components/cart/CartDrawer';

// Code-split all pages
const Home = lazy(() => import('@/pages/Home'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const Orders = lazy(() => import('@/pages/Orders'));
const OrderDetail = lazy(() => import('@/pages/OrderDetail'));
const Profile = lazy(() => import('@/pages/Profile'));
const Restaurants = lazy(() => import('@/pages/Restaurants'));
const RestaurantDetail = lazy(() => import('@/pages/RestaurantDetail'));
const Admin = lazy(() => import('@/pages/admin/Admin'));
const TrackOrder = lazy(() => import('@/pages/TrackOrder'));

function PageLoader() {
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

function GuestGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

/** Wraps a route element in an ErrorBoundary keyed to its path,
 *  so crashes are isolated per route and reset on navigation. */
function Bounded({ path, children }: { path: string; children: ReactNode }) {
  return <ErrorBoundary key={path}>{children}</ErrorBoundary>;
}

export default function App() {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/"
            element={
              <Bounded path="/">
                <Home />
              </Bounded>
            }
          />

          {/* Auth routes — redirect to / if already logged in */}
          <Route
            path="/auth/login"
            element={
              <Bounded path="/auth/login">
                <GuestGuard>
                  <Login />
                </GuestGuard>
              </Bounded>
            }
          />
          <Route
            path="/auth/register"
            element={
              <Bounded path="/auth/register">
                <GuestGuard>
                  <Register />
                </GuestGuard>
              </Bounded>
            }
          />
          <Route
            path="/auth/forgot-password"
            element={
              <Bounded path="/auth/forgot-password">
                <ForgotPassword />
              </Bounded>
            }
          />
          <Route
            path="/auth/reset-password"
            element={
              <Bounded path="/auth/reset-password">
                <ResetPassword />
              </Bounded>
            }
          />

          {/* Restaurants */}
          <Route
            path="/restaurants"
            element={
              <Bounded path="/restaurants">
                <Restaurants />
              </Bounded>
            }
          />
          <Route
            path="/restaurants/:slug"
            element={
              <Bounded path="/restaurants/:slug">
                <RestaurantDetail />
              </Bounded>
            }
          />

          {/* Protected routes */}
          <Route
            path="/checkout"
            element={
              <Bounded path="/checkout">
                <AuthGuard>
                  <Checkout />
                </AuthGuard>
              </Bounded>
            }
          />
          <Route
            path="/orders"
            element={
              <Bounded path="/orders">
                <AuthGuard>
                  <Orders />
                </AuthGuard>
              </Bounded>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <Bounded path="/orders/:id">
                <AuthGuard>
                  <OrderDetail />
                </AuthGuard>
              </Bounded>
            }
          />
          <Route
            path="/profile"
            element={
              <Bounded path="/profile">
                <AuthGuard>
                  <Profile />
                </AuthGuard>
              </Bounded>
            }
          />

          {/* Track order */}
          <Route
            path="/track-order"
            element={
              <Bounded path="/track-order">
                <AuthGuard>
                  <TrackOrder />
                </AuthGuard>
              </Bounded>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <Bounded path="/admin">
                <AdminGuard>
                  <Admin />
                </AdminGuard>
              </Bounded>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {/* Cart drawer lives outside routes so it persists across navigation */}
      <CartDrawer />
    </>
  );
}
