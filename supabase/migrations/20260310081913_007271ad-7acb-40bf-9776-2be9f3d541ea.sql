
-- Social Booster Tables

-- Social Campaigns: links a blog post to a social campaign
CREATE TABLE public.social_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'detected' CHECK (status IN ('detected','normalized','classified','queued','generated','draft','approved','scheduled','publishing','published','failed','cancelled','skipped')),
  repairer_id UUID REFERENCES public.repairer_profiles(id) ON DELETE SET NULL,
  match_score NUMERIC,
  match_reason TEXT,
  article_classification JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(blog_post_id)
);

-- Social Posts: each generated post per platform
CREATE TABLE public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.social_campaigns(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook','instagram','x','linkedin')),
  content TEXT NOT NULL DEFAULT '',
  hashtags TEXT[] DEFAULT '{}',
  cta_text TEXT,
  cta_url TEXT,
  media_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','scheduled','publishing','published','failed','cancelled')),
  external_post_id TEXT,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, platform)
);

-- Publication logs
CREATE TABLE public.social_publication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  social_post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.social_campaigns(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  response_data JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Social settings (single row config)
CREATE TABLE public.social_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config JSONB NOT NULL DEFAULT '{
    "auto_scan": false,
    "default_platforms": ["facebook","instagram","x","linkedin"],
    "utm_source": "social",
    "utm_medium": "post",
    "utm_campaign_prefix": "blog-booster",
    "base_url": "https://topreparateurs.fr"
  }'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default settings row
INSERT INTO public.social_settings (config) VALUES ('{
  "auto_scan": false,
  "default_platforms": ["facebook","instagram","x","linkedin"],
  "utm_source": "social",
  "utm_medium": "post",
  "utm_campaign_prefix": "blog-booster",
  "base_url": "https://topreparateurs.fr"
}'::jsonb);

-- Indexes
CREATE INDEX idx_social_campaigns_status ON public.social_campaigns(status);
CREATE INDEX idx_social_campaigns_blog_post ON public.social_campaigns(blog_post_id);
CREATE INDEX idx_social_posts_campaign ON public.social_posts(campaign_id);
CREATE INDEX idx_social_posts_status ON public.social_posts(status);
CREATE INDEX idx_social_posts_platform ON public.social_posts(platform);
CREATE INDEX idx_social_publication_logs_post ON public.social_publication_logs(social_post_id);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_social_campaigns_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path TO '' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trigger_social_campaigns_updated_at
  BEFORE UPDATE ON public.social_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_social_campaigns_updated_at();

CREATE OR REPLACE FUNCTION public.update_social_posts_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path TO '' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trigger_social_posts_updated_at
  BEFORE UPDATE ON public.social_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_social_posts_updated_at();

-- RLS
ALTER TABLE public.social_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_publication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_settings ENABLE ROW LEVEL SECURITY;

-- Admin-only policies (using existing get_current_user_role pattern)
CREATE POLICY "Admin full access social_campaigns" ON public.social_campaigns
  FOR ALL TO authenticated USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admin full access social_posts" ON public.social_posts
  FOR ALL TO authenticated USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admin full access social_publication_logs" ON public.social_publication_logs
  FOR ALL TO authenticated USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admin full access social_settings" ON public.social_settings
  FOR ALL TO authenticated USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');
