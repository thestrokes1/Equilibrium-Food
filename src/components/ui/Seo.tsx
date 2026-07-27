import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SeoProps {
  title?: string;
  description?: string;
  /** Absolute or root-relative image used for og:image / twitter:image. */
  image?: string;
  /** Keep the page out of search results (private / user-specific pages). */
  noindex?: boolean;
}

const BASE = 'Equilibrium Food';
const SITE_URL = 'https://www.equilibriumfood.ar';
// Defaults must mirror index.html — pages that render <Seo /> with no title
// (the home page) would otherwise overwrite the static tags with weaker copy.
const DEFAULT_TITLE = 'Equilibrium — Food Delivery';
const DEFAULT_DESC =
  'Equilibrium — your favorite meals delivered to your door in under 30 minutes. Real food, real fast.';
const DEFAULT_IMAGE = `${SITE_URL}/images/smash-burger.jpg`;
const INDEXABLE = 'index, follow, max-image-preview:large, max-snippet:-1';

/** Upsert a <meta> tag by name or property attribute. */
function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Upsert <link rel="canonical">. */
function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

export default function Seo({ title, description, image, noindex }: SeoProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title} — ${BASE}` : DEFAULT_TITLE;
    const desc = description ?? DEFAULT_DESC;
    const img = image ? (image.startsWith('http') ? image : `${SITE_URL}${image}`) : DEFAULT_IMAGE;
    // Canonical always points at the www domain, without query/hash.
    const canonical = `${SITE_URL}${pathname === '/' ? '/' : pathname.replace(/\/$/, '')}`;

    document.title = fullTitle;
    setMeta('name', 'description', desc);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : INDEXABLE);
    setCanonical(canonical);

    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:image', img);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:image', img);

    return () => {
      document.title = DEFAULT_TITLE;
      setMeta('name', 'description', DEFAULT_DESC);
      setMeta('name', 'robots', INDEXABLE);
    };
  }, [title, description, image, noindex, pathname]);

  return null;
}
