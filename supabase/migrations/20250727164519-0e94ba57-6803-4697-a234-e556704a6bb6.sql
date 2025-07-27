-- Migration complète pour le plan de résolution
-- 1. Table pour les demandes d'intérêt clients

CREATE TABLE IF NOT EXISTS public.client_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  client_message TEXT,
  repairer_profile_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'sent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Table pour les analytics visiteurs en temps réel
CREATE TABLE IF NOT EXISTS public.visitor_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  hour INTEGER NOT NULL DEFAULT EXTRACT(HOUR FROM now()),
  page_path TEXT NOT NULL,
  visitor_count INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  bounce_rate NUMERIC DEFAULT 0,
  avg_session_duration INTEGER DEFAULT 0,
  device_type TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Table pour la configuration des modules optionnels
CREATE TABLE IF NOT EXISTS public.optional_modules_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Smartphone',
  is_active BOOLEAN NOT NULL DEFAULT true,
  pricing_monthly NUMERIC NOT NULL DEFAULT 0,
  pricing_yearly NUMERIC NOT NULL DEFAULT 0,
  available_for_plans TEXT[] NOT NULL DEFAULT '{}',
  category TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  new_features TEXT[] DEFAULT '{}',
  color TEXT NOT NULL DEFAULT 'blue',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Table pour les canaux de notification
CREATE TABLE IF NOT EXISTS public.notification_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'webhook', 'slack')),
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Table pour les monitors (monitoring)
CREATE TABLE IF NOT EXISTS public.monitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'http' CHECK (type IN ('http', 'ping', 'tcp', 'dns')),
  interval_minutes INTEGER NOT NULL DEFAULT 5,
  timeout_seconds INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_check_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'unknown' CHECK (status IN ('up', 'down', 'unknown')),
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Table pour les incidents de monitoring
CREATE TABLE IF NOT EXISTS public.monitor_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  monitor_id UUID NOT NULL REFERENCES public.monitors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.client_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optional_modules_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitor_incidents ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour client_interests
CREATE POLICY "Admins can manage client interests" ON public.client_interests
FOR ALL USING (get_current_user_role() = 'admin');

-- Politiques RLS pour visitor_analytics
CREATE POLICY "Admins can manage visitor analytics" ON public.visitor_analytics
FOR ALL USING (get_current_user_role() = 'admin');

-- Politiques RLS pour optional_modules_config
CREATE POLICY "Admins can manage optional modules config" ON public.optional_modules_config
FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Public can view active modules config" ON public.optional_modules_config
FOR SELECT USING (is_active = true);

-- Politiques RLS pour notification_channels
CREATE POLICY "Repairers can manage their notification channels" ON public.notification_channels
FOR ALL USING (repairer_id = auth.uid());

-- Politiques RLS pour monitors
CREATE POLICY "Repairers can manage their monitors" ON public.monitors
FOR ALL USING (repairer_id = auth.uid());

-- Politiques RLS pour monitor_incidents
CREATE POLICY "Repairers can view incidents for their monitors" ON public.monitor_incidents
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.monitors 
  WHERE monitors.id = monitor_incidents.monitor_id 
  AND monitors.repairer_id = auth.uid()
));

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER client_interests_updated_at BEFORE UPDATE ON public.client_interests FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER visitor_analytics_updated_at BEFORE UPDATE ON public.visitor_analytics FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER optional_modules_config_updated_at BEFORE UPDATE ON public.optional_modules_config FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER notification_channels_updated_at BEFORE UPDATE ON public.notification_channels FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER monitors_updated_at BEFORE UPDATE ON public.monitors FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER monitor_incidents_updated_at BEFORE UPDATE ON public.monitor_incidents FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Insérer les modules optionnels par défaut
INSERT INTO public.optional_modules_config (module_id, name, description, icon, pricing_monthly, pricing_yearly, available_for_plans, category, features, new_features, color) VALUES
('pos', 'POS Avancé', 'Point de vente complet avec gestion NF-525, archivage automatique et conformité fiscale', 'Smartphone', 49.90, 499.00, ARRAY['premium', 'enterprise'], 'Système POS', ARRAY['Interface POS tactile', 'Archivage automatique NF-525', 'Gestion des sessions', 'Tickets conformes', 'Synchronisation temps réel'], ARRAY['Archivage NF-525', 'Hash d''intégrité', 'Audit complet'], 'blue'),
('ecommerce', 'Module E-commerce', 'Boutique en ligne complète avec gestion des commandes et paiements intégrés', 'ShoppingCart', 89.00, 890.00, ARRAY['premium', 'enterprise'], 'Plateforme E-commerce', ARRAY['Boutique en ligne personnalisée', 'Catalogue produits synchronisé', 'Paiements en ligne Stripe', 'Gestion commandes', 'Analytics e-commerce'], ARRAY['Synchronisation POS', 'SEO intégré', 'Mobile responsive'], 'blue'),
('buyback', 'Module Rachat', 'Système de rachat d''appareils avec évaluation IA et gestion complète des stocks', 'Euro', 39.00, 390.00, ARRAY['premium', 'enterprise'], 'Module Rachat', ARRAY['Évaluation IA automatique', 'Grille de prix dynamique', 'Gestion des stocks rachetés', 'Suivi des revenus', 'Interface client dédiée'], ARRAY['IA d''évaluation', 'Prix dynamiques', 'Stats avancées'], 'green'),
('ai_diagnostic', 'IA Diagnostic', 'Assistant IA pour le pré-diagnostic et l''aide à la réparation avec Ben', 'Brain', 0, 0, ARRAY['basic', 'premium', 'enterprise'], 'IA Diagnostic', ARRAY['Chatbot Ben personnalisé', 'Pré-diagnostic automatique', 'Base de connaissances', 'Suggestions de réparation', 'Historique des conversations'], ARRAY['Assistant Ben', 'Diagnostic avancé', 'Apprentissage continu'], 'purple'),
('monitoring', 'Monitoring Business', 'Surveillance en temps réel de votre activité avec alertes intelligentes', 'TrendingUp', 0, 0, ARRAY['enterprise'], 'Monitoring Business', ARRAY['Dashboard temps réel', 'Alertes personnalisées', 'Métriques business', 'Analyses prédictives', 'Rapports automatiques'], ARRAY['Alertes intelligentes', 'Prédictions IA', 'Monitoring 24/7'], 'orange'),
('advertising', 'Publicité IA', 'Gestion automatisée de vos campagnes publicitaires avec IA', 'Megaphone', 79.00, 790.00, ARRAY['premium', 'enterprise'], 'Publicité IA', ARRAY['Campagnes automatisées', 'Ciblage intelligent', 'Optimisation auto enchères', 'Analytics publicitaires', 'Création annonces IA'], ARRAY['IA prédictive', 'Ciblage avancé', 'ROI optimisé'], 'red')
ON CONFLICT (module_id) DO NOTHING;