/*
# Allow anon uploads to product-images bucket

The admin panel uses a simple password gate (not Supabase Auth), so the frontend
operates as the anon role. We need anon to be able to upload, update, and delete
product images, not just read them.

1. Security changes
- Replace authenticated-only insert/update/delete policies with anon+authenticated.
*/

DROP POLICY IF EXISTS "auth_upload_product_images" ON storage.objects;
CREATE POLICY "auth_upload_product_images"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "auth_update_product_images" ON storage.objects;
CREATE POLICY "auth_update_product_images"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "auth_delete_product_images" ON storage.objects;
CREATE POLICY "auth_delete_product_images"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'product-images');
