
-- Ajouter le feature flag pour le mode démo dans les constantes features
-- Cette modification sera reflétée dans le code par la suite

-- Insérer le nouveau flag de mode démo pour tous les plans
INSERT INTO public.feature_flags_by_plan (plan_name, feature_key, enabled) 
VALUES 
  ('Gratuit', 'demo_mode_enabled', false),
  ('Basique', 'demo_mode_enabled', false),
  ('Premium', 'demo_mode_enabled', false),
  ('Enterprise', 'demo_mode_enabled', true)
ON CONFLICT (plan_name, feature_key) DO UPDATE SET enabled = EXCLUDED.enabled;
