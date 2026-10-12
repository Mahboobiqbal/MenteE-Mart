-- ============================================================
-- products_schema_fix.sql
-- Adds two product columns the app expects but the live DB is
-- missing (both currently cause HTTP 400 on queries and NaN
-- prices on product pages):
--   - description    (About page, product detail, admin form)
--   - regular_price  (compare-at price for discounts)
-- Run ONCE in the Supabase SQL Editor. Idempotent.
-- ============================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS regular_price NUMERIC;

-- Reload PostgREST schema cache immediately
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- Verify (both should return 0 rows / no error):
--   SELECT description, regular_price FROM products LIMIT 1;
-- ============================================================
