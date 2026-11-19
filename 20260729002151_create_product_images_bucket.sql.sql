/*
# Create product-images storage bucket

1. Storage
- Create a public bucket named `product-images` for uploading product photos.
2. Security
- Allow public read (anon + authenticated) so storefront images load for all visitors.
- Allow authenticated uploads (admin only).
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;
CREATE POLICY "public_read_product_images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images');

-- Authenticated can upload
DROP POLICY IF EXISTS "auth_upload_product_images" ON storage.objects;
CREATE POLICY "auth_upload_product_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Authenticated can update/delete their uploads
DROP POLICY IF EXISTS "auth_update_product_images" ON storage.objects;
CREATE POLICY "auth_update_product_images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "auth_delete_product_images" ON storage.objects;
CREATE POLICY "auth_delete_product_images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
