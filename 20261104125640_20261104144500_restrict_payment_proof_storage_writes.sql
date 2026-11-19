/*
# Restrict payment-proof storage writes

1. Security changes
- Remove update and delete access from the customer-facing payment-proof bucket.
- Keep public read access so the WhatsApp verification link works.
- Keep anonymous and authenticated insert access so guests can submit proof during checkout.

2. Important notes
- Existing uploaded proof files remain available.
- New proof files are uploaded once with generated paths and cannot be overwritten or removed by checkout visitors.
*/

DROP POLICY IF EXISTS "public_update_payment_proofs" ON storage.objects;
DROP POLICY IF EXISTS "public_delete_payment_proofs" ON storage.objects;