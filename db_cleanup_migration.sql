-- ===== DATABASE CLEANUP MIGRATION =====
-- Run this AFTER executing the updated database_schema.sql
-- This removes duplicate seed data while preserving unique records
-- Idempotent: safe to run multiple times

-- ===== 1. Consolidate duplicate categories =====
-- Delete all categories first, then re-insert the 5 unique ones
DELETE FROM categories;

-- Insert 5 unique categories (safe to run multiple times ON CONFLICT)
INSERT INTO categories (name, description, sort_order, is_active, slug) VALUES
('Electronics', 'Gadgets and tech equipment', 1, true, 'electronics'),
('Fashion', 'Clothing and accessories', 2, true, 'fashion'),
('Home & Kitchen', 'Home decor and kitchenware', 3, true, 'home-kitchen'),
('Beauty & Personal Care', 'Skincare and personal grooming', 4, true, 'beauty'),
('Accessories', 'Fashion accessories and add-ons', 5, true, 'accessories');

-- ===== 2. Consolidate duplicate shipping areas =====
-- Delete all shipping areas first, then re-insert the unique ones
DELETE FROM areas;

-- Insert unique shipping areas (safe to run multiple times)
INSERT INTO areas (name, shipping_cost, estimated_delivery_days, is_active) VALUES
('Pakistan', 0, 3, true),
('Karachi', 200, 2, true);

-- ===== 3. Verify final state =====
-- Expected: 5 categories + 1 shipping area (Pakistan only)
SELECT 'Categories count:' AS metric, COUNT(*) AS value FROM categories
UNION ALL
SELECT 'Shipping areas count:', COUNT(*) FROM areas
UNION ALL
SELECT 'Stores count:', COUNT(*) FROM stores;