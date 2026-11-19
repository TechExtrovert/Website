-- Allow admin (authenticated) to delete orders (for cleaning up completed/delivered orders)
CREATE POLICY "admin_delete_orders"
  ON orders FOR DELETE
  TO authenticated
  USING (true);
