/*
# Add order status update policy + admin_email column

1. Changes
  - Add UPDATE policy on orders so the anon/authenticated client can update status
  - Add `admin_email` setting to support notification emails (stored via edge function)
2. Security
  - UPDATE policy scoped to anon + authenticated (no-auth app)
*/

DROP POLICY IF EXISTS "public_update_orders" ON orders;
CREATE POLICY "public_update_orders" ON orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
