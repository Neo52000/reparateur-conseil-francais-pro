
-- Table de paramétrage des fonctionnalités par plan d’abonnement
CREATE TABLE public.feature_flags_by_plan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL,  -- ex : "Gratuit", "Basique", "Premium", "Enterprise"
  feature_key TEXT NOT NULL, -- ex: "parts_marketplace", "ai_prediag", etc.
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(plan_name, feature_key)
);

-- Activation du RLS (accès uniquement par l’admin)
ALTER TABLE public.feature_flags_by_plan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin-only" ON public.feature_flags_by_plan
  FOR ALL TO authenticated USING (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.role = 'superadmin')
  ));

