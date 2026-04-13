import { useEffect } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Traps keyboard focus inside `ref` while active.
 * When deactivated, returns focus to the element that was focused before the trap.
 *
 * @param {React.RefObject} ref - Container element ref
 * @param {boolean} active - Whether the trap is active
 */
export function useFocusTrap(ref, active) {
  useEffect(() => {
    if (!active || !ref.current) return;

    const trigger = document.activeElement;
    const focusable = Array.from(ref.current.querySelectorAll(FOCUSABLE));
    if (focusable.length === 0) return;

    // Move focus into the container
    focusable[0].focus();

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Return focus to the element that opened the dialog
      if (trigger instanceof HTMLElement) trigger.focus();
    };
  }, [active, ref]);
}
