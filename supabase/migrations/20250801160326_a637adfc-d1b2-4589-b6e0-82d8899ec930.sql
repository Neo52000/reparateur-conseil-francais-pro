-- Fix security issues: Add missing RLS policies and fix function security

-- Fix function search path issue
CREATE OR REPLACE FUNCTION calculate_product_margin()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.purchase_price_ht IS NOT NULL AND NEW.sale_price_ht IS NOT NULL AND NEW.purchase_price_ht > 0 THEN
    NEW.margin_percentage := ROUND(((NEW.sale_price_ht - NEW.purchase_price_ht) / NEW.purchase_price_ht * 100)::NUMERIC, 2);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Add missing RLS policies for product_links
CREATE POLICY "Repairers can manage their product links" ON product_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pos_inventory_items 
      WHERE id = product_links.primary_product_id 
      AND repairer_id = auth.uid()
    )
  );

-- Add missing RLS policies for ai_product_suggestions
CREATE POLICY "Repairers can view their AI suggestions" ON ai_product_suggestions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pos_inventory_items 
      WHERE id = ai_product_suggestions.primary_product_id 
      AND repairer_id = auth.uid()
    )
  );

CREATE POLICY "System can manage AI suggestions" ON ai_product_suggestions
  FOR ALL USING (
    get_current_user_role() = 'admin' OR
    EXISTS (
      SELECT 1 FROM pos_inventory_items 
      WHERE id = ai_product_suggestions.primary_product_id 
      AND repairer_id = auth.uid()
    )
  );

-- Add missing RLS policies for purchase_order_items
CREATE POLICY "Repairers can manage their purchase order items" ON purchase_order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM purchase_orders 
      WHERE id = purchase_order_items.purchase_order_id 
      AND repairer_id = auth.uid()
    )
  );

-- Add missing RLS policies for supplier_products
CREATE POLICY "Repairers can view supplier products" ON supplier_products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pos_inventory_items 
      WHERE id = supplier_products.product_id 
      AND repairer_id = auth.uid()
    )
  );

CREATE POLICY "Repairers can manage supplier products for their inventory" ON supplier_products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pos_inventory_items 
      WHERE id = supplier_products.product_id 
      AND repairer_id = auth.uid()
    )
  );

CREATE POLICY "Repairers can update supplier products for their inventory" ON supplier_products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM pos_inventory_items 
      WHERE id = supplier_products.product_id 
      AND repairer_id = auth.uid()
    )
  );

CREATE POLICY "Repairers can delete supplier products for their inventory" ON supplier_products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM pos_inventory_items 
      WHERE id = supplier_products.product_id 
      AND repairer_id = auth.uid()
    )
  );