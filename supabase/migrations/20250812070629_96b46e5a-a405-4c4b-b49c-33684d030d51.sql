-- Create extension for UUID generation if not present
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Helper function to auto-set owner_id and timestamps
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

-- Companies
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

-- Contacts
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

-- Pipelines
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

-- Deal stages
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

-- Deals
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

-- Activities (chat logs, calls, notes, etc.)
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

-- Tasks
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

-- Conversation links (to external channels)
CREATE TABLE IF NOT EXISTS public.crm_conversation_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  activity_id UUID NOT NULL REFERENCES public.crm_activities(id) ON DELETE CASCADE,
  external_source TEXT,
  external_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crm_conversation_links_owner ON public.crm_conversation_links(owner_id);

-- Enable RLS and policies
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'crm_companies', 'crm_contacts', 'crm_pipelines', 'crm_deal_stages',
    'crm_deals', 'crm_activities', 'crm_tasks', 'crm_conversation_links'
  ]) LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);

    -- Select policy (owner or admin)
    EXECUTE format($p$
      DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = %L AND policyname = 'select_owner_or_admin'
      ) THEN
        CREATE POLICY select_owner_or_admin ON public.%I
        FOR SELECT
        USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
      END IF; END $$; $p$, tbl, tbl);

    -- Insert policy
    EXECUTE format($p$
      DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = %L AND policyname = 'insert_owner_or_admin'
      ) THEN
        CREATE POLICY insert_owner_or_admin ON public.%I
        FOR INSERT
        WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
      END IF; END $$; $p$, tbl, tbl);

    -- Update policy
    EXECUTE format($p$
      DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = %L AND policyname = 'update_owner_or_admin'
      ) THEN
        CREATE POLICY update_owner_or_admin ON public.%I
        FOR UPDATE
        USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin')
        WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
      END IF; END $$; $p$, tbl, tbl);

    -- Delete policy
    EXECUTE format($p$
      DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = %L AND policyname = 'delete_owner_or_admin'
      ) THEN
        CREATE POLICY delete_owner_or_admin ON public.%I
        FOR DELETE
        USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
      END IF; END $$; $p$, tbl, tbl);
  END LOOP;
END $$;
