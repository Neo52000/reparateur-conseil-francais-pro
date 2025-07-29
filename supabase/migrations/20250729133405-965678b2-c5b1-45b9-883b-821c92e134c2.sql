-- Supprimer temporairement la contrainte CHECK
ALTER TABLE public.plan_features 
DROP CONSTRAINT IF EXISTS plan_features_plan_name_check;

-- Mettre à jour la nomenclature des plans
UPDATE public.plan_features 
SET plan_name = CASE 
  WHEN plan_name = 'Basique' THEN 'Visibilité'
  WHEN plan_name = 'Enterprise' THEN 'Premium'
  WHEN plan_name = 'Premium' THEN 'Pro'
  ELSE plan_name
END;

-- Recréer la contrainte CHECK avec les nouveaux noms
ALTER TABLE public.plan_features 
ADD CONSTRAINT plan_features_plan_name_check 
CHECK (plan_name IN ('Gratuit', 'Visibilité', 'Pro', 'Premium'));

-- Créer une table pour les prix des plans si elle n'existe pas
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

-- Insérer les prix des plans selon la nouvelle nomenclature
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

-- Activer RLS si nécessaire
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'subscription_plans' 
    AND pg_class.oid IN (SELECT oid FROM pg_class WHERE relrowsecurity = true)
  ) THEN
    ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Créer les politiques RLS si elles n'existent pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'subscription_plans' 
    AND policyname = 'Public can view subscription plans'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can view subscription plans" 
      ON public.subscription_plans FOR SELECT 
      USING (is_active = true)';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'subscription_plans' 
    AND policyname = 'Admins can manage subscription plans'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage subscription plans" 
      ON public.subscription_plans FOR ALL 
      USING (get_current_user_role() = ''admin'')';
  END IF;
END $$;

-- Créer le trigger pour updated_at si il n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_subscription_plans_updated_at'
  ) THEN
    EXECUTE 'CREATE TRIGGER update_subscription_plans_updated_at 
        BEFORE UPDATE ON public.subscription_plans 
        FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column()';
  END IF;
END $$;