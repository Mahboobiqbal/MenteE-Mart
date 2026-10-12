-- ===== UPDATE RLS POLICIES FOR ADMIN CRUD =====

-- Drop old restrictive admin policies that block all operations
DROP POLICY IF EXISTS "Allow admin full access" ON stores;
DROP POLICY IF EXISTS "Allow admin full access" ON categories;
DROP POLICY IF EXISTS "Allow admin full access" ON products;
DROP POLICY IF EXISTS "Allow admin full access" ON orders;
DROP POLICY IF EXISTS "Allow admin full access" ON order_items;
DROP POLICY IF EXISTS "Allow admin full access" ON areas;
DROP POLICY IF EXISTS "Allow admin full access" ON customers;

-- ===== NEW ADMIN POLICIES =====
-- These policies allow admin operations when the user is signed in as mahboobiqbal774@gmail.com
-- Public read access is preserved via the existing 'Allow public read' policies
-- The admin email is checked in the Supabase Auth JWT token

-- Stores table: Allow full access to admin user
CREATE POLICY "Admin full access" ON stores FOR ALL USING (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
) WITH CHECK (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
);

-- Categories table: Allow full access to admin user
CREATE POLICY "Admin full access" ON categories FOR ALL USING (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
) WITH CHECK (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
);

-- Products table: Allow full access to admin user
CREATE POLICY "Admin full access" ON products FOR ALL USING (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
) WITH CHECK (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
);

-- Orders table: Allow full access to admin user
CREATE POLICY "Admin full access" ON orders FOR ALL USING (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
) WITH CHECK (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
);

-- Order items table: Allow full access to admin user
CREATE POLICY "Admin full access" ON order_items FOR ALL USING (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
) WITH CHECK (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
);

-- Shipping areas table: Allow full access to admin user
CREATE POLICY "Admin full access" ON areas FOR ALL USING (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
) WITH CHECK (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
);

-- Customers table: Allow full access to admin user
CREATE POLICY "Admin full access" ON customers FOR ALL USING (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
) WITH CHECK (
  auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
);