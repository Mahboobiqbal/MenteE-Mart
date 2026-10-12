-- ============================================================
-- checkout_setup.sql
-- Aligns the live database with what the app code expects.
-- Run ONCE in Supabase Dashboard -> SQL Editor. Idempotent
-- (safe to re-run). Also run storage_bucket_setup.sql if you
-- have not already.
-- ============================================================

-- ===== 1) areas table =====
-- All app code uses table "areas" with columns "name" and "code".
-- The live DB has "shipping_areas" with "area_name" / "area_code".
-- Renaming preserves existing rows, indexes, and RLS policies.

DO $$
BEGIN
  IF to_regclass('public.shipping_areas') IS NOT NULL
     AND to_regclass('public.areas') IS NULL THEN
    ALTER TABLE shipping_areas RENAME TO areas;
  END IF;

  IF to_regclass('public.areas') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'areas'
        AND column_name = 'area_name'
    ) THEN
      ALTER TABLE areas RENAME COLUMN area_name TO name;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'areas'
        AND column_name = 'area_code'
    ) THEN
      ALTER TABLE areas RENAME COLUMN area_code TO code;
    END IF;
  END IF;
END $$;

-- Remove duplicate area rows (seed ran multiple times) so the UNIQUE
-- constraints below can be created. Keeps the oldest row per name;
-- orders is empty so no FK references are lost.
DO $$
BEGIN
  IF to_regclass('public.areas') IS NOT NULL THEN
    DELETE FROM areas a
    USING areas b
    WHERE a.name = b.name
      AND a.created_at > b.created_at;

    DELETE FROM areas a
    USING areas b
    WHERE a.name = b.name
      AND a.created_at = b.created_at
      AND a.id > b.id;

    DELETE FROM areas a
    USING areas b
    WHERE a.code IS NOT NULL
      AND a.code = b.code
      AND (a.created_at > b.created_at
           OR (a.created_at = b.created_at AND a.id > b.id));
  END IF;
END $$;

-- Unique constraints expected by seed scripts (ON CONFLICT name/code)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.areas'::regclass AND conname = 'areas_name_key'
  ) THEN
    ALTER TABLE areas ADD CONSTRAINT areas_name_key UNIQUE (name);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.areas'::regclass AND conname = 'areas_code_key'
  ) THEN
    ALTER TABLE areas ADD CONSTRAINT areas_code_key UNIQUE (code);
  END IF;
END $$;

-- ===== 2) customers: columns used by createOrGetCustomer() =====
ALTER TABLE customers ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS alternate_phone TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_line1 TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_line2 TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state_province TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS country TEXT;

-- ===== 3) orders: columns used by createOrder() and dashboards =====
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID
  REFERENCES customers(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS store_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS commission_rate NUMERIC DEFAULT 5.0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS store_commission_rate NUMERIC DEFAULT 5.0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS store_commission_amount NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS commission_status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS area_id UUID
  REFERENCES areas(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS net_amount NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'PKR';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'easypaisa';

-- ===== 4) order_items: columns used by createOrder() =====
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_sku TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_image_url TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_category TEXT;

-- ===== 5) payment_records: table used by createOrder() and tracking =====
CREATE TABLE IF NOT EXISTS payment_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  payment_method TEXT DEFAULT 'easypaisa',
  payment_amount NUMERIC DEFAULT 0,
  easypaisa_account_number TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

-- Admin full access on payment_records (same pattern as other tables)
DROP POLICY IF EXISTS "Admin full access" ON payment_records;
CREATE POLICY "Admin full access" ON payment_records FOR ALL
  USING (
    auth.role() = 'authenticated'
    AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
  );

-- ===== 6) Anonymous checkout policies =====
-- Customers are not logged in, so checkout (create order + items +
-- customer record) and order tracking (lookup by order number) need
-- anon INSERT/SELECT/UPDATE. Admin access is unchanged. This follows
-- the repo's existing fix_customers_rls.sql intent.

-- customers
DROP POLICY IF EXISTS "Allow anonymous customer creation" ON customers;
CREATE POLICY "Allow anonymous customer creation" ON customers
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous customer read" ON customers;
CREATE POLICY "Allow anonymous customer read" ON customers
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow anonymous customer update" ON customers;
CREATE POLICY "Allow anonymous customer update" ON customers
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- orders
DROP POLICY IF EXISTS "Allow anonymous order creation" ON orders;
CREATE POLICY "Allow anonymous order creation" ON orders
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous order read" ON orders;
CREATE POLICY "Allow anonymous order read" ON orders
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow anonymous order update" ON orders;
CREATE POLICY "Allow anonymous order update" ON orders
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- order_items
DROP POLICY IF EXISTS "Allow anonymous order_items creation" ON order_items;
CREATE POLICY "Allow anonymous order_items creation" ON order_items
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous order_items read" ON order_items;
CREATE POLICY "Allow anonymous order_items read" ON order_items
  FOR SELECT TO anon USING (true);

-- payment_records
DROP POLICY IF EXISTS "Allow anonymous payment_records creation" ON payment_records;
CREATE POLICY "Allow anonymous payment_records creation" ON payment_records
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous payment_records read" ON payment_records;
CREATE POLICY "Allow anonymous payment_records read" ON payment_records
  FOR SELECT TO anon USING (true);

-- ===== 7) Grants (Supabase usually grants these by default) =====
-- RLS is the real gate; grants just make sure checkout can reach it.
GRANT SELECT ON areas TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON areas TO authenticated;
GRANT SELECT, INSERT, UPDATE ON customers TO anon, authenticated;
GRANT DELETE ON customers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON orders TO anon, authenticated;
GRANT DELETE ON orders TO authenticated;
GRANT SELECT, INSERT ON order_items TO anon, authenticated;
GRANT UPDATE, DELETE ON order_items TO authenticated;
GRANT SELECT, INSERT ON payment_records TO anon, authenticated;
GRANT UPDATE, DELETE ON payment_records TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ===== 8) Reload PostgREST schema cache =====
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- Verification (optional): these should return 0 rows, not errors
--   SELECT id, name, code FROM areas LIMIT 1;
--   SELECT first_name FROM customers LIMIT 1;
--   SELECT store_name FROM orders LIMIT 1;
--   SELECT product_sku FROM order_items LIMIT 1;
--   SELECT * FROM payment_records LIMIT 1;
-- ============================================================
