-- ============================================================
-- AI-CMO Module: Brand Visibility Monitoring for AI Platforms
-- 7 tables for tracking brand mentions in conversational AI
-- ============================================================

-- Helper: auto-update updated_at trigger function (idempotent)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. ai_cmo_profiles — AI identity of the company (1:1 per site)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_cmo_profiles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id     uuid NOT NULL UNIQUE,
  description text,
  website     text,
  name_aliases jsonb DEFAULT '[]'::jsonb,
  llm_understanding text,
  products    text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_cmo_profiles_site ON public.ai_cmo_profiles(site_id);

ALTER TABLE public.ai_cmo_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_cmo_profiles_select" ON public.ai_cmo_profiles
  FOR SELECT USING (true);
CREATE POLICY "ai_cmo_profiles_insert" ON public.ai_cmo_profiles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "ai_cmo_profiles_update" ON public.ai_cmo_profiles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "ai_cmo_profiles_delete" ON public.ai_cmo_profiles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_ai_cmo_profiles_updated
  BEFORE UPDATE ON public.ai_cmo_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 2. ai_cmo_competitors — Tracked competitors
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_cmo_competitors (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id     uuid NOT NULL,
  name        text NOT NULL,
  website     text,
  weight      smallint DEFAULT 1 CHECK (weight >= 1 AND weight <= 10),
  sort_order  smallint,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_cmo_competitors_site ON public.ai_cmo_competitors(site_id);

ALTER TABLE public.ai_cmo_competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_cmo_competitors_select" ON public.ai_cmo_competitors
  FOR SELECT USING (true);
CREATE POLICY "ai_cmo_competitors_insert" ON public.ai_cmo_competitors
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "ai_cmo_competitors_update" ON public.ai_cmo_competitors
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "ai_cmo_competitors_delete" ON public.ai_cmo_competitors
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_ai_cmo_competitors_updated
  BEFORE UPDATE ON public.ai_cmo_competitors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 3. ai_cmo_questions — Monitoring prompts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_cmo_questions (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id                   uuid NOT NULL,
  prompt                    text NOT NULL,
  prompt_type               text CHECK (prompt_type IN ('product', 'expertise')),
  target_country            text,
  is_active                 boolean DEFAULT false,
  refresh_interval_seconds  integer DEFAULT 86400,
  last_run_at               timestamptz,
  next_run_at               timestamptz,
  sort_order                smallint,
  created_at                timestamptz DEFAULT now(),
  updated_at                timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_cmo_questions_site ON public.ai_cmo_questions(site_id);

ALTER TABLE public.ai_cmo_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_cmo_questions_select" ON public.ai_cmo_questions
  FOR SELECT USING (true);
CREATE POLICY "ai_cmo_questions_insert" ON public.ai_cmo_questions
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "ai_cmo_questions_update" ON public.ai_cmo_questions
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "ai_cmo_questions_delete" ON public.ai_cmo_questions
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_ai_cmo_questions_updated
  BEFORE UPDATE ON public.ai_cmo_questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 4. ai_cmo_prompt_runs — LLM execution results (read-only for admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_cmo_prompt_runs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id             uuid NOT NULL,
  question_id         uuid REFERENCES public.ai_cmo_questions(id) ON DELETE SET NULL,
  llm_provider        text NOT NULL,
  llm_model           text NOT NULL,
  brand_mentioned     boolean,
  company_domain_rank smallint,
  top_domain          text,
  raw_response        text,
  mentioned_pages     jsonb DEFAULT '[]'::jsonb,
  run_at              timestamptz,
  created_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_cmo_prompt_runs_site ON public.ai_cmo_prompt_runs(site_id);
CREATE INDEX IF NOT EXISTS idx_ai_cmo_prompt_runs_site_run ON public.ai_cmo_prompt_runs(site_id, run_at DESC);

ALTER TABLE public.ai_cmo_prompt_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_cmo_prompt_runs_select" ON public.ai_cmo_prompt_runs
  FOR SELECT USING (true);
-- Insert/update/delete handled by service_role key (external service)

-- ============================================================
-- 5. ai_cmo_dashboard_stats — KPI (1:1 per site, read-only for admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_cmo_dashboard_stats (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id               uuid NOT NULL UNIQUE,
  ai_visibility_score   real DEFAULT 0,
  website_citation_share real DEFAULT 0,
  total_runs            integer DEFAULT 0,
  share_of_voice        jsonb DEFAULT '[]'::jsonb,
  computed_at           timestamptz,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_cmo_dashboard_stats_site ON public.ai_cmo_dashboard_stats(site_id);

ALTER TABLE public.ai_cmo_dashboard_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_cmo_dashboard_stats_select" ON public.ai_cmo_dashboard_stats
  FOR SELECT USING (true);

CREATE TRIGGER trg_ai_cmo_dashboard_stats_updated
  BEFORE UPDATE ON public.ai_cmo_dashboard_stats
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 6. ai_cmo_recommendations — Competitive analyses (read-only for admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_cmo_recommendations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id             uuid NOT NULL,
  competitor_domain   text,
  prompts_to_analyze  jsonb DEFAULT '[]'::jsonb,
  why_competitor      text,
  why_not_user        text,
  what_to_do          text,
  completed_at        timestamptz,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_cmo_recommendations_site ON public.ai_cmo_recommendations(site_id);

ALTER TABLE public.ai_cmo_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_cmo_recommendations_select" ON public.ai_cmo_recommendations
  FOR SELECT USING (true);

CREATE TRIGGER trg_ai_cmo_recommendations_updated
  BEFORE UPDATE ON public.ai_cmo_recommendations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 7. ai_cmo_llm_costs — LLM API costs (read-only for admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_cmo_llm_costs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id     uuid NOT NULL,
  model       text NOT NULL,
  call_type   text,
  date        date NOT NULL,
  cost        real DEFAULT 0,
  call_count  integer,
  tokens_in   integer,
  tokens_out  integer,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_cmo_llm_costs_site ON public.ai_cmo_llm_costs(site_id);
CREATE INDEX IF NOT EXISTS idx_ai_cmo_llm_costs_site_date ON public.ai_cmo_llm_costs(site_id, date DESC);

ALTER TABLE public.ai_cmo_llm_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_cmo_llm_costs_select" ON public.ai_cmo_llm_costs
  FOR SELECT USING (true);
