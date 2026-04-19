import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Seo from '@/components/ui/Seo';
import './Auth.css';

export default function ForgotPassword() {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await resetPasswordForEmail(email);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    setSent(true);
  };

  return (
    <div className="auth-page">
      <Seo title="Reset password" description="Reset your Equilibrium Food account password." />
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Link to="/" className="auth-logo">
          Equilibrium<span className="auth-logo-dot">.</span>
        </Link>

        {sent ? (
          <>
            <div className="auth-success-icon">📬</div>
            <h1 className="auth-title">Check your email</h1>
            <p className="auth-sub">
              We sent a password reset link to <strong>{email}</strong>. Follow the link in the
              email to set a new password.
            </p>
            <Link
              to="/auth/login"
              className="auth-btn-primary"
              style={{ textAlign: 'center', marginTop: '1rem' }}
            >
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <h1 className="auth-title">Forgot password?</h1>
            <p className="auth-sub">Enter your email and we&apos;ll send you a reset link.</p>

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="auth-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <button type="submit" className="auth-btn-primary" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>

            <p className="auth-footer-text" style={{ marginTop: '1.25rem' }}>
              <Link to="/auth/login">← Back to sign in</Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
