-- Solution 1: Correction immédiate des données incohérentes

-- Corriger les repairer_id invalides dans quotes_with_timeline
-- Les remplacer par des repairer_profiles.id existants
UPDATE public.quotes_with_timeline 
SET repairer_id = (
  SELECT id 
  FROM public.repairer_profiles 
  ORDER BY created_at DESC
  LIMIT 1
)
WHERE repairer_id NOT IN (
  SELECT id 
  FROM public.repairer_profiles
) 
AND repairer_id IS NOT NULL;

-- Mettre à jour assignment_status pour les devis avec repairer_id valide
UPDATE public.quotes_with_timeline 
SET assignment_status = 'assigned'
WHERE repairer_id IS NOT NULL 
AND repairer_id IN (
  SELECT id 
  FROM public.repairer_profiles
)
AND assignment_status = 'pending';

-- Log des corrections effectuées
INSERT INTO public.admin_analytics (
  metric_type, 
  value, 
  metric_data
) VALUES (
  'data_correction',
  (SELECT COUNT(*) FROM public.quotes_with_timeline WHERE assignment_status = 'assigned'),
  jsonb_build_object(
    'correction_type', 'repairer_id_consistency',
    'timestamp', now(),
    'description', 'Correction des repairer_id incohérents dans quotes_with_timeline'
  )
);