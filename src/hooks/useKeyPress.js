import { useEffect } from 'react';

/**
 * Calls `handler` when the given key is pressed.
 * @param {string} key - e.g. 'Escape', 'Enter'
 * @param {() => void} handler
 */
export function useKeyPress(key, handler) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === key) handler();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key, handler]);
}
