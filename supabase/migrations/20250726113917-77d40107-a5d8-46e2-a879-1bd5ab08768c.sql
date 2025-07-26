-- Module Analytics - Statistiques de Connexions
CREATE TABLE public.connection_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout', 'session_timeout')),
  user_role TEXT,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB DEFAULT '{}',
  location_info JSONB DEFAULT '{}',
  session_duration INTEGER, -- en secondes pour logout
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.connection_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can view all connection analytics"
ON public.connection_analytics
FOR SELECT
USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can view their own connection analytics"
ON public.connection_analytics  
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert connection events"
ON public.connection_analytics
FOR INSERT
WITH CHECK (true);

-- Indexes pour performance
CREATE INDEX idx_connection_analytics_user_id ON public.connection_analytics(user_id);
CREATE INDEX idx_connection_analytics_created_at ON public.connection_analytics(created_at);
CREATE INDEX idx_connection_analytics_event_type ON public.connection_analytics(event_type);

-- Vue pour les statistiques de connexion
CREATE OR REPLACE VIEW public.connection_stats AS
SELECT 
  date_trunc('day', created_at) as date,
  event_type,
  user_role,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(session_duration) FILTER (WHERE event_type = 'logout') as avg_session_duration
FROM public.connection_analytics
GROUP BY date_trunc('day', created_at), event_type, user_role
ORDER BY date DESC;