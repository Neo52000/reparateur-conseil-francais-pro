-- ============================================================================
-- MVP D — Migration 5/7 : credit_transactions + RPCs atomiques
-- ============================================================================
-- Wallet de crédits pour les réparateurs.
-- - debit_credits  : UPDATE conditionnel atomique ; renvoie NULL si solde
--                    insuffisant (pas besoin de SELECT FOR UPDATE).
-- - credit_credits : ajout idempotent par stripe_session_id.
--
-- Les RPCs sont SECURITY DEFINER pour pouvoir écrire sur des tables que
-- l'appelant n'a pas le droit d'INSERTer directement (RLS sécurisée).
-- ============================================================================

BEGIN;

CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id uuid NOT NULL REFERENCES public.repairers(id) ON DELETE CASCADE,
  delta integer NOT NULL,
  kind text NOT NULL CHECK (kind IN ('purchase', 'spend', 'refund', 'grant')),
  stripe_session_id text,
  lead_delivery_id uuid REFERENCES public.lead_deliveries(id) ON DELETE SET NULL,
  balance_after integer NOT NULL CHECK (balance_after >= 0),
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (stripe_session_id)
);

CREATE INDEX credit_transactions_repairer_idx
  ON public.credit_transactions(repairer_id, created_at DESC);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credit_transactions_repairer_select"
  ON public.credit_transactions FOR SELECT
  TO authenticated
  USING (
    repairer_id IN (
      SELECT id FROM public.repairers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "credit_transactions_admin_all"
  ON public.credit_transactions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- RPC debit_credits : débite atomiquement si le solde suffit.
-- Retourne le nouveau solde, ou NULL si insuffisant.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.debit_credits(
  p_repairer uuid,
  p_amount integer,
  p_lead uuid DEFAULT NULL
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance integer;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'debit_credits: p_amount must be > 0';
  END IF;

  UPDATE public.repairers
  SET credit_balance = credit_balance - p_amount
  WHERE id = p_repairer
    AND credit_balance >= p_amount
  RETURNING credit_balance INTO v_new_balance;

  IF v_new_balance IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.credit_transactions (
    repairer_id, delta, kind, lead_delivery_id, balance_after
  ) VALUES (
    p_repairer, -p_amount, 'spend', p_lead, v_new_balance
  );

  RETURN v_new_balance;
END;
$$;

-- ---------------------------------------------------------------------------
-- RPC credit_credits : crédite le wallet de manière idempotente.
-- Si une transaction avec le même stripe_session_id existe déjà, no-op.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.credit_credits(
  p_repairer uuid,
  p_amount integer,
  p_session text,
  p_kind text DEFAULT 'purchase'
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance integer;
  v_existing uuid;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'credit_credits: p_amount must be > 0';
  END IF;
  IF p_kind NOT IN ('purchase', 'refund', 'grant') THEN
    RAISE EXCEPTION 'credit_credits: invalid kind %', p_kind;
  END IF;

  -- Idempotence sur stripe_session_id (NULL accepté pour les grants manuels).
  IF p_session IS NOT NULL THEN
    SELECT id INTO v_existing
    FROM public.credit_transactions
    WHERE stripe_session_id = p_session
    LIMIT 1;
    IF v_existing IS NOT NULL THEN
      SELECT credit_balance INTO v_new_balance
      FROM public.repairers WHERE id = p_repairer;
      RETURN v_new_balance;
    END IF;
  END IF;

  UPDATE public.repairers
  SET credit_balance = credit_balance + p_amount
  WHERE id = p_repairer
  RETURNING credit_balance INTO v_new_balance;

  IF v_new_balance IS NULL THEN
    RAISE EXCEPTION 'credit_credits: repairer % not found', p_repairer;
  END IF;

  INSERT INTO public.credit_transactions (
    repairer_id, delta, kind, stripe_session_id, balance_after
  ) VALUES (
    p_repairer, p_amount, p_kind, p_session, v_new_balance
  );

  RETURN v_new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.debit_credits(uuid, integer, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.credit_credits(uuid, integer, text, text) FROM PUBLIC;

COMMIT;
