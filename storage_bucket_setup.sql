-- ============================================================
-- Mena Bazar: create the product-images storage bucket
-- plus read/write policies for the admin identity.
-- Run ONCE in the Supabase SQL Editor.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read: anyone can view product images
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images" ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

-- Only the admin identity may upload product images
DROP POLICY IF EXISTS "Admin insert product images" ON storage.objects;
CREATE POLICY "Admin insert product images" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
  AND auth.jwt()->>'email' = 'mahboobiqbal774@gmail.com'
);

-- Only the admin identity may replace (update) product images
DROP POLICY IF EXISTS "Admin update product images" ON storage.objects;
CREATE POLICY "Admin update product images" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
  AND auth.jwt()->>'email' = 'mahboobiqbal774@gmail.com'
);

-- Only the admin identity may delete product images
DROP POLICY IF EXISTS "Admin delete product images" ON storage.objects;
CREATE POLICY "Admin delete product images" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
  AND auth.jwt()->>'email' = 'mahboobiqbal774@gmail.com'
);
