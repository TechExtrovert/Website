-- Products: allow admin (anon/authenticated) to insert, update, delete
DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);

-- Bundles: allow admin to insert, update, delete
DROP POLICY IF EXISTS "admin_insert_bundles" ON bundles;
CREATE POLICY "admin_insert_bundles" ON bundles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_bundles" ON bundles;
CREATE POLICY "admin_update_bundles" ON bundles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_bundles" ON bundles;
CREATE POLICY "admin_delete_bundles" ON bundles FOR DELETE
  TO anon, authenticated USING (true);

-- Blog posts: allow admin to insert, update, delete
DROP POLICY IF EXISTS "admin_insert_blog_posts" ON blog_posts;
CREATE POLICY "admin_insert_blog_posts" ON blog_posts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_blog_posts" ON blog_posts;
CREATE POLICY "admin_update_blog_posts" ON blog_posts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_blog_posts" ON blog_posts;
CREATE POLICY "admin_delete_blog_posts" ON blog_posts FOR DELETE
  TO anon, authenticated USING (true);

-- Promo codes: allow admin to insert, update, delete
DROP POLICY IF EXISTS "admin_insert_promo" ON promo_codes;
CREATE POLICY "admin_insert_promo" ON promo_codes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_promo" ON promo_codes;
CREATE POLICY "admin_update_promo" ON promo_codes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_promo" ON promo_codes;
CREATE POLICY "admin_delete_promo" ON promo_codes FOR DELETE
  TO anon, authenticated USING (true);
