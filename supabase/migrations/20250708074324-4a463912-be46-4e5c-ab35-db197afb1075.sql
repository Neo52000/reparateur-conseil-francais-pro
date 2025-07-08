-- Migration pour les sous-domaines et landing pages

-- Table des sous-domaines
CREATE TABLE IF NOT EXISTS public.subdomains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subdomain TEXT NOT NULL UNIQUE,
  repairer_id UUID NOT NULL,
  landing_page_id UUID,
  is_active BOOLEAN DEFAULT true,
  custom_domain TEXT,
  ssl_enabled BOOLEAN DEFAULT false,
  dns_configured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des landing pages configurables
CREATE TABLE IF NOT EXISTS public.landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'default',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des templates de landing pages
CREATE TABLE IF NOT EXISTS public.landing_page_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  preview_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE subdomains ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_templates ENABLE ROW LEVEL SECURITY;

-- Policies pour subdomains
CREATE POLICY "Admins can manage all subdomains" ON subdomains FOR ALL USING (
  get_current_user_role() = 'admin'
);

CREATE POLICY "Repairers can view their subdomain" ON subdomains FOR SELECT USING (
  EXISTS (SELECT 1 FROM repairer_profiles WHERE user_id = auth.uid() AND id::text = repairer_id::text)
);

-- Policies pour landing_pages
CREATE POLICY "Admins can manage landing pages" ON landing_pages FOR ALL USING (
  get_current_user_role() = 'admin'
);

CREATE POLICY "Public can view active landing pages" ON landing_pages FOR SELECT USING (
  is_active = true
);

-- Policies pour templates
CREATE POLICY "Admins can manage templates" ON landing_page_templates FOR ALL USING (
  get_current_user_role() = 'admin'
);

CREATE POLICY "Public can view active templates" ON landing_page_templates FOR SELECT USING (
  is_active = true
);

-- Function pour vérifier l'accès aux sous-domaines selon le plan
CREATE OR REPLACE FUNCTION can_create_subdomain(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM repairer_subscriptions 
    WHERE repairer_subscriptions.user_id = can_create_subdomain.user_id
      AND subscription_tier IN ('basic', 'pro', 'premium', 'enterprise')
      AND subscribed = true
  );
$$;