-- ============================================================================
-- MVP D — Migration 3/7 : issue_requests
-- ============================================================================
-- Demandes émises par les consommateurs (anonymes ou authentifiés).
-- L'insert est ouvert (anon + authenticated) pour supporter le tunnel
-- /diagnostic sans inscription. Le SELECT est restreint à l'admin et au
-- consommateur authentifié (s'il y en a un).
-- ============================================================================

BEGIN;

CREATE TABLE public.issue_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  contact_name text,
  contact_email text,
  contact_phone text,
  postal_code text NOT NULL,
  device_type text,
  brand text,
  model text,
  symptom text NOT NULL,
  diagnosis_ai jsonb,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'awaiting_contact', 'distributed', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  distributed_at timestamptz
);

CREATE INDEX issue_requests_postal_status_idx
  ON public.issue_requests(postal_code, status, created_at DESC);

CREATE INDEX issue_requests_consumer_idx
  ON public.issue_requests(consumer_id)
  WHERE consumer_id IS NOT NULL;

ALTER TABLE public.issue_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "issue_requests_public_insert"
  ON public.issue_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "issue_requests_self_select"
  ON public.issue_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = consumer_id);

CREATE POLICY "issue_requests_self_update"
  ON public.issue_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = consumer_id)
  WITH CHECK (auth.uid() = consumer_id);

CREATE POLICY "issue_requests_admin_all"
  ON public.issue_requests FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

COMMIT;
