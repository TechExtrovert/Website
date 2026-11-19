-- Allow reading contact_messages so the admin dashboard can display them
CREATE POLICY "public_select_contact_messages"
  ON contact_messages FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow reading wholesale_inquiries so the admin dashboard can display them
CREATE POLICY "public_select_wholesale_inquiries"
  ON wholesale_inquiries FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow reading newsletter_subscribers so the admin dashboard can display them
CREATE POLICY "public_select_newsletter_subscribers"
  ON newsletter_subscribers FOR SELECT
  TO anon, authenticated
  USING (true);
