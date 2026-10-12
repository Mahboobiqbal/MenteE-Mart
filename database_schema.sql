-- ===== Supabase Database Schema for MenteE-Mart =====

-- Step 1: CLEAN SLATE - Remove all seed data to start fresh
-- Run this once to clear all tables before inserting fresh dummy data
DELETE FROM order_items;
DELETE FROM products;
DELETE FROM stores;
DELETE FROM categories;
DELETE FROM areas;
DELETE FROM orders;
DELETE FROM customers;

-- ============================================================

-- 1. Stores table (holds multi-store config + WhatsApp contacts)
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  whatsapp_number TEXT NOT NULL,
  commission_rate NUMERIC NOT NULL DEFAULT 5.0,
  owner_name TEXT,
  owner_email TEXT,
  owner_phone TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Categories table (product categories)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  parent_id UUID REFERENCES categories(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Products table (per-store products with full catalog data)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  sale_price NUMERIC,
  original_price NUMERIC,
  sale_type TEXT,
  sale_start TIMESTAMP WITH TIME ZONE,
  sale_end TIMESTAMP WITH TIME ZONE,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  store TEXT NOT NULL,              -- store name (matches stores.name)
  store_id UUID REFERENCES stores(id),
  sku TEXT,
  color TEXT,
  size TEXT,
  material TEXT,
  tags TEXT,
  image_url TEXT,
  additional_images JSONB DEFAULT '[]',
  slug TEXT UNIQUE NOT NULL,
  rating NUMERIC DEFAULT 4.5,
  reviews INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  whatsapp_clicks INTEGER DEFAULT 0,
  views_by_date JSONB DEFAULT '{}',
  clicks_by_date JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Orders table (orders placed through WhatsApp)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  shipping_address TEXT,
  order_notes TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount NUMERIC NOT NULL DEFAULT 0,
  commission_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Order items table (line items within each order)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  product_store TEXT,               -- store name the item belongs to
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Shipping areas table (delivery zones for checkout)
CREATE TABLE IF NOT EXISTS areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE,
  shipping_cost NUMERIC NOT NULL DEFAULT 0,
  estimated_delivery_days INTEGER NOT NULL DEFAULT 3,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Customers table (simple contact store, used by databaseSetup check)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ===== Indexes for common query patterns =====
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_whatsapp ON stores(whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock) WHERE in_stock = true;
CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active) WHERE is_active = true;

-- ===== Row Level Security (RLS) policies =====
-- Enable RLS on all tables (required for Supabase auth)
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policies allowing public read access (adjust as needed for your security model)
CREATE POLICY "Allow public read" ON stores FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON areas FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read" ON customers FOR SELECT USING (true);

-- Admin RLS policies - these check for admin email in JWT claims
-- After admin passcode verification, the user is signed in as mahboobiqbal774@gmail.com
-- via Supabase Auth. These policies allow admin CRUD operations while preserving
-- public read access for the storefront.
-- 
-- To configure: 
-- 1. Create a Supabase Auth user with email mahboobiqbal774@gmail.com
-- 2. Set the admin passcode in .env (VITE_ADMIN_PASSCODE)
-- 3. These policies will allow the authenticated admin to perform CRUD operations
CREATE POLICY "Admin full access" ON stores FOR ALL USING (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
) WITH CHECK (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
);
CREATE POLICY "Admin full access" ON categories FOR ALL USING (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
) WITH CHECK (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
);
CREATE POLICY "Admin full access" ON products FOR ALL USING (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
) WITH CHECK (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
);
CREATE POLICY "Admin full access" ON orders FOR ALL USING (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
) WITH CHECK (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
);
CREATE POLICY "Admin full access" ON order_items FOR ALL USING (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
) WITH CHECK (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
);
CREATE POLICY "Admin full access" ON areas FOR ALL USING (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
) WITH CHECK (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
);
CREATE POLICY "Admin full access" ON customers FOR ALL USING (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
) WITH CHECK (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
);

-- ===== Default / seed data (optional) =====
-- Insert a default store if none exists (name, whatsapp, commission)
-- Uses WHERE NOT EXISTS for idempotency - safe to run multiple times
INSERT INTO stores (name, slug, whatsapp_number, commission_rate, is_active)
SELECT 'Mena Bazar', 'mena-bazar', '923472886228', 5.0, true
WHERE NOT EXISTS (SELECT 1 FROM stores WHERE slug = 'mena-bazar');

-- ===== 1. Clean slate: clear all seed data (safe to run, idempotent)
DELETE FROM order_items;
DELETE FROM products;
DELETE FROM stores;
DELETE FROM categories;
DELETE FROM areas;
DELETE FROM orders;
DELETE FROM customers;

-- 2. Insert 5 unique categories (idempotent ON CONFLICT)
INSERT INTO categories (name, description, sort_order, is_active, slug) VALUES
('Electronics', 'Gadgets and tech equipment', 1, true, 'electronics'),
('Fashion', 'Clothing and accessories', 2, true, 'fashion'),
('Home & Kitchen', 'Home decor and kitchenware', 3, true, 'home-kitchen'),
('Beauty & Personal Care', 'Skincare and personal grooming', 4, true, 'beauty'),
('Accessories', 'Fashion accessories and add-ons', 5, true, 'accessories')
ON CONFLICT (name) DO NOTHING;

-- Insert default shipping area
-- Uses ON CONFLICT for idempotency - safe to run multiple times
INSERT INTO areas (name, shipping_cost, estimated_delivery_days, is_active)
SELECT 'Pakistan', 0, 3, true
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- NOTE: 
-- 1. Run this SQL in your Supabase Dashboard → SQL Editor
-- 2. After running, go to Project Settings → API and copy the
--    "Project URL" and "anon public" key into your .env file
-- 3. The app will then boot with real data instead of placeholders
-- ============================================================