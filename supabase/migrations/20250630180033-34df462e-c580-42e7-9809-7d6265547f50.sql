
-- Créer la table ad_campaigns pour la gestion des campagnes publicitaires
CREATE TABLE public.ad_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  budget_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  budget_daily NUMERIC(10,2) NOT NULL DEFAULT 0,
  budget_spent NUMERIC(10,2) NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  targeting_config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Créer la table campaign_banners pour lier les campagnes aux bannières
CREATE TABLE public.campaign_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  banner_id UUID NOT NULL REFERENCES public.ad_banners(id) ON DELETE CASCADE,
  weight INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, banner_id)
);

-- Créer la table targeting_segments pour le ciblage avancé
CREATE TABLE public.targeting_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL DEFAULT '{}',
  estimated_reach INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter la colonne campaign_id à la table ad_banners
ALTER TABLE public.ad_banners ADD COLUMN campaign_id UUID REFERENCES public.ad_campaigns(id);

-- Créer les index pour optimiser les performances
CREATE INDEX idx_ad_campaigns_status ON public.ad_campaigns(status);
CREATE INDEX idx_ad_campaigns_start_date ON public.ad_campaigns(start_date);
CREATE INDEX idx_ad_campaigns_created_by ON public.ad_campaigns(created_by);
CREATE INDEX idx_campaign_banners_campaign_id ON public.campaign_banners(campaign_id);
CREATE INDEX idx_campaign_banners_banner_id ON public.campaign_banners(banner_id);
CREATE INDEX idx_targeting_segments_is_active ON public.targeting_segments(is_active);
CREATE INDEX idx_ad_banners_campaign_id ON public.ad_banners(campaign_id);

-- Créer un trigger pour mettre à jour updated_at sur ad_campaigns
CREATE TRIGGER update_ad_campaigns_updated_at
  BEFORE UPDATE ON public.ad_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Créer un trigger pour mettre à jour updated_at sur targeting_segments
CREATE TRIGGER update_targeting_segments_updated_at
  BEFORE UPDATE ON public.targeting_segments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Activer RLS sur les nouvelles tables
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.targeting_segments ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour ad_campaigns
CREATE POLICY "Admins can manage all campaigns" ON public.ad_campaigns
  FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can view active campaigns" ON public.ad_campaigns
  FOR SELECT USING (status = 'active');

-- Créer les politiques RLS pour campaign_banners
CREATE POLICY "Admins can manage campaign banners" ON public.campaign_banners
  FOR ALL USING (get_current_user_role() = 'admin');

-- Créer les politiques RLS pour targeting_segments
CREATE POLICY "Admins can manage targeting segments" ON public.targeting_segments
  FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can view active segments" ON public.targeting_segments
  FOR SELECT USING (is_active = true);
