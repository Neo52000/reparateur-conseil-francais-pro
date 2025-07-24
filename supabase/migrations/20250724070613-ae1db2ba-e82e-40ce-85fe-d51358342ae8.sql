-- Modifier la table inventory_items existante pour ajouter les colonnes manquantes
ALTER TABLE public.inventory_items 
ADD COLUMN IF NOT EXISTS sku TEXT,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS selling_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER,
ADD COLUMN IF NOT EXISTS min_stock_level INTEGER,
ADD COLUMN IF NOT EXISTS max_stock_level INTEGER,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_service BOOLEAN DEFAULT false;

-- Mettre à jour les contraintes et valeurs par défaut
ALTER TABLE public.inventory_items 
ALTER COLUMN sku SET NOT NULL,
ALTER COLUMN name SET NOT NULL,
ALTER COLUMN selling_price SET NOT NULL,
ALTER COLUMN stock_quantity SET NOT NULL,
ALTER COLUMN stock_quantity SET DEFAULT 0,
ALTER COLUMN min_stock_level SET NOT NULL,
ALTER COLUMN min_stock_level SET DEFAULT 5;

-- Ajouter l'unicité sur le SKU
ALTER TABLE public.inventory_items 
ADD CONSTRAINT unique_sku UNIQUE (sku);

-- Insérer quelques articles de démonstration
INSERT INTO public.inventory_items (sku, name, description, category, brand, model, cost_price, selling_price, stock_quantity, min_stock_level, repairer_id, current_stock) VALUES
('IPHONE13-SCREEN', 'Écran iPhone 13', 'Écran LCD de remplacement pour iPhone 13', 'Écrans', 'Apple', 'iPhone 13', 120.00, 180.00, 15, 5, 'e7d4b0c8-3f2a-4a5b-8c9d-1e2f3a4b5c6d'::uuid, 15),
('SAMSUNG-S21-BATTERY', 'Batterie Samsung Galaxy S21', 'Batterie lithium-ion 4000mAh', 'Batteries', 'Samsung', 'Galaxy S21', 25.00, 45.00, 25, 10, 'e7d4b0c8-3f2a-4a5b-8c9d-1e2f3a4b5c6d'::uuid, 25),
('REPAIR-BASIC', 'Réparation basique', 'Service de réparation standard', 'Services', 'TopRéparateurs', 'Standard', 0.00, 50.00, 999, 1, 'e7d4b0c8-3f2a-4a5b-8c9d-1e2f3a4b5c6d'::uuid, 999),
('XIAOMI-REDMI-SCREEN', 'Écran Xiaomi Redmi Note 10', 'Écran AMOLED de remplacement', 'Écrans', 'Xiaomi', 'Redmi Note 10', 45.00, 75.00, 8, 5, 'e7d4b0c8-3f2a-4a5b-8c9d-1e2f3a4b5c6d'::uuid, 8),
('PHONE-CASE-UNIVERSAL', 'Coque protection universelle', 'Coque en silicone transparente', 'Accessoires', 'Générique', 'Universal', 2.50, 8.99, 50, 20, 'e7d4b0c8-3f2a-4a5b-8c9d-1e2f3a4b5c6d'::uuid, 50)
ON CONFLICT (sku) DO NOTHING;