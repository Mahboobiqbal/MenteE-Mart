-- Supabase Storage Bucket Configuration for product-images
-- These policies control who can upload, read, and delete images

-- 1. Create the bucket via Supabase Dashboard:
--   - Go to: https://app.supabase.io/project/jqbeujqzrvvnvvsmkpaz/storage
--   - Click "New Bucket"
--   - Name: product-images
--   - Make PUBLIC: Yes (required for storefront display)
--   - File size limit: 5MB
--   - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
--   - Click "Create Bucket"

-- 2. Configure storage policies (via Dashboard or SQL):

-- Enable public read access (for storefront product image display):
-- This allows anyone to view product images in the storefront
SELECT storage.bucket_public_set('product-images', true);

-- Set up upload policy: authenticated users only
-- This prevents unauthorized users from uploading images
-- Policy: Authenticated users can upload to product-images bucket
-- Note: This is typically set via the Dashboard UI
-- If using SQL, you would manage this through the storage.objects table RLS

-- Set up file size and type validation:
-- These are enforced by the frontend (accept="image/jpeg,image/png,image/webp")
-- and confirmed by Supabase during upload
-- Max file size: 5MB (configured in bucket settings)

-- 3. Test the upload workflow after bucket creation:
-- - Sign in as admin (passcode: admin123)
-- - Navigate to Store Management → Add Product
-- - Upload 1-4 images (JPG, PNG, WebP, GIF, max 5MB each)
-- - Verify images appear in product detail page
-- - Verify public URLs load correctly in browser

-- 4. Image storage behavior (as implemented in the code):
-- - First image stored as: image_url (supabase storage public URL)
-- - Remaining images stored as: additional_images (JSONB array of URLs)
-- - Maximum of 4 images per product (1 main + 3 additional)
-- - Image paths format: products/{storeId}/{baseFilename}/{timestamp-index}.{ext}
-- - Supported formats: JPEG, PNG, WebP, GIF
-- - Max file size: 5MB per image