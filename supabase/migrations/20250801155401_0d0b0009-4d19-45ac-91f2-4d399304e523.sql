-- Completely remove the problematic trigger and function, then proceed with clean setup

-- Drop the trigger and function that's causing issues
DROP TRIGGER IF EXISTS sync_pos_inventory_to_dashboard_trigger ON pos_inventory_items;
DROP FUNCTION IF EXISTS sync_pos_inventory_to_dashboard();

-- Clean all demo data directly with CASCADE to handle dependencies
TRUNCATE TABLE pos_inventory_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE ecommerce_products RESTART IDENTITY CASCADE; 
TRUNCATE TABLE parts_suppliers RESTART IDENTITY CASCADE;

-- Now enhance the schema safely
ALTER TABLE pos_inventory_items 
ADD COLUMN IF NOT EXISTS external_reference TEXT,
ADD COLUMN IF NOT EXISTS purchase_price_ht NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS purchase_price_ttc NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS sale_price_ht NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS sale_price_ttc NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS margin_percentage NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS is_ecommerce_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_description TEXT,
ADD COLUMN IF NOT EXISTS tva_rate NUMERIC(5,2) DEFAULT 20.00,
ADD COLUMN IF NOT EXISTS ecotax NUMERIC(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ademe_bonus NUMERIC(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS requires_intervention BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS intervention_service_id UUID,
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS category_id UUID;

-- Enhance parts_suppliers table
ALTER TABLE parts_suppliers 
ADD COLUMN IF NOT EXISTS contact_person TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'France',
ADD COLUMN IF NOT EXISTS payment_terms TEXT,
ADD COLUMN IF NOT EXISTS delivery_delay_days INTEGER,
ADD COLUMN IF NOT EXISTS minimum_order_amount NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS is_preferred BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Insert some default product categories for the system
INSERT INTO product_categories (name, description) VALUES 
('Écrans', 'Écrans de smartphones et tablettes'),
('Batteries', 'Batteries pour appareils mobiles'),
('Coques et Protections', 'Accessoires de protection'),
('Pièces Internes', 'Composants internes des appareils'),
('Outils', 'Outils de réparation')
ON CONFLICT DO NOTHING;