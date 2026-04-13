import { motion, AnimatePresence } from 'framer-motion';
import type { ToastItem } from '@/types/product';
import './Toast.css';

interface ToastProps {
  toasts: ToastItem[];
  removeToast: (_id: number) => void;
}

export default function Toast({ toasts, removeToast }: ToastProps) {
  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className={`toast toast-${t.type ?? 'success'}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={() => removeToast(t.id)}
          >
            <span className="toast-icon">{t.icon ?? '✓'}</span>
            <div className="toast-body">
              <p className="toast-title">{t.title}</p>
              {t.sub && <p className="toast-sub">{t.sub}</p>}
            </div>
            <button className="toast-close" onClick={() => removeToast(t.id)}>
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
