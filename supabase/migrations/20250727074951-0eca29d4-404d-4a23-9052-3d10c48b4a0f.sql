-- Migration corrigée pour les données de base - Partie 1
-- Ajouter les données de base avec des vérifications d'existence

-- Insérer des conditions d'appareil de base (vérification d'existence d'abord)
DO $$
BEGIN
  -- Device conditions
  IF NOT EXISTS (SELECT 1 FROM public.device_conditions WHERE name = 'Excellent') THEN
    INSERT INTO public.device_conditions (name, description, color, icon, is_active) 
    VALUES ('Excellent', 'Appareil en parfait état', '#22c55e', '✨', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.device_conditions WHERE name = 'Bon') THEN
    INSERT INTO public.device_conditions (name, description, color, icon, is_active) 
    VALUES ('Bon', 'Quelques traces d''usage mineures', '#3b82f6', '👍', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.device_conditions WHERE name = 'Moyen') THEN
    INSERT INTO public.device_conditions (name, description, color, icon, is_active) 
    VALUES ('Moyen', 'Usure visible mais fonctionnel', '#f59e0b', '⚠️', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.device_conditions WHERE name = 'Mauvais') THEN
    INSERT INTO public.device_conditions (name, description, color, icon, is_active) 
    VALUES ('Mauvais', 'Dommages importants', '#ef4444', '❌', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.device_conditions WHERE name = 'Hors service') THEN
    INSERT INTO public.device_conditions (name, description, color, icon, is_active) 
    VALUES ('Hors service', 'Appareil non fonctionnel', '#dc2626', '💀', true);
  END IF;

  -- Device types
  IF NOT EXISTS (SELECT 1 FROM public.device_types WHERE name = 'Smartphone') THEN
    INSERT INTO public.device_types (name, icon, is_active) VALUES ('Smartphone', '📱', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.device_types WHERE name = 'Tablette') THEN
    INSERT INTO public.device_types (name, icon, is_active) VALUES ('Tablette', '📓', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.device_types WHERE name = 'Ordinateur portable') THEN
    INSERT INTO public.device_types (name, icon, is_active) VALUES ('Ordinateur portable', '💻', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.device_types WHERE name = 'Montre connectée') THEN
    INSERT INTO public.device_types (name, icon, is_active) VALUES ('Montre connectée', '⌚', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.device_types WHERE name = 'Console de jeu') THEN
    INSERT INTO public.device_types (name, icon, is_active) VALUES ('Console de jeu', '🎮', true);
  END IF;

  -- Brands
  IF NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'Apple') THEN
    INSERT INTO public.brands (name, logo_url) VALUES ('Apple', NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'Samsung') THEN
    INSERT INTO public.brands (name, logo_url) VALUES ('Samsung', NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'Huawei') THEN
    INSERT INTO public.brands (name, logo_url) VALUES ('Huawei', NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'Xiaomi') THEN
    INSERT INTO public.brands (name, logo_url) VALUES ('Xiaomi', NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'OnePlus') THEN
    INSERT INTO public.brands (name, logo_url) VALUES ('OnePlus', NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'Google') THEN
    INSERT INTO public.brands (name, logo_url) VALUES ('Google', NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'Sony') THEN
    INSERT INTO public.brands (name, logo_url) VALUES ('Sony', NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'LG') THEN
    INSERT INTO public.brands (name, logo_url) VALUES ('LG', NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'Oppo') THEN
    INSERT INTO public.brands (name, logo_url) VALUES ('Oppo', NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'Vivo') THEN
    INSERT INTO public.brands (name, logo_url) VALUES ('Vivo', NULL);
  END IF;
END $$;