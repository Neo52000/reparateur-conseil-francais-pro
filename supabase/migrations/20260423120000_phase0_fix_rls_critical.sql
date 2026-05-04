-- ============================================================================
-- Phase 0 — Corrections RLS critiques (D1, D2, D5)
-- Réf. audit sécurité mars 2026 (score 3/10)
-- ============================================================================
-- Objectif : remplacer les politiques `USING (true)` et `OR true` qui exposent
-- les tables de paiements et de souscriptions à la lecture/écriture publique.
--
-- Rollback : voir bloc rollback commenté en fin de fichier.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper : fonction public.is_admin(uuid)
-- STABLE + SECURITY DEFINER pour usage direct dans les policies RLS.
-- ----------------------------------------------------------------------------
-- NOTE : la prod techrepair utilise public.user_roles(user_id, role, is_active)
-- — pas une colonne `role` dans `profiles` comme la migration originale supposait.
-- Cf. cohérence avec les Edge Functions qui appellent public.has_role() RPC.
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = is_admin.user_id
      AND ur.role = 'admin'
      AND COALESCE(ur.is_active, true) = true
  );
$$;

COMMENT ON FUNCTION public.is_admin(uuid) IS
  'Retourne true si user_roles.role = admin et is_active. Utilisé dans les policies RLS.';

-- ----------------------------------------------------------------------------
-- D1 — public.payments : remplacer "Edge functions can manage payments" USING(true)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Edge functions can manage payments" ON public.payments;
DROP POLICY IF EXISTS "payments_owner_access" ON public.payments;

CREATE POLICY "payments_owner_access"
  ON public.payments
  FOR ALL
  USING (
    auth.uid() = client_id
    OR auth.uid() = repairer_id
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    auth.uid() = client_id
    OR auth.uid() = repairer_id
    OR public.is_admin(auth.uid())
  );

-- ----------------------------------------------------------------------------
-- D2 — public.secure_payments : remplacer "System can manage payments" USING(true) WITH CHECK(true)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "System can manage payments" ON public.secure_payments;
DROP POLICY IF EXISTS "Users can view their own payments" ON public.secure_payments;
DROP POLICY IF EXISTS "System can create payments" ON public.secure_payments;
DROP POLICY IF EXISTS "secure_payments_owner_access" ON public.secure_payments;

CREATE POLICY "secure_payments_owner_access"
  ON public.secure_payments
  FOR ALL
  USING (
    auth.uid() = client_id
    OR auth.uid() = repairer_id
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    auth.uid() = client_id
    OR auth.uid() = repairer_id
    OR public.is_admin(auth.uid())
  );

-- ----------------------------------------------------------------------------
-- D5 — public.repairer_subscriptions : remplacer USING (user_id = auth.uid() OR true)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "repairer_subscriptions_select" ON public.repairer_subscriptions;

CREATE POLICY "repairer_subscriptions_select"
  ON public.repairer_subscriptions
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

-- ============================================================================
-- Validation manuelle après application :
--
--   -- unauthenticated MUST raise permission denied / 0 rows :
--   SET ROLE anon;
--   SELECT count(*) FROM public.payments;          -- attendu : 0
--   SELECT count(*) FROM public.secure_payments;   -- attendu : 0
--   SELECT count(*) FROM public.repairer_subscriptions; -- attendu : 0
--   RESET ROLE;
-- ============================================================================

-- ============================================================================
-- ROLLBACK (à exécuter manuellement uniquement en cas de régression bloquante) :
--
--   DROP POLICY IF EXISTS "payments_owner_access"         ON public.payments;
--   DROP POLICY IF EXISTS "secure_payments_owner_access"  ON public.secure_payments;
--   DROP POLICY IF EXISTS "repairer_subscriptions_select" ON public.repairer_subscriptions;
--   -- NE PAS restaurer les anciennes policies USING(true) / OR true :
--   -- elles ont été supprimées pour cause de vuln data-leak.
-- ============================================================================
