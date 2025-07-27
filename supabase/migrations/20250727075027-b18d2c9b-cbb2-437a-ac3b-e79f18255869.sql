-- Migration corrigée - Partie 2: Structure des tables et données de base
-- Vérifier et corriger la structure des tables, puis ajouter les données

-- Vérifier et ajouter les colonnes manquantes
DO $$
BEGIN
  -- Ajouter la colonne is_active à device_types si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'device_types' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.device_types ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;

  -- Ajouter les colonnes de sécurité à repair_devices si elles n'existent pas
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

-- Maintenant ajouter les données de base
DO $$
BEGIN
  -- Device conditions (avec vérification d'existence)
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

  -- Brands
  IF NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'Apple') THEN
    INSERT INTO public.brands (name, logo_url) VALUES ('Apple', NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'Samsung') THEN
    INSERT INTO public.brands (name, logo_url) VALUES ('Samsung', NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'Xiaomi') THEN
    INSERT INTO public.brands (name, logo_url) VALUES ('Xiaomi', NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'Google') THEN
    INSERT INTO public.brands (name, logo_url) VALUES ('Google', NULL);
  END IF;
END $$;