-- Migration - Partie 3: Triggers et modèles d'appareils
-- Corriger le trigger de génération automatique et ajouter les modèles

-- Corriger le trigger pour la génération automatique du numéro d'ordre
-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS auto_generate_repair_order_number_trigger ON public.repair_orders;

-- Créer ou remplacer la fonction de génération du numéro d'ordre
CREATE OR REPLACE FUNCTION public.auto_generate_repair_order_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Ne générer le numéro que si order_number est NULL ou vide
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

-- Ajouter quelques modèles d'appareils populaires
DO $$
DECLARE
  apple_brand_id UUID;
  samsung_brand_id UUID;
  smartphone_type_id UUID;
BEGIN
  -- Récupérer les IDs des marques et types
  SELECT id INTO apple_brand_id FROM public.brands WHERE name = 'Apple' LIMIT 1;
  SELECT id INTO samsung_brand_id FROM public.brands WHERE name = 'Samsung' LIMIT 1;
  SELECT id INTO smartphone_type_id FROM public.device_types WHERE name = 'Smartphone' LIMIT 1;
  
  -- Ajouter des modèles iPhone si Apple existe
  IF apple_brand_id IS NOT NULL AND smartphone_type_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.device_models WHERE brand_id = apple_brand_id AND model_name = 'iPhone 15 Pro') THEN
      INSERT INTO public.device_models (brand_id, device_type_id, model_name, release_year)
      VALUES (apple_brand_id, smartphone_type_id, 'iPhone 15 Pro', 2023);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.device_models WHERE brand_id = apple_brand_id AND model_name = 'iPhone 15') THEN
      INSERT INTO public.device_models (brand_id, device_type_id, model_name, release_year)
      VALUES (apple_brand_id, smartphone_type_id, 'iPhone 15', 2023);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.device_models WHERE brand_id = apple_brand_id AND model_name = 'iPhone 14') THEN
      INSERT INTO public.device_models (brand_id, device_type_id, model_name, release_year)
      VALUES (apple_brand_id, smartphone_type_id, 'iPhone 14', 2022);
    END IF;
  END IF;
  
  -- Ajouter des modèles Samsung si Samsung existe
  IF samsung_brand_id IS NOT NULL AND smartphone_type_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.device_models WHERE brand_id = samsung_brand_id AND model_name = 'Galaxy S24') THEN
      INSERT INTO public.device_models (brand_id, device_type_id, model_name, release_year)
      VALUES (samsung_brand_id, smartphone_type_id, 'Galaxy S24', 2024);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.device_models WHERE brand_id = samsung_brand_id AND model_name = 'Galaxy S23') THEN
      INSERT INTO public.device_models (brand_id, device_type_id, model_name, release_year)
      VALUES (samsung_brand_id, smartphone_type_id, 'Galaxy S23', 2023);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.device_models WHERE brand_id = samsung_brand_id AND model_name = 'Galaxy A54') THEN
      INSERT INTO public.device_models (brand_id, device_type_id, model_name, release_year)
      VALUES (samsung_brand_id, smartphone_type_id, 'Galaxy A54', 2023);
    END IF;
  END IF;
END $$;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_repair_orders_repairer_date 
ON public.repair_orders(repairer_id, created_at);

CREATE INDEX IF NOT EXISTS idx_repair_orders_order_number 
ON public.repair_orders(order_number);

CREATE INDEX IF NOT EXISTS idx_repair_devices_repairer 
ON public.repair_devices(repairer_id);

CREATE INDEX IF NOT EXISTS idx_device_models_brand_type 
ON public.device_models(brand_id, device_type_id);