-- Fix RLS policy creation without nested DO blocks
-- Ensure tables and helper function exist (idempotent from previous run)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

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

-- Enable RLS on all CRM tables
ALTER TABLE IF EXISTS public.crm_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.crm_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.crm_deal_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.crm_conversation_links ENABLE ROW LEVEL SECURITY;

-- crm_companies policies
DROP POLICY IF EXISTS select_owner_or_admin ON public.crm_companies;
DROP POLICY IF EXISTS insert_owner_or_admin ON public.crm_companies;
DROP POLICY IF EXISTS update_owner_or_admin ON public.crm_companies;
DROP POLICY IF EXISTS delete_owner_or_admin ON public.crm_companies;
CREATE POLICY select_owner_or_admin ON public.crm_companies FOR SELECT USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY insert_owner_or_admin ON public.crm_companies FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY update_owner_or_admin ON public.crm_companies FOR UPDATE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin') WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY delete_owner_or_admin ON public.crm_companies FOR DELETE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');

-- crm_contacts policies
DROP POLICY IF EXISTS select_owner_or_admin ON public.crm_contacts;
DROP POLICY IF EXISTS insert_owner_or_admin ON public.crm_contacts;
DROP POLICY IF EXISTS update_owner_or_admin ON public.crm_contacts;
DROP POLICY IF EXISTS delete_owner_or_admin ON public.crm_contacts;
CREATE POLICY select_owner_or_admin ON public.crm_contacts FOR SELECT USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY insert_owner_or_admin ON public.crm_contacts FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY update_owner_or_admin ON public.crm_contacts FOR UPDATE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin') WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY delete_owner_or_admin ON public.crm_contacts FOR DELETE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');

-- crm_pipelines policies
DROP POLICY IF EXISTS select_owner_or_admin ON public.crm_pipelines;
DROP POLICY IF EXISTS insert_owner_or_admin ON public.crm_pipelines;
DROP POLICY IF EXISTS update_owner_or_admin ON public.crm_pipelines;
DROP POLICY IF EXISTS delete_owner_or_admin ON public.crm_pipelines;
CREATE POLICY select_owner_or_admin ON public.crm_pipelines FOR SELECT USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY insert_owner_or_admin ON public.crm_pipelines FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY update_owner_or_admin ON public.crm_pipelines FOR UPDATE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin') WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY delete_owner_or_admin ON public.crm_pipelines FOR DELETE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');

-- crm_deal_stages policies
DROP POLICY IF EXISTS select_owner_or_admin ON public.crm_deal_stages;
DROP POLICY IF EXISTS insert_owner_or_admin ON public.crm_deal_stages;
DROP POLICY IF EXISTS update_owner_or_admin ON public.crm_deal_stages;
DROP POLICY IF EXISTS delete_owner_or_admin ON public.crm_deal_stages;
CREATE POLICY select_owner_or_admin ON public.crm_deal_stages FOR SELECT USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY insert_owner_or_admin ON public.crm_deal_stages FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY update_owner_or_admin ON public.crm_deal_stages FOR UPDATE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin') WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY delete_owner_or_admin ON public.crm_deal_stages FOR DELETE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');

-- crm_deals policies
DROP POLICY IF EXISTS select_owner_or_admin ON public.crm_deals;
DROP POLICY IF EXISTS insert_owner_or_admin ON public.crm_deals;
DROP POLICY IF EXISTS update_owner_or_admin ON public.crm_deals;
DROP POLICY IF EXISTS delete_owner_or_admin ON public.crm_deals;
CREATE POLICY select_owner_or_admin ON public.crm_deals FOR SELECT USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY insert_owner_or_admin ON public.crm_deals FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY update_owner_or_admin ON public.crm_deals FOR UPDATE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin') WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY delete_owner_or_admin ON public.crm_deals FOR DELETE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');

-- crm_activities policies
DROP POLICY IF EXISTS select_owner_or_admin ON public.crm_activities;
DROP POLICY IF EXISTS insert_owner_or_admin ON public.crm_activities;
DROP POLICY IF EXISTS update_owner_or_admin ON public.crm_activities;
DROP POLICY IF EXISTS delete_owner_or_admin ON public.crm_activities;
CREATE POLICY select_owner_or_admin ON public.crm_activities FOR SELECT USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY insert_owner_or_admin ON public.crm_activities FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY update_owner_or_admin ON public.crm_activities FOR UPDATE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin') WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY delete_owner_or_admin ON public.crm_activities FOR DELETE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');

-- crm_tasks policies
DROP POLICY IF EXISTS select_owner_or_admin ON public.crm_tasks;
DROP POLICY IF EXISTS insert_owner_or_admin ON public.crm_tasks;
DROP POLICY IF EXISTS update_owner_or_admin ON public.crm_tasks;
DROP POLICY IF EXISTS delete_owner_or_admin ON public.crm_tasks;
CREATE POLICY select_owner_or_admin ON public.crm_tasks FOR SELECT USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY insert_owner_or_admin ON public.crm_tasks FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY update_owner_or_admin ON public.crm_tasks FOR UPDATE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin') WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY delete_owner_or_admin ON public.crm_tasks FOR DELETE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');

-- crm_conversation_links policies
DROP POLICY IF EXISTS select_owner_or_admin ON public.crm_conversation_links;
DROP POLICY IF EXISTS insert_owner_or_admin ON public.crm_conversation_links;
DROP POLICY IF EXISTS update_owner_or_admin ON public.crm_conversation_links;
DROP POLICY IF EXISTS delete_owner_or_admin ON public.crm_conversation_links;
CREATE POLICY select_owner_or_admin ON public.crm_conversation_links FOR SELECT USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY insert_owner_or_admin ON public.crm_conversation_links FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY update_owner_or_admin ON public.crm_conversation_links FOR UPDATE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin') WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');
CREATE POLICY delete_owner_or_admin ON public.crm_conversation_links FOR DELETE USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');