import { useEffect } from 'react';

interface SeoProps {
  title?: string;
  description?: string;
}

const BASE = 'Equilibrium Food';
const DEFAULT_DESC =
  'Order your favourite meals from the best local restaurants. Fast delivery, great prices.';

export default function Seo({ title, description }: SeoProps) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE}` : BASE;

    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description ?? DEFAULT_DESC;

    return () => {
      document.title = BASE;
      if (metaDesc) metaDesc.content = DEFAULT_DESC;
    };
  }, [title, description]);

  return null;
}
