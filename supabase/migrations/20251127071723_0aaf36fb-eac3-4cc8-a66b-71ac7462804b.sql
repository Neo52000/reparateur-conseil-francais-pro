-- Correction des fonctions SECURITY DEFINER restantes

-- 1. Corriger get_blog_automation_config pour utiliser user_roles
CREATE OR REPLACE FUNCTION public.get_blog_automation_config()
RETURNS TABLE(
  id uuid,
  enabled boolean,
  auto_publish boolean,
  schedule_time text,
  schedule_day integer,
  ai_model text,
  last_run_at timestamp with time zone,
  next_run_at timestamp with time zone,
  prompt_template text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Vérifier que l'utilisateur est admin via user_roles
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Retourner la configuration
  RETURN QUERY
  SELECT 
    bac.id,
    bac.enabled,
    bac.auto_publish,
    bac.schedule_time,
    bac.schedule_day,
    bac.ai_model,
    bac.last_run_at,
    bac.next_run_at,
    bac.prompt_template,
    bac.created_at,
    bac.updated_at
  FROM public.blog_automation_config bac
  ORDER BY bac.created_at DESC
  LIMIT 1;
END;
$function$;

-- 2. Ajouter vérification admin à get_blog_automation_status
CREATE OR REPLACE FUNCTION public.get_blog_automation_status()
RETURNS TABLE(
  enabled boolean,
  schedule text,
  last_run timestamp with time zone,
  next_run timestamp with time zone,
  last_status text,
  last_error text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    true as enabled,
    '0 8 * * *' as schedule,
    NULL::timestamp with time zone as last_run,
    NULL::timestamp with time zone as next_run,
    'pending'::text as last_status,
    NULL::text as last_error
  WHERE EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
    AND is_active = true
  );
$function$;

-- 3. Ajouter search_path à calculate_repairer_commission
CREATE OR REPLACE FUNCTION public.calculate_repairer_commission(repairer_uuid uuid, transaction_amount numeric)
RETURNS TABLE(
  commission_rate numeric,
  commission_amount numeric,
  tier_id uuid,
  tier_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  monthly_revenue DECIMAL;
  current_tier RECORD;
BEGIN
  -- Calculer le CA mensuel du réparateur (30 derniers jours)
  SELECT COALESCE(SUM(transaction_amount), 0) INTO monthly_revenue
  FROM public.transaction_commissions
  WHERE repairer_id = repairer_uuid
    AND payment_date >= CURRENT_DATE - INTERVAL '30 days'
    AND status = 'paid';
  
  -- Trouver le palier approprié
  SELECT * INTO current_tier
  FROM public.commission_tiers
  WHERE is_active = true
    AND min_monthly_revenue <= monthly_revenue
    AND (max_monthly_revenue IS NULL OR max_monthly_revenue > monthly_revenue)
  ORDER BY min_monthly_revenue DESC
  LIMIT 1;
  
  -- Si aucun palier trouvé, utiliser le palier Bronze par défaut
  IF current_tier IS NULL THEN
    SELECT * INTO current_tier
    FROM public.commission_tiers
    WHERE tier_name = 'Bronze' AND is_active = true
    LIMIT 1;
  END IF;
  
  RETURN QUERY SELECT 
    current_tier.commission_rate,
    ROUND((transaction_amount * current_tier.commission_rate / 100)::NUMERIC, 2),
    current_tier.id,
    current_tier.tier_name;
END;
$function$;