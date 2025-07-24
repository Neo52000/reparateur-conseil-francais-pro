-- Créer la table inventory_items pour la gestion de l'inventaire POS/E-commerce
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  brand TEXT,
  model TEXT,
  cost_price DECIMAL(10,2),
  selling_price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER NOT NULL DEFAULT 5,
  max_stock_level INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_service BOOLEAN NOT NULL DEFAULT false,
  repairer_id UUID,
  location TEXT,
  last_restocked TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Créer des politiques RLS
CREATE POLICY "Admins can manage all inventory items" 
ON public.inventory_items 
FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Repairers can manage their own inventory" 
ON public.inventory_items 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM repairer_profiles 
    WHERE user_id = auth.uid() AND id::text = repairer_id::text
  )
);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_inventory_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_items_updated_at();

-- Insérer quelques articles de démonstration
INSERT INTO public.inventory_items (sku, name, description, category, brand, model, cost_price, selling_price, stock_quantity, min_stock_level, repairer_id) VALUES
('IPHONE13-SCREEN', 'Écran iPhone 13', 'Écran LCD de remplacement pour iPhone 13', 'Écrans', 'Apple', 'iPhone 13', 120.00, 180.00, 15, 5, 'admin'),
('SAMSUNG-S21-BATTERY', 'Batterie Samsung Galaxy S21', 'Batterie lithium-ion 4000mAh', 'Batteries', 'Samsung', 'Galaxy S21', 25.00, 45.00, 25, 10, 'admin'),
('REPAIR-BASIC', 'Réparation basique', 'Service de réparation standard', 'Services', 'TopRéparateurs', 'Standard', 0.00, 50.00, 999, 1, 'admin'),
('XIAOMI-REDMI-SCREEN', 'Écran Xiaomi Redmi Note 10', 'Écran AMOLED de remplacement', 'Écrans', 'Xiaomi', 'Redmi Note 10', 45.00, 75.00, 8, 5, 'admin'),
('PHONE-CASE-UNIVERSAL', 'Coque protection universelle', 'Coque en silicone transparente', 'Accessoires', 'Générique', 'Universal', 2.50, 8.99, 50, 20, 'admin');