-- Create areas table for shipping zones
CREATE TABLE IF NOT EXISTS areas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    estimated_delivery_days INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample areas
INSERT INTO areas (name, code, shipping_cost, estimated_delivery_days) VALUES
('Karachi', 'KHI', 100, 1),
('Lahore', 'LHR', 150, 2),
('Islamabad', 'ISB', 200, 3),
('Rawalpindi', 'RWP', 200, 3),
('Faisalabad', 'FSD', 250, 4),
('Multan', 'MUL', 250, 4),
('Peshawar', 'PEW', 300, 5),
('Quetta', 'QTA', 350, 6),
('Sialkot', 'SKT', 250, 4),
('Gujranwala', 'GWL', 200, 3),
('Other Cities', 'OTHER', 400, 7)
ON CONFLICT (code) DO NOTHING;

-- Add area_id to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES areas(id);

-- Create index for area_id
CREATE INDEX IF NOT EXISTS idx_orders_area_id ON orders(area_id);

-- Enable RLS for areas table
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;

-- Create policy for areas table
CREATE POLICY "Allow all access on areas" ON areas FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON areas TO anon, authenticated, service_role;

-- Create function to calculate shipping cost based on area
CREATE OR REPLACE FUNCTION calculate_shipping_cost(area_code VARCHAR)
RETURNS DECIMAL AS $$
DECLARE
    shipping_cost DECIMAL;
BEGIN
    SELECT shipping_cost INTO shipping_cost 
    FROM areas 
    WHERE code = area_code AND is_active = true;

    RETURN COALESCE(shipping_cost, 0);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update shipping cost when area changes
CREATE OR REPLACE FUNCTION update_order_shipping_cost()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE orders
    SET shipping_cost = calculate_shipping_cost(
        (SELECT code FROM areas WHERE id = NEW.area_id)
    )
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_shipping_cost
    AFTER INSERT OR UPDATE OF area_id ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_order_shipping_cost();
