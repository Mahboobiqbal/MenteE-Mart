-- Remove the shipping cost trigger since we're calculating it directly in order creation
DROP TRIGGER IF EXISTS trigger_update_shipping_cost ON orders;
DROP FUNCTION IF EXISTS update_order_shipping_cost();
