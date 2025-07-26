-- Phase 1 (Ajustée): Extension du système de modules pour la publicité IA

-- Mise à jour de la table available_features pour le module advertising
INSERT INTO public.available_features (feature_key, feature_name, description, category, is_active)
VALUES 
  ('advertising_ai', 'Publicité IA', 'Génération automatique de campagnes publicitaires avec IA', 'automation', true),
  ('ai_content_generation', 'Génération de contenus IA', 'Création automatique de textes et visuels publicitaires', 'automation', true),
  ('google_css', 'Google CSS Partner', 'Réduction jusqu''à 20% sur les enchères Google Shopping', 'optimization', true),
  ('multi_channel_ads', 'Diffusion Multi-Canaux', 'Gestion automatisée Google Ads, Meta Ads, Microsoft Ads', 'automation', true),
  ('catalog_sync', 'Synchronisation Catalogue', 'Import automatique du catalogue POS vers les campagnes', 'integration', true)
ON CONFLICT (feature_key) DO NOTHING;

-- Ajout des nouvelles tables uniquement si elles n'existent pas déjà
DO $$ 
BEGIN
  -- Table pour les campagnes publicitaires
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'advertising_campaigns') THEN
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
    
    ALTER TABLE public.advertising_campaigns ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Repairers can manage their own campaigns" 
    ON public.advertising_campaigns 
    FOR ALL 
    USING (
      repairer_id = auth.uid() OR 
      get_current_user_role() = 'admin'
    );
    
    CREATE TRIGGER update_advertising_campaigns_updated_at
      BEFORE UPDATE ON public.advertising_campaigns
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  -- Table pour la synchronisation du catalogue POS
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pos_catalog_sync') THEN
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
    
    ALTER TABLE public.pos_catalog_sync ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Repairers can manage their catalog sync" 
    ON public.pos_catalog_sync 
    FOR ALL 
    USING (
      repairer_id = auth.uid() OR 
      get_current_user_role() = 'admin'
    );
    
    CREATE TRIGGER update_pos_catalog_sync_updated_at
      BEFORE UPDATE ON public.pos_catalog_sync
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  -- Table pour l'historique des contenus générés par IA
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ai_generated_content') THEN
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
    
    ALTER TABLE public.ai_generated_content ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Repairers can view their AI content" 
    ON public.ai_generated_content 
    FOR ALL 
    USING (
      repairer_id = auth.uid() OR 
      get_current_user_role() = 'admin'
    );
  END IF;

  -- Table pour la gestion des budgets par canal
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'advertising_budgets') THEN
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
    
    ALTER TABLE public.advertising_budgets ENABLE ROW LEVEL SECURITY;
    
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
    
    CREATE TRIGGER update_advertising_budgets_updated_at
      BEFORE UPDATE ON public.advertising_budgets
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  -- Table pour la programmation automatisée des campagnes
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'campaign_schedules') THEN
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
    
    ALTER TABLE public.campaign_schedules ENABLE ROW LEVEL SECURITY;
    
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
    
    CREATE TRIGGER update_campaign_schedules_updated_at
      BEFORE UPDATE ON public.campaign_schedules
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  -- Table pour les configurations du Google CSS
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'google_css_config') THEN
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
    
    ALTER TABLE public.google_css_config ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Repairers can manage their CSS config" 
    ON public.google_css_config 
    FOR ALL 
    USING (
      repairer_id = auth.uid() OR 
      get_current_user_role() = 'admin'
    );
    
    CREATE TRIGGER update_google_css_config_updated_at
      BEFORE UPDATE ON public.google_css_config
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  -- Table pour les métriques de campagnes publicitaires
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'advertising_analytics') THEN
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
    
    ALTER TABLE public.advertising_analytics ENABLE ROW LEVEL SECURITY;
    
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
  END IF;

END $$;