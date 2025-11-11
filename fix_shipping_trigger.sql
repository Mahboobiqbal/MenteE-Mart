-- Completely remove the problematic trigger and function
DROP TRIGGER IF EXISTS trigger_update_shipping_cost ON orders;
DROP FUNCTION IF EXISTS update_order_shipping_cost();
DROP FUNCTION IF EXISTS calculate_shipping_cost(VARCHAR);

-- Create a new function that won't cause ambiguity
CREATE OR REPLACE FUNCTION set_shipping_cost()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set shipping cost if not already set
    IF NEW.shipping_cost IS NULL OR NEW.shipping_cost = 0 THEN
        IF NEW.area_id IS NOT NULL THEN
            SELECT a.shipping_cost INTO NEW.shipping_cost
            FROM areas a
            WHERE a.id = NEW.area_id
            AND a.is_active = true;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a new trigger
CREATE TRIGGER trigger_set_shipping_cost
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_shipping_cost();
