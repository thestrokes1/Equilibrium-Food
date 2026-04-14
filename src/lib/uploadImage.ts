import { supabase } from './supabase';

/**
 * Uploads an image file to the Supabase Storage "images" bucket and returns
 * the public URL. Throws on error.
 *
 * @param file   The File object to upload.
 * @param folder Sub-folder inside the bucket (e.g. "menu", "restaurants/logos").
 */
export async function uploadImage(file: File, folder = 'menu'): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `${folder}/${unique}.${ext}`;

  const { error } = await supabase.storage.from('images').upload(path, file, {
    cacheControl: '31536000', // 1 year
    upsert: false,
    contentType: file.type,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('images').getPublicUrl(path);
  return data.publicUrl;
}
