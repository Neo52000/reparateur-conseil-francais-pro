-- Tables pour le système d'automatisation complet

-- Table des logs de scraping en temps réel
CREATE TABLE IF NOT EXISTS public.scraping_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  city TEXT,
  category TEXT,
  max_results INTEGER DEFAULT 20,
  items_scraped INTEGER DEFAULT 0,
  items_added INTEGER DEFAULT 0,
  items_updated INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des suggestions de scraping avant validation
CREATE TABLE IF NOT EXISTS public.scraping_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  business_name TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  phone TEXT,
  website TEXT,
  email TEXT,
  rating NUMERIC,
  review_count INTEGER,
  description TEXT,
  services TEXT[],
  lat NUMERIC,
  lng NUMERIC,
  source TEXT NOT NULL,
  quality_score NUMERIC DEFAULT 0,
  ai_confidence NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des logs de relances automatiques
CREATE TABLE IF NOT EXISTS public.relaunch_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  relaunch_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  template_used TEXT,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE
);

-- Table des suggestions IA pour réparateurs
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  suggestion_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_metric TEXT,
  expected_change NUMERIC,
  confidence NUMERIC,
  action_steps TEXT[],
  priority TEXT DEFAULT 'medium',
  estimated_time INTEGER,
  resources TEXT[],
  status TEXT DEFAULT 'active', -- active, implemented, dismissed
  implemented_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des analytics réparateurs
CREATE TABLE IF NOT EXISTS public.repairer_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  profile_views INTEGER DEFAULT 0,
  contact_clicks INTEGER DEFAULT 0,
  quote_requests INTEGER DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  ranking_position INTEGER,
  competitor_analysis JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des templates de relances
CREATE TABLE IF NOT EXISTS public.relaunch_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  call_to_action TEXT,
  personalization_fields TEXT[],
  is_active BOOLEAN DEFAULT true,
  success_rate NUMERIC DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.scraping_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraping_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relaunch_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repairer_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relaunch_templates ENABLE ROW LEVEL SECURITY;

-- Policies pour les admins seulement sur les logs et suggestions
CREATE POLICY "Admins can manage scraping logs" ON public.scraping_logs
  FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage scraping suggestions" ON public.scraping_suggestions
  FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can view relaunch logs" ON public.relaunch_logs
  FOR SELECT USING (get_current_user_role() = 'admin');

CREATE POLICY "System can insert relaunch logs" ON public.relaunch_logs
  FOR INSERT WITH CHECK (true);

-- Policies pour les suggestions IA
CREATE POLICY "Repairers can view their AI suggestions" ON public.ai_suggestions
  FOR SELECT USING (repairer_id = auth.uid() OR get_current_user_role() = 'admin');

CREATE POLICY "System can insert AI suggestions" ON public.ai_suggestions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Repairers can update their suggestions status" ON public.ai_suggestions
  FOR UPDATE USING (repairer_id = auth.uid())
  WITH CHECK (repairer_id = auth.uid());

-- Policies pour les analytics
CREATE POLICY "Repairers can view their analytics" ON public.repairer_analytics
  FOR SELECT USING (repairer_id = auth.uid() OR get_current_user_role() = 'admin');

CREATE POLICY "System can insert analytics" ON public.repairer_analytics
  FOR INSERT WITH CHECK (true);

-- Policies pour les templates
CREATE POLICY "Admins can manage templates" ON public.relaunch_templates
  FOR ALL USING (get_current_user_role() = 'admin');

-- Indexes pour les performances
CREATE INDEX IF NOT EXISTS idx_scraping_suggestions_status ON public.scraping_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_scraping_suggestions_quality ON public.scraping_suggestions(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_repairer ON public.ai_suggestions(repairer_id);
CREATE INDEX IF NOT EXISTS idx_repairer_analytics_date ON public.repairer_analytics(repairer_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_relaunch_logs_type_status ON public.relaunch_logs(relaunch_type, status);