-- ===== Supabase Database Schema for MenteE-Mart =====

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
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  product_store TEXT,               -- store name the item belongs to
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Shipping areas table (delivery zones for checkout)
CREATE TABLE IF NOT EXISTS shipping_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_name TEXT NOT NULL,
  area_code TEXT,
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
ALTER TABLE shipping_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policies allowing public read access (adjust as needed for your security model)
CREATE POLICY "Allow public read" ON stores FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON shipping_areas FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read" ON customers FOR SELECT USING (true);

-- Policies for authenticated admin operations (placeholder – replace with your own)
CREATE POLICY "Allow admin full access" ON stores FOR ALL USING (false);
CREATE POLICY "Allow admin full access" ON categories FOR ALL USING (false);
CREATE POLICY "Allow admin full access" ON products FOR ALL USING (false);
CREATE POLICY "Allow admin full access" ON orders FOR ALL USING (false);
CREATE POLICY "Allow admin full access" ON order_items FOR ALL USING (false);
CREATE POLICY "Allow admin full access" ON shipping_areas FOR ALL USING (false);
CREATE POLICY "Allow admin full access" ON customers FOR ALL USING (false);

-- ===== Default / seed data (optional) =====
-- Insert a default store if none exists (name, whatsapp, commission)
INSERT INTO stores (name, slug, whatsapp_number, commission_rate, is_active)
SELECT 'Mena Bazar', 'mena-bazar', '923472886228', 5.0, true
WHERE NOT EXISTS (SELECT 1 FROM stores WHERE slug = 'mena-bazar');

-- Insert default categories (adjust as needed)
INSERT INTO categories (name, description, sort_order, is_active)
VALUES 
  ('Electronics', 'All electronic devices', 1, true),
  ('Fashion', 'Clothing and accessories', 2, true),
  ('Home & Kitchen', 'Home and kitchen items', 3, true),
  ('Beauty & Personal Care', 'Beauty and personal care', 4, true),
  ('Accessories', 'Accessories', 5, true);

-- Insert default shipping area
INSERT INTO shipping_areas (area_name, shipping_cost, estimated_delivery_days, is_active)
VALUES ('Pakistan', 0, 3, true);

-- ============================================================
-- NOTE: 
-- 1. Run this SQL in your Supabase Dashboard → SQL Editor
-- 2. After running, go to Project Settings → API and copy the
--    "Project URL" and "anon public" key into your .env file
-- 3. The app will then boot with real data instead of placeholders
-- ============================================================