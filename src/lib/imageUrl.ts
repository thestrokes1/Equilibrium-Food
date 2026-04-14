/**
 * Converts a Supabase Storage public URL into a transform URL that serves
 * the image as WebP at the requested width/quality via the render API.
 *
 * Non-storage URLs (external CDNs, local paths, data URIs) are returned as-is
 * so the helper is safe to call on any image URL.
 */

const STORAGE_OBJECT_RE = /\/storage\/v1\/object\/public\//;

export interface TransformOpts {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'origin';
  resize?: 'cover' | 'contain' | 'fill';
}

export function transformImageUrl(url: string, opts: TransformOpts = {}): string {
  if (!url || !STORAGE_OBJECT_RE.test(url)) return url;

  const { width = 800, quality = 80, format = 'webp', resize = 'cover', height } = opts;

  const renderUrl = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');

  const params = new URLSearchParams();
  params.set('width', String(width));
  if (height) params.set('height', String(height));
  params.set('quality', String(quality));
  params.set('format', format);
  params.set('resize', resize);

  return `${renderUrl}?${params.toString()}`;
}
