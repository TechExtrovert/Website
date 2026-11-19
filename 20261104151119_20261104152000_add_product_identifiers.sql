/*
# Add product barcode and QR identifiers

1. Modified table
- `products.barcode` stores an optional EAN, UPC, or internal barcode value used to identify the product.
- `products.qr_code` stores the product page URL encoded by the generated QR code.

2. Performance and data integrity
- Add a partial unique index so a non-empty barcode identifies only one product.
- Existing products remain unchanged with null identifier values.

3. Security
- Keep the existing products row-level security and admin write policies unchanged.
- The new fields follow the same access rules as the existing product details.

4. Important notes
- QR codes point to the product page and are generated from the product slug in the admin form.
- Barcode values are trimmed before saving and blank values are stored as null.
*/

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS barcode text,
  ADD COLUMN IF NOT EXISTS qr_code text;

CREATE UNIQUE INDEX IF NOT EXISTS products_barcode_unique_nonempty
  ON products (barcode)
  WHERE barcode IS NOT NULL AND length(btrim(barcode)) > 0;