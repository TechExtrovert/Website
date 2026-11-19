/*
# Add bank-transfer payment proof support

1. New storage
- Create the public `payment-proofs` bucket for customer transfer screenshots.
- Public read access is required because the customer-facing WhatsApp message includes a verification link for the store.
- Anonymous and authenticated customers may upload proof files; uploads are constrained to the payment-proofs bucket.

2. Modified tables
- `orders.payment_proof_url` stores the uploaded screenshot URL.
- `orders.transaction_reference` stores the optional bank transaction reference supplied by the customer.

3. Security
- Keep row-level security enabled on `orders`.
- Grant the existing customer roles access to the new order fields through the existing order policies.
- Add explicit storage policies for read, insert, update, and delete operations on the payment-proofs bucket.

4. Important notes
- Existing orders are unchanged and receive null proof fields.
- Proof uploads use generated order-specific paths so each order has a predictable verification link without trusting the original filename.
*/

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_proof_url text,
  ADD COLUMN IF NOT EXISTS transaction_reference text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_payment_proofs" ON storage.objects;
CREATE POLICY "public_read_payment_proofs"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "public_insert_payment_proofs" ON storage.objects;
CREATE POLICY "public_insert_payment_proofs"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "public_update_payment_proofs" ON storage.objects;
CREATE POLICY "public_update_payment_proofs"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'payment-proofs')
WITH CHECK (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "public_delete_payment_proofs" ON storage.objects;
CREATE POLICY "public_delete_payment_proofs"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'payment-proofs');