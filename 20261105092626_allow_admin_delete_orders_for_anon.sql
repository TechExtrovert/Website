/*
# Allow admin order deletion

1. Problem
- The admin dashboard signs in with a local password, so all its database requests run as the `anon` role.
- The existing delete policy only covered `authenticated`, so deletes were silently blocked and deleted orders reappeared on refresh.

2. Changes
- Replaces the `admin_delete_orders` policy so it applies to `anon` and `authenticated`.
- Deletion is limited to orders with status `delivered` or `cancelled`, matching the admin dashboard's Delete Order button.

3. Security
- Row level security remains enabled on `orders`. Other order policies are unchanged.
- Anyone with the public app key can delete delivered or cancelled orders. This matches how the other admin tables are already protected.
*/

DROP POLICY IF EXISTS "admin_delete_orders" ON orders;

CREATE POLICY "admin_delete_orders"
  ON orders FOR DELETE
  TO anon, authenticated
  USING (status IN ('delivered', 'cancelled'));
