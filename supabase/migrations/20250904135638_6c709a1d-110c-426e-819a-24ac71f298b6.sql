-- Fix remaining Security Definer View issues
-- Remove SECURITY DEFINER where not needed and add proper authorization

-- 1. Fix get_connection_stats - Remove SECURITY DEFINER, add admin check
CREATE OR REPLACE FUNCTION public.get_connection_stats(start_date date DEFAULT (CURRENT_DATE - '30 days'::interval), end_date date DEFAULT CURRENT_DATE)
RETURNS TABLE(date date, event_type text, user_role text, event_count bigint, unique_users bigint, avg_session_duration numeric)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  -- Only allow admins to access connection stats
  SELECT 
    date_trunc('day', created_at)::DATE as date,
    ca.event_type,
    ca.user_role,
    COUNT(*) as event_count,
    COUNT(DISTINCT ca.user_id) as unique_users,
    AVG(ca.session_duration) FILTER (WHERE ca.event_type = 'logout') as avg_session_duration
  FROM public.connection_analytics ca
  WHERE DATE(ca.created_at) BETWEEN start_date AND end_date
    AND public.get_current_user_role() = 'admin'
  GROUP BY
    date_trunc('day', created_at)::DATE,
    ca.event_type,
    ca.user_role
  ORDER BY date DESC, ca.event_type;
$$;

-- 2. Fix get_service_performance - Remove SECURITY DEFINER, add admin check
CREATE OR REPLACE FUNCTION public.get_service_performance()
RETURNS TABLE(service_type text, total_pages integer, avg_views numeric, avg_ctr numeric, avg_seo_score numeric)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  -- Only allow admins to access service performance
  SELECT 
    lsp.service_type,
    COUNT(*)::INTEGER as total_pages,
    ROUND(AVG(lsp.page_views)::NUMERIC, 1) as avg_views,
    ROUND(AVG(lsp.click_through_rate)::NUMERIC, 2) as avg_ctr,
    ROUND(AVG(lsp.seo_score)::NUMERIC, 1) as avg_seo_score
  FROM public.local_seo_pages lsp
  WHERE lsp.is_published = true
    AND public.get_current_user_role() = 'admin'
  GROUP BY lsp.service_type
  ORDER BY avg_views DESC;
$$;

-- 3. Fix get_top_performing_cities - Remove SECURITY DEFINER, add admin check
CREATE OR REPLACE FUNCTION public.get_top_performing_cities(limit_count integer DEFAULT 10)
RETURNS TABLE(city text, total_views integer, avg_ctr numeric, total_conversions integer, performance_score numeric)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  -- Only allow admins to access top performing cities
  SELECT 
    lsp.city,
    lsp.page_views::INTEGER as total_views,
    ROUND(lsp.click_through_rate::NUMERIC, 2) as avg_ctr,
    COALESCE(SUM(lsm.conversions), 0)::INTEGER as total_conversions,
    ROUND((lsp.page_views * lsp.click_through_rate * lsp.seo_score / 100)::NUMERIC, 1) as performance_score
  FROM public.local_seo_pages lsp
  LEFT JOIN public.local_seo_metrics lsm ON lsp.id = lsm.page_id
  WHERE lsp.is_published = true 
    AND lsp.page_views > 0
    AND public.get_current_user_role() = 'admin'
  GROUP BY lsp.id, lsp.city, lsp.page_views, lsp.click_through_rate, lsp.seo_score
  ORDER BY performance_score DESC
  LIMIT limit_count;
$$;

-- 4. Fix fix_encoding_issues - Remove SECURITY DEFINER, add admin check
CREATE OR REPLACE FUNCTION public.fix_encoding_issues()
RETURNS TABLE(fixed_count integer, details jsonb)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  repairer_record RECORD;
  fixed_count_var INTEGER := 0;
  details_array JSONB := '[]'::JSONB;
BEGIN
  -- Only allow admins to fix encoding issues
  IF public.get_current_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Only admins can fix encoding issues';
  END IF;
  
  -- Parcourir tous les réparateurs avec des problèmes d'encodage
  FOR repairer_record IN 
    SELECT id, name, city, address, description
    FROM public.repairers 
    WHERE name LIKE '%�%' 
       OR city LIKE '%�%' 
       OR address LIKE '%�%' 
       OR description LIKE '%�%'
  LOOP
    -- Correction des caractères d'encodage
    UPDATE public.repairers 
    SET 
      name = REPLACE(REPLACE(REPLACE(REPLACE(name, 'Ã©', 'é'), 'Ã¨', 'è'), 'Ã ', 'à'), '�', 'é'),
      city = REPLACE(REPLACE(REPLACE(REPLACE(city, 'Ã©', 'é'), 'Ã¨', 'è'), 'Ã ', 'à'), '�', 'é'),
      address = REPLACE(REPLACE(REPLACE(REPLACE(address, 'Ã©', 'é'), 'Ã¨', 'è'), 'Ã ', 'à'), '�', 'é'),
      description = REPLACE(REPLACE(REPLACE(REPLACE(description, 'Ã©', 'é'), 'Ã¨', 'è'), 'Ã ', 'à'), '�', 'é'),
      updated_at = now()
    WHERE id = repairer_record.id;
    
    fixed_count_var := fixed_count_var + 1;
    details_array := details_array || jsonb_build_object(
      'id', repairer_record.id,
      'name', repairer_record.name
    );
  END LOOP;
  
  RETURN QUERY SELECT fixed_count_var, details_array;
END;
$$;

-- Add comments explaining the security improvements
COMMENT ON FUNCTION public.get_connection_stats IS 'Function with admin-only access control - no longer SECURITY DEFINER';
COMMENT ON FUNCTION public.get_service_performance IS 'Function with admin-only access control - no longer SECURITY DEFINER';  
COMMENT ON FUNCTION public.get_top_performing_cities IS 'Function with admin-only access control - no longer SECURITY DEFINER';
COMMENT ON FUNCTION public.fix_encoding_issues IS 'Function with admin-only access control - no longer SECURITY DEFINER';