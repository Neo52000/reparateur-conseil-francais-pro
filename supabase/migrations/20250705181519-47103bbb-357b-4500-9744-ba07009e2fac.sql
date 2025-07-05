-- Phase 4 : Données de démonstration avec adresses
INSERT INTO ecommerce_orders (repairer_id, order_number, customer_email, customer_name, customer_phone, billing_address, shipping_address, subtotal, tax_amount, total_amount, order_status, payment_status, payment_method, created_at)
SELECT 
  p.id,
  'ORD-20250105-001',
  'marie.dubois@email.fr',
  'Marie Dubois',
  '0123456789',
  jsonb_build_object(
    'name', 'Marie Dubois',
    'address_line_1', '123 Rue de la République',
    'city', 'Paris',
    'postal_code', '75001',
    'country', 'France'
  ),
  jsonb_build_object(
    'name', 'Marie Dubois',
    'address_line_1', '123 Rue de la République',
    'city', 'Paris',
    'postal_code', '75001',
    'country', 'France'
  ),
  149.90,
  29.98,
  179.88,
  'processing',
  'paid',
  'card',
  NOW() - INTERVAL '2 days'
FROM profiles p WHERE p.email = 'demo@demo.fr'
UNION ALL
SELECT 
  p.id,
  'ORD-20250104-001',
  'pierre.martin@email.fr',
  'Pierre Martin',
  '0987654321',
  jsonb_build_object(
    'name', 'Pierre Martin',
    'address_line_1', '456 Avenue des Champs',
    'city', 'Lyon',
    'postal_code', '69000',
    'country', 'France'
  ),
  jsonb_build_object(
    'name', 'Pierre Martin',
    'address_line_1', '456 Avenue des Champs',
    'city', 'Lyon',
    'postal_code', '69000',
    'country', 'France'
  ),
  89.90,
  17.98,
  107.88,
  'completed',
  'paid',
  'paypal',
  NOW() - INTERVAL '3 days'
FROM profiles p WHERE p.email = 'demo@demo.fr'
UNION ALL
SELECT 
  p.id,
  'ORD-20250103-001',
  'sophie.bernard@email.fr',
  'Sophie Bernard',
  '0555123456',
  jsonb_build_object(
    'name', 'Sophie Bernard',
    'address_line_1', '789 Boulevard Saint-Germain',
    'city', 'Marseille',
    'postal_code', '13000',
    'country', 'France'
  ),
  jsonb_build_object(
    'name', 'Sophie Bernard',
    'address_line_1', '789 Boulevard Saint-Germain',
    'city', 'Marseille',
    'postal_code', '13000',
    'country', 'France'
  ),
  70.90,
  14.18,
  85.08,
  'shipped',
  'paid',
  'card',
  NOW() - INTERVAL '5 days'
FROM profiles p WHERE p.email = 'demo@demo.fr';

-- Fonction de synchronisation des stocks entre POS et E-commerce
CREATE OR REPLACE FUNCTION sync_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Synchroniser les stocks du POS vers E-commerce
  IF TG_TABLE_NAME = 'pos_inventory_items' THEN
    UPDATE ecommerce_products 
    SET 
      stock_quantity = NEW.current_stock,
      stock_status = CASE 
        WHEN NEW.current_stock = 0 THEN 'out_of_stock'
        WHEN NEW.current_stock <= NEW.minimum_stock THEN 'low_stock'
        ELSE 'in_stock'
      END,
      updated_at = NOW()
    WHERE sku = NEW.sku AND repairer_id = NEW.repairer_id;
  END IF;
  
  -- Synchroniser les stocks d'E-commerce vers POS
  IF TG_TABLE_NAME = 'ecommerce_products' THEN
    UPDATE pos_inventory_items 
    SET 
      current_stock = NEW.stock_quantity,
      updated_at = NOW()
    WHERE sku = NEW.sku AND repairer_id = NEW.repairer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer les triggers de synchronisation
DROP TRIGGER IF EXISTS sync_pos_to_ecommerce ON pos_inventory_items;
CREATE TRIGGER sync_pos_to_ecommerce
  AFTER UPDATE OF current_stock ON pos_inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION sync_inventory_stock();

DROP TRIGGER IF EXISTS sync_ecommerce_to_pos ON ecommerce_products;
CREATE TRIGGER sync_ecommerce_to_pos
  AFTER UPDATE OF stock_quantity ON ecommerce_products
  FOR EACH ROW
  EXECUTE FUNCTION sync_inventory_stock();