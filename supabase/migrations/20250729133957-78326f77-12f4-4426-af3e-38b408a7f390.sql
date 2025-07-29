-- Supprimer temporairement la contrainte CHECK
ALTER TABLE public.plan_features 
DROP CONSTRAINT IF EXISTS plan_features_plan_name_check;

-- Supprimer la contrainte d'unicité temporairement pour éviter les conflits
ALTER TABLE public.plan_features 
DROP CONSTRAINT IF EXISTS plan_features_plan_name_feature_key_key;

-- Supprimer les doublons potentiels avant la mise à jour
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

-- Ajouter les colonnes manquantes à la table subscription_plans existante
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_promo BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS promo_text TEXT,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Mettre à jour les données existantes dans subscription_plans
UPDATE public.subscription_plans SET
  name = CASE 
    WHEN name = 'Basique' THEN 'Visibilité'
    WHEN name = 'Enterprise' THEN 'Premium'
    WHEN name = 'Premium' THEN 'Pro'
    ELSE name
  END,
  is_recommended = CASE WHEN name = 'Pro' THEN true ELSE false END,
  has_promo = CASE WHEN name = 'Pro' THEN true ELSE false END,
  promo_text = CASE WHEN name = 'Pro' THEN 'Promo en cours' ELSE NULL END,
  display_order = CASE 
    WHEN name = 'Gratuit' THEN 1
    WHEN name = 'Visibilité' THEN 2
    WHEN name = 'Pro' THEN 3
    WHEN name = 'Premium' THEN 4
    ELSE 0
  END;