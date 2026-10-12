-- ============================================================
-- Mena Bazar Database Reset Script
-- Clears all catalog data (products, categories, stores)
-- Preserves: schema, auth users, orders, settings
-- Run in Supabase Dashboard > SQL Editor
-- ============================================================

-- Disable triggers temporarily to avoid cascade issues
SET session_replication_role = replica;

-- Clear catalog data in correct order (foreign keys)
-- Only truncate tables that exist
DO $$
BEGIN
  -- Products (has foreign keys to stores, categories)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    EXECUTE 'TRUNCATE TABLE products CASCADE';
  END IF;

  -- Order items (references products, orders)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items') THEN
    EXECUTE 'TRUNCATE TABLE order_items CASCADE';
  END IF;

  -- Orders (references customers, stores)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    EXECUTE 'TRUNCATE TABLE orders CASCADE';
  END IF;

  -- Payment records
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_records') THEN
    EXECUTE 'TRUNCATE TABLE payment_records CASCADE';
  END IF;

  -- Categories
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
    EXECUTE 'TRUNCATE TABLE categories CASCADE';
  END IF;

  -- Stores
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stores') THEN
    EXECUTE 'TRUNCATE TABLE stores CASCADE';
  END IF;

  -- Store configs (if exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'store_configs') THEN
    EXECUTE 'TRUNCATE TABLE store_configs CASCADE';
  END IF;

  -- Shipping areas (if exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shipping_areas') THEN
    EXECUTE 'TRUNCATE TABLE shipping_areas CASCADE';
  END IF;

  -- Areas (if exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'areas') THEN
    EXECUTE 'TRUNCATE TABLE areas CASCADE';
  END IF;
END $$;

-- Reset auto-increment sequences (only if they exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'products_id_seq') THEN
    EXECUTE 'ALTER SEQUENCE products_id_seq RESTART WITH 1';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'categories_id_seq') THEN
    EXECUTE 'ALTER SEQUENCE categories_id_seq RESTART WITH 1';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'stores_id_seq') THEN
    EXECUTE 'ALTER SEQUENCE stores_id_seq RESTART WITH 1';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'orders_id_seq') THEN
    EXECUTE 'ALTER SEQUENCE orders_id_seq RESTART WITH 1';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'order_items_id_seq') THEN
    EXECUTE 'ALTER SEQUENCE order_items_id_seq RESTART WITH 1';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payment_records_id_seq') THEN
    EXECUTE 'ALTER SEQUENCE payment_records_id_seq RESTART WITH 1';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'store_configs_id_seq') THEN
    EXECUTE 'ALTER SEQUENCE store_configs_id_seq RESTART WITH 1';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'shipping_areas_id_seq') THEN
    EXECUTE 'ALTER SEQUENCE shipping_areas_id_seq RESTART WITH 1';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'areas_id_seq') THEN
    EXECUTE 'ALTER SEQUENCE areas_id_seq RESTART WITH 1';
  END IF;
END $$;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- ============================================================
-- OPTIONAL: Re-seed with default categories
-- Uncomment below if you want default categories
-- ============================================================

-- INSERT INTO categories (name, slug, description, sort_order, is_active) VALUES
-- ('Shawls — Men', 'shawls-men', 'Traditional men''s shawls and wraps', 1, true),
-- ('Shawls — Women', 'shawls-women', 'Elegant women''s shawls and scarves', 2, true),
-- ('Pashmina', 'pashmina', 'Premium pashmina collection', 3, true),
-- ('Wool', 'wool', 'Handwoven wool shawls', 4, true),
-- ('Kani', 'kani', 'Traditional Kani weaving', 5, true),
-- ('Accessories', 'accessories', 'Complementary accessories', 6, true);

-- ============================================================
-- OPTIONAL: Create a default store
-- Uncomment below if you want a default store
-- ============================================================

-- INSERT INTO stores (name, slug, description, whatsapp_number, is_active, commission_rate) VALUES
-- ('Mena Bazar', 'mena-bazar', 'Main marketplace store', '923472886228', true, 5.0);

-- ============================================================
-- Verification queries (run after to confirm)
-- ============================================================

-- SELECT 'products' as table_name, count(*) as count FROM products
-- UNION ALL SELECT 'categories', count(*) FROM categories
-- UNION ALL SELECT 'stores', count(*) FROM stores
-- UNION ALL SELECT 'orders', count(*) FROM orders
-- UNION ALL SELECT 'order_items', count(*) FROM order_items;