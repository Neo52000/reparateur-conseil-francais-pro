-- Fix the trigger issue by temporarily disabling it, then clean and enhance schema

-- First, drop the problematic trigger temporarily
DROP TRIGGER IF EXISTS sync_pos_inventory_to_dashboard_trigger ON pos_inventory_items;

-- Clean all demo data
DELETE FROM pos_inventory_items;
DELETE FROM ecommerce_products;
DELETE FROM parts_suppliers;

-- Enhance pos_inventory_items table with new fields for complete product management
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

-- Create AI suggestions table for automatic product recommendations
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

-- Enhance parts_suppliers table with complete supplier management
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

-- Create supplier products table for supplier-specific pricing
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

-- Recreate the sync trigger with proper NULL handling
CREATE OR REPLACE FUNCTION sync_pos_inventory_to_dashboard()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create sync logs for actual inventory changes, not deletions
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  
  -- Only process if repairer_id is not null
  IF NEW.repairer_id IS NOT NULL THEN
    INSERT INTO public.sync_logs (
      repairer_id, sync_type, entity_type, entity_id, operation,
      before_data, after_data, sync_status
    ) VALUES (
      NEW.repairer_id, 'pos_to_dashboard', 'inventory', NEW.id,
      CASE WHEN TG_OP = 'INSERT' THEN 'create' ELSE 'update' END,
      CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
      to_jsonb(NEW),
      'pending'
    );
    
    NEW.synced_at = now();
    NEW.sync_source = 'pos';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER sync_pos_inventory_to_dashboard_trigger
  BEFORE INSERT OR UPDATE ON pos_inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION sync_pos_inventory_to_dashboard();