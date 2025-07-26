-- Phase 1: Création des tables pour le module publicitaire IA

-- Table pour les campagnes publicitaires
CREATE TABLE public.advertising_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  campaign_type TEXT NOT NULL DEFAULT 'automated',
  budget_total NUMERIC NOT NULL DEFAULT 0,
  budget_daily NUMERIC NOT NULL DEFAULT 0,
  budget_spent NUMERIC NOT NULL DEFAULT 0,
  channels JSONB NOT NULL DEFAULT '[]'::JSONB,
  targeting_config JSONB NOT NULL DEFAULT '{}'::JSONB,
  creative_style TEXT DEFAULT 'proximite',
  auto_optimization BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les contenus créatifs IA
CREATE TABLE public.campaign_creatives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.advertising_campaigns(id) ON DELETE CASCADE,
  creative_type TEXT NOT NULL,
  creative_url TEXT,
  creative_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  ai_model TEXT,
  generation_prompt TEXT,
  performance_score NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  name TEXT NOT NULL DEFAULT 'Sans nom',
  metadata JSONB DEFAULT '{}'::JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les métriques de campagnes
CREATE TABLE public.advertising_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.advertising_campaigns(id) ON DELETE CASCADE,
  creative_id UUID REFERENCES public.campaign_creatives(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  channel TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  ctr NUMERIC DEFAULT 0,
  cpc NUMERIC DEFAULT 0,
  roas NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour la synchronisation du catalogue POS
CREATE TABLE public.pos_catalog_sync (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  catalog_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  sync_status TEXT NOT NULL DEFAULT 'pending',
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_errors JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(repairer_id, catalog_type, item_id)
);

-- Table pour l'historique des contenus générés par IA
CREATE TABLE public.ai_generated_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  source_item_id TEXT,
  ai_model TEXT NOT NULL,
  generation_prompt TEXT NOT NULL,
  generated_content JSONB NOT NULL DEFAULT '{}'::JSONB,
  style_used TEXT,
  generation_cost NUMERIC DEFAULT 0,
  quality_score NUMERIC DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour la gestion des budgets par canal
CREATE TABLE public.advertising_budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.advertising_campaigns(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  budget_allocated NUMERIC NOT NULL DEFAULT 0,
  budget_spent NUMERIC NOT NULL DEFAULT 0,
  auto_optimization BOOLEAN DEFAULT true,
  optimization_rules JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, channel)
);

-- Table pour la programmation automatisée des campagnes
CREATE TABLE public.campaign_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.advertising_campaigns(id) ON DELETE CASCADE,
  schedule_type TEXT NOT NULL DEFAULT 'recurring',
  frequency TEXT NOT NULL,
  schedule_config JSONB NOT NULL DEFAULT '{}'::JSONB,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  next_execution_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les configurations du Google CSS
CREATE TABLE public.google_css_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL UNIQUE,
  css_provider TEXT,
  css_account_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  savings_percentage NUMERIC DEFAULT 0,
  total_savings NUMERIC DEFAULT 0,
  activation_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies pour la sécurité
ALTER TABLE public.advertising_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertising_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_catalog_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertising_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_css_config ENABLE ROW LEVEL SECURITY;

-- Policies pour advertising_campaigns
CREATE POLICY "Repairers can manage their own campaigns" 
ON public.advertising_campaigns 
FOR ALL 
USING (
  repairer_id = auth.uid() OR 
  get_current_user_role() = 'admin'
);

-- Policies pour campaign_creatives
CREATE POLICY "Repairers can manage creatives for their campaigns" 
ON public.campaign_creatives 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.advertising_campaigns 
    WHERE id = campaign_creatives.campaign_id 
    AND (repairer_id = auth.uid() OR get_current_user_role() = 'admin')
  )
);

-- Policies pour advertising_analytics
CREATE POLICY "Repairers can view their campaign analytics" 
ON public.advertising_analytics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.advertising_campaigns 
    WHERE id = advertising_analytics.campaign_id 
    AND (repairer_id = auth.uid() OR get_current_user_role() = 'admin')
  )
);

-- Policies pour pos_catalog_sync
CREATE POLICY "Repairers can manage their catalog sync" 
ON public.pos_catalog_sync 
FOR ALL 
USING (
  repairer_id = auth.uid() OR 
  get_current_user_role() = 'admin'
);

-- Policies pour ai_generated_content
CREATE POLICY "Repairers can view their AI content" 
ON public.ai_generated_content 
FOR ALL 
USING (
  repairer_id = auth.uid() OR 
  get_current_user_role() = 'admin'
);

-- Policies pour advertising_budgets
CREATE POLICY "Repairers can manage budgets for their campaigns" 
ON public.advertising_budgets 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.advertising_campaigns 
    WHERE id = advertising_budgets.campaign_id 
    AND (repairer_id = auth.uid() OR get_current_user_role() = 'admin')
  )
);

-- Policies pour campaign_schedules
CREATE POLICY "Repairers can manage schedules for their campaigns" 
ON public.campaign_schedules 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.advertising_campaigns 
    WHERE id = campaign_schedules.campaign_id 
    AND (repairer_id = auth.uid() OR get_current_user_role() = 'admin')
  )
);

-- Policies pour google_css_config
CREATE POLICY "Repairers can manage their CSS config" 
ON public.google_css_config 
FOR ALL 
USING (
  repairer_id = auth.uid() OR 
  get_current_user_role() = 'admin'
);

-- Triggers pour updated_at
CREATE TRIGGER update_advertising_campaigns_updated_at
  BEFORE UPDATE ON public.advertising_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaign_creatives_updated_at
  BEFORE UPDATE ON public.campaign_creatives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_catalog_sync_updated_at
  BEFORE UPDATE ON public.pos_catalog_sync
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advertising_budgets_updated_at
  BEFORE UPDATE ON public.advertising_budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaign_schedules_updated_at
  BEFORE UPDATE ON public.campaign_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_google_css_config_updated_at
  BEFORE UPDATE ON public.google_css_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();