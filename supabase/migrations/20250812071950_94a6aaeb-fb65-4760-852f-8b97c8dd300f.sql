-- Full CRM schema setup (tables, triggers, RLS)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Helper function
CREATE OR REPLACE FUNCTION public.set_owner_and_timestamps()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF NEW.owner_id IS NULL THEN
    NEW.owner_id := auth.uid();
  END IF;
  IF NEW.created_at IS NULL THEN
    NEW.created_at := now();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- 1) Tables
CREATE TABLE IF NOT EXISTS public.crm_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  domain TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crm_companies_owner ON public.crm_companies(owner_id);
CREATE TRIGGER trg_crm_companies_defaults
BEFORE INSERT OR UPDATE ON public.crm_companies
FOR EACH ROW EXECUTE FUNCTION public.set_owner_and_timestamps();

CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  company_id UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  email TEXT,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  gdpr_consent BOOLEAN NOT NULL DEFAULT false,
  origin TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_owner ON public.crm_contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON public.crm_contacts(email);
CREATE TRIGGER trg_crm_contacts_defaults
BEFORE INSERT OR UPDATE ON public.crm_contacts
FOR EACH ROW EXECUTE FUNCTION public.set_owner_and_timestamps();

CREATE TABLE IF NOT EXISTS public.crm_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crm_pipelines_owner ON public.crm_pipelines(owner_id);
CREATE TRIGGER trg_crm_pipelines_defaults
BEFORE INSERT OR UPDATE ON public.crm_pipelines
FOR EACH ROW EXECUTE FUNCTION public.set_owner_and_timestamps();

CREATE TABLE IF NOT EXISTS public.crm_deal_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  pipeline_id UUID REFERENCES public.crm_pipelines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crm_deal_stages_owner ON public.crm_deal_stages(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_deal_stages_pipeline ON public.crm_deal_stages(pipeline_id);
CREATE TRIGGER trg_crm_deal_stages_defaults
BEFORE INSERT OR UPDATE ON public.crm_deal_stages
FOR EACH ROW EXECUTE FUNCTION public.set_owner_and_timestamps();

CREATE TABLE IF NOT EXISTS public.crm_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  pipeline_id UUID REFERENCES public.crm_pipelines(id) ON DELETE SET NULL,
  stage_id UUID REFERENCES public.crm_deal_stages(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  amount NUMERIC(12,2),
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'open',
  source TEXT,
  expected_close_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crm_deals_owner ON public.crm_deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON public.crm_deals(stage_id);
CREATE TRIGGER trg_crm_deals_defaults
BEFORE INSERT OR UPDATE ON public.crm_deals
FOR EACH ROW EXECUTE FUNCTION public.set_owner_and_timestamps();

CREATE TABLE IF NOT EXISTS public.crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.crm_deals(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL DEFAULT 'chat',
  direction TEXT,
  intent TEXT,
  confidence NUMERIC,
  entities JSONB,
  message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crm_activities_owner ON public.crm_activities(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_created ON public.crm_activities(created_at);
CREATE TRIGGER trg_crm_activities_defaults
BEFORE INSERT OR UPDATE ON public.crm_activities
FOR EACH ROW EXECUTE FUNCTION public.set_owner_and_timestamps();

CREATE TABLE IF NOT EXISTS public.crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'normal',
  due_date TIMESTAMPTZ,
  related_type TEXT,
  related_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_owner ON public.crm_tasks(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_due ON public.crm_tasks(due_date);
CREATE TRIGGER trg_crm_tasks_defaults
BEFORE INSERT OR UPDATE ON public.crm_tasks
FOR EACH ROW EXECUTE FUNCTION public.set_owner_and_timestamps();

CREATE TABLE IF NOT EXISTS public.crm_conversation_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  activity_id UUID NOT NULL REFERENCES public.crm_activities(id) ON DELETE CASCADE,
  external_source TEXT,
  external_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crm_conversation_links_owner ON public.crm_conversation_links(owner_id);

-- 2) RLS enable and policies
ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_deal_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_conversation_links ENABLE ROW LEVEL SECURITY;

-- crm_companies
DROP POLICY IF EXISTS select_owner_or_admin ON public.crm_companies;
DROP POLICY IF EXISTS insert_owner_or_admin ON public.crm_companies;
DROP POLICY IF EXISTS update_owner_or_admin ON public.crm_companies;
DROP POLICY IF EXISTS delete_owner_or_admin ON public.crm_companies;
CREATE POLICY select_owner_or_admin ON public.crm_companies FOR SELECT USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY insert_owner_or_admin ON public.crm_companies FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY update_owner_or_admin ON public.crm_companies FOR UPDATE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin') WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY delete_owner_or_admin ON public.crm_companies FOR DELETE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');

-- crm_contacts
DROP POLICY IF EXISTS select_owner_or_admin ON public.crm_contacts;
DROP POLICY IF EXISTS insert_owner_or_admin ON public.crm_contacts;
DROP POLICY IF EXISTS update_owner_or_admin ON public.crm_contacts;
DROP POLICY IF EXISTS delete_owner_or_admin ON public.crm_contacts;
CREATE POLICY select_owner_or_admin ON public.crm_contacts FOR SELECT USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY insert_owner_or_admin ON public.crm_contacts FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY update_owner_or_admin ON public.crm_contacts FOR UPDATE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin') WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY delete_owner_or_admin ON public.crm_contacts FOR DELETE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');

-- crm_pipelines
DROP POLICY IF EXISTS select_owner_or_admin ON public.crm_pipelines;
DROP POLICY IF EXISTS insert_owner_or_admin ON public.crm_pipelines;
DROP POLICY IF EXISTS update_owner_or_admin ON public.crm_pipelines;
DROP POLICY IF EXISTS delete_owner_or_admin ON public.crm_pipelines;
CREATE POLICY select_owner_or_admin ON public.crm_pipelines FOR SELECT USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY insert_owner_or_admin ON public.crm_pipelines FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY update_owner_or_admin ON public.crm_pipelines FOR UPDATE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin') WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY delete_owner_or_admin ON public.crm_pipelines FOR DELETE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');

-- crm_deal_stages
DROP POLICY IF EXISTS select_owner_or_admin ON public.crm_deal_stages;
DROP POLICY IF EXISTS insert_owner_or_admin ON public.crm_deal_stages;
DROP POLICY IF EXISTS update_owner_or_admin ON public.crm_deal_stages;
DROP POLICY IF EXISTS delete_owner_or_admin ON public.crm_deal_stages;
CREATE POLICY select_owner_or_admin ON public.crm_deal_stages FOR SELECT USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY insert_owner_or_admin ON public.crm_deal_stages FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY update_owner_or_admin ON public.crm_deal_stages FOR UPDATE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin') WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY delete_owner_or_admin ON public.crm_deal_stages FOR DELETE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');

-- crm_deals
DROP POLICY IF EXISTS select_owner_or_admin ON public.crm_deals;
DROP POLICY IF EXISTS insert_owner_or_admin ON public.crm_deals;
DROP POLICY IF EXISTS update_owner_or_admin ON public.crm_deals;
DROP POLICY IF EXISTS delete_owner_or_admin ON public.crm_deals;
CREATE POLICY select_owner_or_admin ON public.crm_deals FOR SELECT USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY insert_owner_or_admin ON public.crm_deals FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY update_owner_or_admin ON public.crm_deals FOR UPDATE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin') WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY delete_owner_or_admin ON public.crm_deals FOR DELETE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');

-- crm_activities
DROP POLICY IF EXISTS select_owner_or_admin ON public.crm_activities;
DROP POLICY IF EXISTS insert_owner_or_admin ON public.crm_activities;
DROP POLICY IF EXISTS update_owner_or_admin ON public.crm_activities;
DROP POLICY IF EXISTS delete_owner_or_admin ON public.crm_activities;
CREATE POLICY select_owner_or_admin ON public.crm_activities FOR SELECT USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY insert_owner_or_admin ON public.crm_activities FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY update_owner_or_admin ON public.crm_activities FOR UPDATE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin') WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY delete_owner_or_admin ON public.crm_activities FOR DELETE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');

-- crm_tasks
DROP POLICY IF EXISTS select_owner_or_admin ON public.crm_tasks;
DROP POLICY IF EXISTS insert_owner_or_admin ON public.crm_tasks;
DROP POLICY IF EXISTS update_owner_or_admin ON public.crm_tasks;
DROP POLICY IF EXISTS delete_owner_or_admin ON public.crm_tasks;
CREATE POLICY select_owner_or_admin ON public.crm_tasks FOR SELECT USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY insert_owner_or_admin ON public.crm_tasks FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY update_owner_or_admin ON public.crm_tasks FOR UPDATE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin') WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY delete_owner_or_admin ON public.crm_tasks FOR DELETE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');

-- crm_conversation_links
DROP POLICY IF EXISTS select_owner_or_admin ON public.crm_conversation_links;
DROP POLICY IF EXISTS insert_owner_or_admin ON public.crm_conversation_links;
DROP POLICY IF EXISTS update_owner_or_admin ON public.crm_conversation_links;
DROP POLICY IF EXISTS delete_owner_or_admin ON public.crm_conversation_links;
CREATE POLICY select_owner_or_admin ON public.crm_conversation_links FOR SELECT USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY insert_owner_or_admin ON public.crm_conversation_links FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY update_owner_or_admin ON public.crm_conversation_links FOR UPDATE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin') WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY delete_owner_or_admin ON public.crm_conversation_links FOR DELETE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');