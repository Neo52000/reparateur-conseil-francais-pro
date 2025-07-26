-- Corriger le search_path pour la fonction
CREATE OR REPLACE FUNCTION public.get_connection_stats(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  date DATE,
  event_type TEXT,
  user_role TEXT,
  event_count BIGINT,
  unique_users BIGINT,
  avg_session_duration NUMERIC
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path TO ''
AS $$
  SELECT 
    date_trunc('day', created_at)::DATE as date,
    ca.event_type,
    ca.user_role,
    COUNT(*) as event_count,
    COUNT(DISTINCT ca.user_id) as unique_users,
    AVG(ca.session_duration) FILTER (WHERE ca.event_type = 'logout') as avg_session_duration
  FROM public.connection_analytics ca
  WHERE DATE(ca.created_at) BETWEEN start_date AND end_date
  GROUP BY date_trunc('day', ca.created_at)::DATE, ca.event_type, ca.user_role
  ORDER BY date DESC;
$$;