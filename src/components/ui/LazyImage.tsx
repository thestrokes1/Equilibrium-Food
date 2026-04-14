import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';

// Tiny transparent 1×1 GIF — avoids empty-src browser errors while image is off-screen
const PLACEHOLDER =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
}

/**
 * Drop-in <img> replacement that defers loading until the element is within
 * 200 px of the viewport (IntersectionObserver), then fades in on load.
 *
 * Opacity is set via inline style so the consuming CSS class can declare
 * `transition: opacity 0.35s ease` (alongside any transform transitions)
 * without a specificity conflict.
 */
export default function LazyImage({ src, alt, style, ...props }: LazyImageProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [currentSrc, setCurrentSrc] = useState(PLACEHOLDER);
  const [revealed, setRevealed] = useState(false);
  // Ref flag: true once we've switched src to the real URL
  const realSrcSet = useRef(false);

  // Set up IntersectionObserver to trigger lazy load
  useEffect(() => {
    const el = ref.current;
    if (!el || !src) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          realSrcSet.current = true;
          setCurrentSrc(src);
          io.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  // After currentSrc updates to the real URL, handle images already in cache
  // (cached images may not fire onLoad after a src change)
  useEffect(() => {
    if (!realSrcSet.current) return;
    const el = ref.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setRevealed(true);
    }
  }, [currentSrc]);

  return (
    <img
      ref={ref}
      src={currentSrc}
      alt={alt}
      onLoad={() => {
        // Only reveal when the real image (not the placeholder) has loaded
        if (realSrcSet.current) setRevealed(true);
      }}
      onError={() => {
        // Show broken-image icon rather than staying invisible
        if (realSrcSet.current) setRevealed(true);
      }}
      style={{
        // Opacity controlled here; transition declared in the consuming CSS class
        opacity: revealed ? 1 : 0,
        display: 'block', // prevent inline-block gap below image
        ...style,
      }}
      {...props}
    />
  );
}
