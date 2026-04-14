-- ============================================================
-- 008_storage.sql
-- Public "images" storage bucket for admin-uploaded images
-- RLS: anon can read, authenticated admins can insert/update/delete
-- ============================================================

-- Create bucket (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  TRUE,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies (idempotent re-run)
DROP POLICY IF EXISTS "images_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "images_admin_insert"  ON storage.objects;
DROP POLICY IF EXISTS "images_admin_update"  ON storage.objects;
DROP POLICY IF EXISTS "images_admin_delete"  ON storage.objects;

-- Anyone (anon + authenticated) can read from the images bucket
CREATE POLICY "images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- Admins can upload new images
CREATE POLICY "images_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- Admins can replace existing images
CREATE POLICY "images_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- Admins can delete images
CREATE POLICY "images_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );
