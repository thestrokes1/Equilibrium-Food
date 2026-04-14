import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// jsdom doesn't implement IntersectionObserver — provide a stub that immediately
// fires the callback as "intersecting" so LazyImage loads its src in tests.
global.IntersectionObserver = class {
  constructor(cb) {
    this._cb = cb;
  }
  observe(el) {
    this._cb([{ isIntersecting: true, target: el }]);
  }
  unobserve() {}
  disconnect() {}
};

// Mock Supabase client — avoids env-var errors and network calls in tests
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    }),
  },
}));

// Mock AuthContext so CartDrawer and other components don't need AuthProvider in tests
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    signInWithGoogle: vi.fn(),
    refreshProfile: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updatePassword: vi.fn(),
  }),
  AuthProvider: ({ children }) => children,
}));

// Framer Motion does not run real animations in jsdom.
// AnimatePresence never unmounts exiting children, and motion components
// add transform styles that break DOM queries. This mock makes all motion
// components behave like their plain HTML counterparts.
vi.mock('framer-motion', () => {
  const tags = ['div', 'button', 'section', 'ul', 'li', 'span', 'a', 'nav', 'header', 'footer'];
  const motion = Object.fromEntries(
    tags.map((tag) => [
      tag,
      // eslint-disable-next-line react/display-name
      React.forwardRef(
        (
          {
            children,
            whileHover: _wh,
            whileTap: _wt,
            whileInView: _wiv,
            variants: _v,
            initial: _i,
            animate: _a,
            exit: _e,
            transition: _tr,
            layout: _l,
            viewport: _vp,
            custom: _c,
            ...rest
          },
          ref
        ) => React.createElement(tag, { ...rest, ref }, children)
      ),
    ])
  );
  return {
    motion,
    AnimatePresence: ({ children }) => children,
    useReducedMotion: () => false,
  };
});
