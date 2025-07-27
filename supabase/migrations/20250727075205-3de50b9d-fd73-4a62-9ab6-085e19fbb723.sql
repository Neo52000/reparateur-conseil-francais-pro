-- Migration - Partie 4: Modèles d'appareils corrigés
-- Ajouter les modèles sans la colonne release_year qui n'existe pas

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
      INSERT INTO public.device_models (brand_id, device_type_id, model_name)
      VALUES (apple_brand_id, smartphone_type_id, 'iPhone 15 Pro');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.device_models WHERE brand_id = apple_brand_id AND model_name = 'iPhone 15') THEN
      INSERT INTO public.device_models (brand_id, device_type_id, model_name)
      VALUES (apple_brand_id, smartphone_type_id, 'iPhone 15');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.device_models WHERE brand_id = apple_brand_id AND model_name = 'iPhone 14') THEN
      INSERT INTO public.device_models (brand_id, device_type_id, model_name)
      VALUES (apple_brand_id, smartphone_type_id, 'iPhone 14');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.device_models WHERE brand_id = apple_brand_id AND model_name = 'iPhone 13') THEN
      INSERT INTO public.device_models (brand_id, device_type_id, model_name)
      VALUES (apple_brand_id, smartphone_type_id, 'iPhone 13');
    END IF;
  END IF;
  
  -- Ajouter des modèles Samsung si Samsung existe
  IF samsung_brand_id IS NOT NULL AND smartphone_type_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.device_models WHERE brand_id = samsung_brand_id AND model_name = 'Galaxy S24') THEN
      INSERT INTO public.device_models (brand_id, device_type_id, model_name)
      VALUES (samsung_brand_id, smartphone_type_id, 'Galaxy S24');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.device_models WHERE brand_id = samsung_brand_id AND model_name = 'Galaxy S23') THEN
      INSERT INTO public.device_models (brand_id, device_type_id, model_name)
      VALUES (samsung_brand_id, smartphone_type_id, 'Galaxy S23');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.device_models WHERE brand_id = samsung_brand_id AND model_name = 'Galaxy A54') THEN
      INSERT INTO public.device_models (brand_id, device_type_id, model_name)
      VALUES (samsung_brand_id, smartphone_type_id, 'Galaxy A54');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.device_models WHERE brand_id = samsung_brand_id AND model_name = 'Galaxy A34') THEN
      INSERT INTO public.device_models (brand_id, device_type_id, model_name)
      VALUES (samsung_brand_id, smartphone_type_id, 'Galaxy A34');
    END IF;
  END IF;
END $$;