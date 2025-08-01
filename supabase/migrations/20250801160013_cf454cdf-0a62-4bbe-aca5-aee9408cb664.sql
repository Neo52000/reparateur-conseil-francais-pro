-- Use CASCADE to remove all dependencies, then proceed with setup

-- Drop all related triggers and functions with CASCADE
DROP FUNCTION IF EXISTS sync_pos_inventory_to_dashboard() CASCADE;

-- Clean all demo data
TRUNCATE TABLE pos_inventory_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE ecommerce_products RESTART IDENTITY CASCADE; 
TRUNCATE TABLE parts_suppliers RESTART IDENTITY CASCADE;

-- Enhance pos_inventory_items table with new fields
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

-- Create product categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES product_categories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default product categories
INSERT INTO product_categories (name, description) VALUES 
('Écrans', 'Écrans de smartphones et tablettes'),
('Batteries', 'Batteries pour appareils mobiles'),
('Coques et Protections', 'Accessoires de protection'),
('Pièces Internes', 'Composants internes des appareils'),
('Outils', 'Outils de réparation')
ON CONFLICT DO NOTHING;

-- Create product links table for upsell/cross-sell
CREATE TABLE IF NOT EXISTS product_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_product_id UUID NOT NULL REFERENCES pos_inventory_items(id) ON DELETE CASCADE,
  linked_product_id UUID NOT NULL REFERENCES pos_inventory_items(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL CHECK (link_type IN ('upsell', 'cross_sell', 'combo', 'accessory')),
  is_automatic BOOLEAN DEFAULT false,
  ai_confidence NUMERIC(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(primary_product_id, linked_product_id, link_type)
);

-- Create AI suggestions table
CREATE TABLE IF NOT EXISTS ai_product_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_product_id UUID NOT NULL REFERENCES pos_inventory_items(id) ON DELETE CASCADE,
  suggested_product_id UUID NOT NULL REFERENCES pos_inventory_items(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('frequent_together', 'similar_category', 'price_based', 'seasonal')),
  confidence_score NUMERIC(3,2) NOT NULL,
  frequency_count INTEGER DEFAULT 1,
  last_suggested TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create purchase orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES parts_suppliers(id),
  repairer_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'confirmed', 'partially_received', 'received', 'cancelled')),
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery DATE,
  total_amount_ht NUMERIC(10,2),
  total_amount_ttc NUMERIC(10,2),
  notes TEXT,
  auto_generated BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create purchase order items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES pos_inventory_items(id),
  quantity INTEGER NOT NULL,
  unit_price_ht NUMERIC(10,2) NOT NULL,
  unit_price_ttc NUMERIC(10,2) NOT NULL,
  total_ht NUMERIC(10,2) NOT NULL,
  total_ttc NUMERIC(10,2) NOT NULL,
  received_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create supplier products table
CREATE TABLE IF NOT EXISTS supplier_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES parts_suppliers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES pos_inventory_items(id) ON DELETE CASCADE,
  supplier_reference TEXT,
  unit_price_ht NUMERIC(10,2),
  unit_price_ttc NUMERIC(10,2),
  minimum_quantity INTEGER DEFAULT 1,
  delivery_delay_days INTEGER,
  is_preferred_supplier BOOLEAN DEFAULT false,
  last_price_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(supplier_id, product_id)
);

-- Create stock alerts table
CREATE TABLE IF NOT EXISTS stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES pos_inventory_items(id) ON DELETE CASCADE,
  repairer_id UUID NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'reorder_point', 'overstock')),
  threshold_value INTEGER,
  current_value INTEGER,
  is_active BOOLEAN DEFAULT true,
  auto_order_enabled BOOLEAN DEFAULT false,
  last_triggered TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_links_primary ON product_links(primary_product_id);
CREATE INDEX IF NOT EXISTS idx_product_links_linked ON product_links(linked_product_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_primary ON ai_product_suggestions(primary_product_id);
CREATE INDEX IF NOT EXISTS idx_supplier_products_supplier ON supplier_products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_product ON stock_alerts(product_id);

-- Add trigger for automatic margin calculation
CREATE OR REPLACE FUNCTION calculate_product_margin()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.purchase_price_ht IS NOT NULL AND NEW.sale_price_ht IS NOT NULL AND NEW.purchase_price_ht > 0 THEN
    NEW.margin_percentage := ROUND(((NEW.sale_price_ht - NEW.purchase_price_ht) / NEW.purchase_price_ht * 100)::NUMERIC, 2);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_product_margin
  BEFORE INSERT OR UPDATE ON pos_inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_product_margin();

-- Enable RLS on new tables
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_product_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view active categories" ON product_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON product_categories
  FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Repairers can manage their inventory" ON pos_inventory_items
  FOR ALL USING (repairer_id = auth.uid());

CREATE POLICY "Repairers can manage their purchase orders" ON purchase_orders
  FOR ALL USING (repairer_id = auth.uid());

CREATE POLICY "Repairers can manage their stock alerts" ON stock_alerts
  FOR ALL USING (repairer_id = auth.uid());