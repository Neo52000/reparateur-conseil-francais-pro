
-- Supprimer le plan Premium à 34,90€
DELETE FROM public.subscription_plans
WHERE name ILIKE 'Premium'
  AND price_monthly = 34.90;

-- Facultatif : vérifier qu'il ne reste plus qu'un seul Premium et que le plan Enterprise existe bien.
