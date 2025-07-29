-- Supprimer temporairement la contrainte CHECK
ALTER TABLE public.plan_features 
DROP CONSTRAINT IF EXISTS plan_features_plan_name_check;

-- Supprimer la contrainte d'unicité temporairement pour éviter les conflits
ALTER TABLE public.plan_features 
DROP CONSTRAINT IF EXISTS plan_features_plan_name_feature_key_key;

-- Supprimer les doublons potentiels avant la mise à jour
-- On garde seulement le premier enregistrement pour chaque combinaison
DELETE FROM public.plan_features p1 
WHERE EXISTS (
  SELECT 1 FROM public.plan_features p2 
  WHERE p1.plan_name = p2.plan_name 
  AND p1.feature_key = p2.feature_key 
  AND p1.created_at > p2.created_at
);

-- Mettre à jour la nomenclature des plans
UPDATE public.plan_features 
SET plan_name = CASE 
  WHEN plan_name = 'Basique' THEN 'Visibilité'
  WHEN plan_name = 'Enterprise' THEN 'Premium'
  WHEN plan_name = 'Premium' THEN 'Pro'
  ELSE plan_name
END;

-- Supprimer à nouveau les doublons qui pourraient avoir été créés par la mise à jour
DELETE FROM public.plan_features p1 
WHERE EXISTS (
  SELECT 1 FROM public.plan_features p2 
  WHERE p1.plan_name = p2.plan_name 
  AND p1.feature_key = p2.feature_key 
  AND p1.id > p2.id
);

-- Recréer les contraintes
ALTER TABLE public.plan_features 
ADD CONSTRAINT plan_features_plan_name_check 
CHECK (plan_name IN ('Gratuit', 'Visibilité', 'Pro', 'Premium'));

ALTER TABLE public.plan_features 
ADD CONSTRAINT plan_features_plan_name_feature_key_key 
UNIQUE (plan_name, feature_key);

-- Créer une table pour les prix des plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL UNIQUE CHECK (plan_name IN ('Gratuit', 'Visibilité', 'Pro', 'Premium')),
  price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_yearly NUMERIC(10,2) NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_recommended BOOLEAN DEFAULT false,
  has_promo BOOLEAN DEFAULT false,
  promo_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insérer les prix des plans
INSERT INTO public.subscription_plans (plan_name, price_monthly, price_yearly, display_order, is_recommended, has_promo, promo_text) VALUES
('Gratuit', 0, 0, 1, false, false, NULL),
('Visibilité', 19.90, 199, 2, false, false, NULL),
('Pro', 39.90, 399, 3, true, true, 'Promo en cours'),
('Premium', 99.90, 999, 4, false, false, NULL)
ON CONFLICT (plan_name) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  display_order = EXCLUDED.display_order,
  is_recommended = EXCLUDED.is_recommended,
  has_promo = EXCLUDED.has_promo,
  promo_text = EXCLUDED.promo_text,
  updated_at = now();