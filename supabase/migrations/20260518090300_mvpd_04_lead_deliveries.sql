-- ============================================================================
-- MVP D — Migration 4/7 : lead_deliveries
-- ============================================================================
-- Lien N:N entre issue_requests et repairers, avec suivi de conversion.
-- Chaque ligne représente UN lead distribué à UN réparateur ; le couple
-- (issue_request_id, repairer_id) est unique pour éviter les doublons.
--
-- RLS : le réparateur ne voit que SES leads (via repairers.user_id).
-- ============================================================================

BEGIN;

CREATE TABLE public.lead_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_request_id uuid NOT NULL REFERENCES public.issue_requests(id) ON DELETE CASCADE,
  repairer_id uuid NOT NULL REFERENCES public.repairers(id) ON DELETE CASCADE,
  credits_spent integer NOT NULL DEFAULT 1 CHECK (credits_spent > 0),
  status text NOT NULL DEFAULT 'delivered'
    CHECK (status IN ('delivered', 'contacted', 'converted', 'lost', 'refunded')),
  delivered_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  conversion_value_cents integer,
  notes text,
  UNIQUE (issue_request_id, repairer_id)
);

CREATE INDEX lead_deliveries_repairer_status_idx
  ON public.lead_deliveries(repairer_id, status, delivered_at DESC);

CREATE INDEX lead_deliveries_request_idx
  ON public.lead_deliveries(issue_request_id);

ALTER TABLE public.lead_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lead_deliveries_repairer_select"
  ON public.lead_deliveries FOR SELECT
  TO authenticated
  USING (
    repairer_id IN (
      SELECT id FROM public.repairers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "lead_deliveries_repairer_update"
  ON public.lead_deliveries FOR UPDATE
  TO authenticated
  USING (
    repairer_id IN (
      SELECT id FROM public.repairers WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    repairer_id IN (
      SELECT id FROM public.repairers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "lead_deliveries_admin_all"
  ON public.lead_deliveries FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

COMMIT;
