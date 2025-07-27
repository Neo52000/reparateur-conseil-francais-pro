-- Migration pour corriger la création de réparations
-- Ajouter des données de base et corriger les triggers

-- Insérer des conditions d'appareil de base
INSERT INTO public.device_conditions (name, description, color, icon, is_active) 
VALUES 
  ('Excellent', 'Appareil en parfait état', '#22c55e', '✨', true),
  ('Bon', 'Quelques traces d''usage mineures', '#3b82f6', '👍', true),
  ('Moyen', 'Usure visible mais fonctionnel', '#f59e0b', '⚠️', true),
  ('Mauvais', 'Dommages importants', '#ef4444', '❌', true),
  ('Hors service', 'Appareil non fonctionnel', '#dc2626', '💀', true)
ON CONFLICT (name) DO NOTHING;

-- Insérer des types d'appareils de base
INSERT INTO public.device_types (name, icon, is_active)
VALUES 
  ('Smartphone', '📱', true),
  ('Tablette', '📓', true),
  ('Ordinateur portable', '💻', true),
  ('Montre connectée', '⌚', true),
  ('Console de jeu', '🎮', true)
ON CONFLICT (name) DO NOTHING;

-- Insérer des marques de base
INSERT INTO public.brands (name, logo_url)
VALUES 
  ('Apple', NULL),
  ('Samsung', NULL),
  ('Huawei', NULL),
  ('Xiaomi', NULL),
  ('OnePlus', NULL),
  ('Google', NULL),
  ('Sony', NULL),
  ('LG', NULL),
  ('Oppo', NULL),
  ('Vivo', NULL)
ON CONFLICT (name) DO NOTHING;

-- Insérer quelques modèles d'appareils populaires
WITH apple_brand AS (SELECT id FROM public.brands WHERE name = 'Apple' LIMIT 1),
     samsung_brand AS (SELECT id FROM public.brands WHERE name = 'Samsung' LIMIT 1),
     smartphone_type AS (SELECT id FROM public.device_types WHERE name = 'Smartphone' LIMIT 1)
INSERT INTO public.device_models (brand_id, device_type_id, model_name, release_year)
SELECT 
  CASE 
    WHEN model_name LIKE 'iPhone%' THEN (SELECT id FROM apple_brand)
    WHEN model_name LIKE 'Galaxy%' THEN (SELECT id FROM samsung_brand)
  END as brand_id,
  (SELECT id FROM smartphone_type) as device_type_id,
  model_name,
  release_year
FROM (VALUES 
  ('iPhone 15 Pro', 2023),
  ('iPhone 15', 2023),
  ('iPhone 14 Pro', 2022),
  ('iPhone 14', 2022),
  ('iPhone 13', 2021),
  ('Galaxy S24', 2024),
  ('Galaxy S23', 2023),
  ('Galaxy A54', 2023),
  ('Galaxy A34', 2023)
) AS models(model_name, release_year)
ON CONFLICT (brand_id, device_type_id, model_name) DO NOTHING;

-- Corriger le trigger pour la génération automatique du numéro d'ordre
-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS auto_generate_repair_order_number_trigger ON public.repair_orders;

-- Créer ou remplacer la fonction de génération du numéro d'ordre
CREATE OR REPLACE FUNCTION public.auto_generate_repair_order_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Ne générer le numéro que si order_number est NULL
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := public.generate_repair_order_number(NEW.repairer_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour la génération automatique
CREATE TRIGGER auto_generate_repair_order_number_trigger
  BEFORE INSERT ON public.repair_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_repair_order_number();

-- Corriger la fonction generate_repair_order_number pour gérer les UUIDs
CREATE OR REPLACE FUNCTION public.generate_repair_order_number(repairer_id uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  prefix TEXT;
  counter INTEGER;
  order_number TEXT;
BEGIN
  -- Créer un préfixe basé sur la date
  prefix := 'REP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-';
  
  -- Obtenir le compteur du jour pour ce réparateur
  SELECT COALESCE(MAX(
    CASE WHEN order_number LIKE prefix || '%' 
    THEN CAST(SUBSTRING(order_number FROM LENGTH(prefix) + 1) AS INTEGER)
    ELSE 0 END
  ), 0) + 1 INTO counter
  FROM public.repair_orders 
  WHERE repair_orders.repairer_id = generate_repair_order_number.repairer_id
  AND DATE(created_at) = CURRENT_DATE;
  
  order_number := prefix || LPAD(counter::TEXT, 4, '0');
  
  RETURN order_number;
END;
$$;

-- Vérifier et créer les index manquants pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_repair_orders_repairer_date 
ON public.repair_orders(repairer_id, created_at);

CREATE INDEX IF NOT EXISTS idx_repair_orders_order_number 
ON public.repair_orders(order_number);

CREATE INDEX IF NOT EXISTS idx_repair_devices_repairer 
ON public.repair_devices(repairer_id);

-- Vérifier la structure des tables de base
DO $$
BEGIN
  -- Vérifier que les colonnes importantes existent
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'repair_orders' AND column_name = 'order_number'
  ) THEN
    ALTER TABLE public.repair_orders ADD COLUMN order_number TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'repair_devices' AND column_name = 'pin_code'
  ) THEN
    ALTER TABLE public.repair_devices ADD COLUMN pin_code TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'repair_devices' AND column_name = 'sim_code'
  ) THEN
    ALTER TABLE public.repair_devices ADD COLUMN sim_code TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'repair_devices' AND column_name = 'lock_pattern'
  ) THEN
    ALTER TABLE public.repair_devices ADD COLUMN lock_pattern TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'repair_devices' AND column_name = 'security_notes'
  ) THEN
    ALTER TABLE public.repair_devices ADD COLUMN security_notes TEXT;
  END IF;
END $$;