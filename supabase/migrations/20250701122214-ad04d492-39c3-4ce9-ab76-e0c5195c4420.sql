
-- Tables pour le module publicitaire avancé

-- Table pour les segments de ciblage avancé
CREATE TABLE public.advanced_targeting_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL DEFAULT '{}',
  estimated_reach INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les zones de géociblage
CREATE TABLE public.geo_targeting_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('city', 'postal_code', 'radius', 'region')),
  coordinates JSONB,
  polygons JSONB,
  metadata JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les campagnes automatisées
CREATE TABLE public.automated_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('acquisition', 'reactivation', 'loyalty', 'contextual')),
  triggers JSONB NOT NULL DEFAULT '{}',
  rules JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_executed TIMESTAMP WITH TIME ZONE,
  next_execution TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les variantes de campagnes (A/B Testing)
CREATE TABLE public.campaign_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  variant_data JSONB NOT NULL DEFAULT '{}',
  traffic_split INTEGER NOT NULL DEFAULT 50,
  performance_metrics JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les créatifs de campagne
CREATE TABLE public.campaign_creatives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  creative_type TEXT NOT NULL CHECK (creative_type IN ('image', 'video', 'text', 'html')),
  creative_url TEXT,
  creative_data JSONB NOT NULL DEFAULT '{}',
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  performance_score NUMERIC DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour le tracking comportemental
CREATE TABLE public.user_behavior_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les métriques de performance des campagnes
CREATE TABLE public.campaign_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  segment_id UUID REFERENCES public.advanced_targeting_segments(id),
  geo_zone_id UUID REFERENCES public.geo_targeting_zones(id),
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  cost NUMERIC NOT NULL DEFAULT 0,
  revenue NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour l'historique des interactions utilisateur
CREATE TABLE public.user_interaction_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  interaction_type TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes pour améliorer les performances
CREATE INDEX idx_targeting_segments_active ON public.advanced_targeting_segments(is_active);
CREATE INDEX idx_geo_zones_type ON public.geo_targeting_zones(type);
CREATE INDEX idx_geo_zones_active ON public.geo_targeting_zones(is_active);
CREATE INDEX idx_automated_campaigns_type ON public.automated_campaigns(campaign_type);
CREATE INDEX idx_automated_campaigns_next_execution ON public.automated_campaigns(next_execution);
CREATE INDEX idx_campaign_variants_campaign ON public.campaign_variants(campaign_id);
CREATE INDEX idx_campaign_creatives_campaign ON public.campaign_creatives(campaign_id);
CREATE INDEX idx_behavior_events_user ON public.user_behavior_events(user_id);
CREATE INDEX idx_behavior_events_type ON public.user_behavior_events(event_type);
CREATE INDEX idx_performance_metrics_campaign ON public.campaign_performance_metrics(campaign_id);
CREATE INDEX idx_performance_metrics_date ON public.campaign_performance_metrics(date);
CREATE INDEX idx_interaction_history_user ON public.user_interaction_history(user_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_targeting_segments_updated_at 
    BEFORE UPDATE ON public.advanced_targeting_segments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automated_campaigns_updated_at 
    BEFORE UPDATE ON public.automated_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.advanced_targeting_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geo_targeting_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interaction_history ENABLE ROW LEVEL SECURITY;

-- Policies pour que seuls les admins puissent gérer les données publicitaires
CREATE POLICY "Admins can manage targeting segments" ON public.advanced_targeting_segments
  FOR ALL TO authenticated
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage geo zones" ON public.geo_targeting_zones
  FOR ALL TO authenticated
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage automated campaigns" ON public.automated_campaigns
  FOR ALL TO authenticated
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage campaign variants" ON public.campaign_variants
  FOR ALL TO authenticated
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage campaign creatives" ON public.campaign_creatives
  FOR ALL TO authenticated
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all performance metrics" ON public.campaign_performance_metrics
  FOR SELECT TO authenticated
  USING (get_current_user_role() = 'admin');

-- Permettre l'insertion d'événements comportementaux à tous
CREATE POLICY "Anyone can track behavior events" ON public.user_behavior_events
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Users can view their own behavior events" ON public.user_behavior_events
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all behavior events" ON public.user_behavior_events
  FOR SELECT TO authenticated
  USING (get_current_user_role() = 'admin');

-- Permissions pour l'historique des interactions
CREATE POLICY "Users can manage their own interactions" ON public.user_interaction_history
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all interactions" ON public.user_interaction_history
  FOR SELECT TO authenticated
  USING (get_current_user_role() = 'admin');
