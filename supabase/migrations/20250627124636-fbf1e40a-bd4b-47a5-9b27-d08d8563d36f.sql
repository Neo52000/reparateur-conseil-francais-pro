
-- Table pour stocker les bannières publicitaires
CREATE TABLE public.ad_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('client', 'repairer')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  max_impressions INTEGER,
  current_impressions INTEGER NOT NULL DEFAULT 0,
  max_clicks INTEGER,
  current_clicks INTEGER NOT NULL DEFAULT 0,
  daily_budget NUMERIC(10,2),
  targeting_config JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour le tracking des impressions
CREATE TABLE public.ad_impressions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  banner_id UUID NOT NULL REFERENCES public.ad_banners(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  placement TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour le tracking des clics
CREATE TABLE public.ad_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  banner_id UUID NOT NULL REFERENCES public.ad_banners(id) ON DELETE CASCADE,
  impression_id UUID REFERENCES public.ad_impressions(id),
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  placement TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour améliorer les performances des requêtes analytics
CREATE INDEX idx_ad_impressions_banner_created ON public.ad_impressions(banner_id, created_at);
CREATE INDEX idx_ad_clicks_banner_created ON public.ad_clicks(banner_id, created_at);
CREATE INDEX idx_ad_banners_active_target ON public.ad_banners(is_active, target_type);

-- Activer RLS sur toutes les tables
ALTER TABLE public.ad_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_clicks ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les bannières (seuls les admins peuvent les gérer)
CREATE POLICY "Admins can manage ad banners"
  ON public.ad_banners
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques pour les impressions (lecture publique pour les stats, insertion pour tous)
CREATE POLICY "Anyone can record impressions"
  ON public.ad_impressions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all impressions"
  ON public.ad_impressions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques pour les clics (lecture publique pour les stats, insertion pour tous)
CREATE POLICY "Anyone can record clicks"
  ON public.ad_clicks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all clicks"
  ON public.ad_clicks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_ad_banners_updated_at
  BEFORE UPDATE ON public.ad_banners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
