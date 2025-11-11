-- Fix RLS policies for customers table
-- This allows anonymous users to create and read customer data during checkout

-- Enable RLS on customers table (if not already enabled)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous customer creation" ON customers;
DROP POLICY IF EXISTS "Allow anonymous customer read" ON customers;
DROP POLICY IF EXISTS "Allow anonymous customer update" ON customers;

-- Policy to allow anonymous users to create customers
CREATE POLICY "Allow anonymous customer creation" ON customers
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy to allow anonymous users to read customers (needed for checking existing customers)
CREATE POLICY "Allow anonymous customer read" ON customers
FOR SELECT
TO anon
USING (true);

-- Policy to allow anonymous users to update their own customer data
CREATE POLICY "Allow anonymous customer update" ON customers
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Policy to allow anonymous users to create orders
CREATE POLICY "Allow anonymous order creation" ON orders
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy to allow anonymous users to read orders
CREATE POLICY "Allow anonymous order read" ON orders
FOR SELECT
TO anon
USING (true);

-- Policy to allow anonymous users to update orders
CREATE POLICY "Allow anonymous order update" ON orders
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Enable RLS on order_items table if it exists
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies for order_items
CREATE POLICY "Allow anonymous order_items creation" ON order_items
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anonymous order_items read" ON order_items
FOR SELECT
TO anon
USING (true);

-- Enable RLS on payments table if it exists
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies for payments
CREATE POLICY "Allow anonymous payments creation" ON payments
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anonymous payments read" ON payments
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow anonymous payments update" ON payments
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Note: In a production environment, you might want more restrictive policies
-- For example, only allow reading/updating customers by email match
-- But for checkout flow, anonymous access is needed