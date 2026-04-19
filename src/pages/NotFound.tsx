import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TopBar from '@/components/layout/TopBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Seo from '@/components/ui/Seo';

export default function NotFound() {
  return (
    <div className="page-root">
      <TopBar />
      <Navbar />
      <Seo title="Page not found" description="This page doesn't exist." />
      <main>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            minHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            color: '#f5f5f5',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <div style={{ fontSize: '4rem' }}>🍔</div>
          <h1 style={{ fontSize: '5rem', fontWeight: 800, margin: 0, color: '#f59e0b' }}>404</h1>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Page not found</h2>
          <p style={{ color: '#a3a3a3', maxWidth: '360px', margin: 0 }}>
            Looks like this page went out for delivery and never came back.
          </p>
          <Link
            to="/"
            style={{
              marginTop: '0.5rem',
              padding: '0.75rem 1.75rem',
              borderRadius: '0.5rem',
              background: '#f59e0b',
              color: '#0d0d0d',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '0.95rem',
            }}
          >
            Back to menu
          </Link>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
