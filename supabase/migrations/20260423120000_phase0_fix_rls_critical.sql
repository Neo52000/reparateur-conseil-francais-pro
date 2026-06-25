-- ============================================================================
-- Phase 0 — Corrections RLS critiques (D1, D5)
-- Réf. audit sécurité mars 2026 (score 3/10)
-- Appliqué en prod techrepair le 2026-05-04 via Studio SQL Editor
-- (CLI désync impossible, cf. PRODUCTION_CHECKLIST.md).
-- ============================================================================
-- Objectif : remplacer les politiques `USING (true)` et `OR true` qui exposent
-- les tables de paiements et de souscriptions à la lecture/écriture publique.
--
-- Adaptations vs version originale :
-- - is_admin() interroge user_roles (pas profiles.role qui n'existe pas).
-- - D2 secure_payments retiré (table inexistante en prod techrepair).
-- - DO block adaptatif : détecte les vrais noms de colonnes (anglais en
--   prod ; Studio les affiche traduits en français).
-- ============================================================================

DO $$
DECLARE
  v_repairer_col text;
  v_client_col text;
  v_user_col text;
BEGIN
  -- Helper : public.is_admin(uuid)
  -- STABLE + SECURITY DEFINER pour usage direct dans les policies RLS.
  -- Lit public.user_roles (cohérent avec public.has_role() utilisée par les Edge Functions).
  CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
  RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER
  SET search_path = public
  AS $func$
    SELECT EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = is_admin.user_id
        AND ur.role = 'admin'
        AND COALESCE(ur.is_active, true) = true
    );
  $func$;

  COMMENT ON FUNCTION public.is_admin(uuid) IS
    'Phase 0 : true si user_roles.role = admin et is_active. Pour policies RLS.';

  -- D1 — public.payments : remplacer "Edge functions can manage payments" USING(true)
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='payments') THEN

    SELECT column_name INTO v_repairer_col
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='payments'
      AND column_name IN ('repairer_id', 'réparateur_id', 'reparateur_id')
    LIMIT 1;

    SELECT column_name INTO v_client_col
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='payments'
      AND column_name = 'client_id'
    LIMIT 1;

    IF v_repairer_col IS NOT NULL AND v_client_col IS NOT NULL THEN
      EXECUTE 'DROP POLICY IF EXISTS "Edge functions can manage payments" ON public.payments';
      EXECUTE 'DROP POLICY IF EXISTS "payments_owner_access" ON public.payments';
      EXECUTE format(
        'CREATE POLICY "payments_owner_access" ON public.payments FOR ALL
         USING (auth.uid() = %I OR auth.uid() = %I OR public.is_admin(auth.uid()))
         WITH CHECK (auth.uid() = %I OR auth.uid() = %I OR public.is_admin(auth.uid()))',
        v_client_col, v_repairer_col, v_client_col, v_repairer_col
      );
      RAISE NOTICE 'D1 OK — payments policy created';
    ELSE
      RAISE NOTICE 'D1 SKIPPED — payments columns not found';
    END IF;
  ELSE
    RAISE NOTICE 'D1 SKIPPED — public.payments does not exist';
  END IF;

  -- D2 — public.secure_payments : table inexistante en prod techrepair (vérifié 2026-05-04).
  -- Bloc conservé pour le cas où elle existerait dans une autre instance Supabase.
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='secure_payments') THEN

    SELECT column_name INTO v_repairer_col
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='secure_payments'
      AND column_name IN ('repairer_id', 'réparateur_id', 'reparateur_id')
    LIMIT 1;

    SELECT column_name INTO v_client_col
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='secure_payments'
      AND column_name = 'client_id'
    LIMIT 1;

    IF v_repairer_col IS NOT NULL AND v_client_col IS NOT NULL THEN
      EXECUTE 'DROP POLICY IF EXISTS "System can manage payments" ON public.secure_payments';
      EXECUTE 'DROP POLICY IF EXISTS "Users can view their own payments" ON public.secure_payments';
      EXECUTE 'DROP POLICY IF EXISTS "System can create payments" ON public.secure_payments';
      EXECUTE 'DROP POLICY IF EXISTS "secure_payments_owner_access" ON public.secure_payments';
      EXECUTE format(
        'CREATE POLICY "secure_payments_owner_access" ON public.secure_payments FOR ALL
         USING (auth.uid() = %I OR auth.uid() = %I OR public.is_admin(auth.uid()))
         WITH CHECK (auth.uid() = %I OR auth.uid() = %I OR public.is_admin(auth.uid()))',
        v_client_col, v_repairer_col, v_client_col, v_repairer_col
      );
      RAISE NOTICE 'D2 OK — secure_payments policy created';
    END IF;
  END IF;

  -- D5 — public.repairer_subscriptions : remplacer USING (user_id = auth.uid() OR true)
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='repairer_subscriptions') THEN

    SELECT column_name INTO v_user_col
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='repairer_subscriptions'
      AND column_name IN ('user_id', 'utilisateur_id')
    LIMIT 1;

    IF v_user_col IS NOT NULL THEN
      EXECUTE 'DROP POLICY IF EXISTS "repairer_subscriptions_select" ON public.repairer_subscriptions';
      EXECUTE format(
        'CREATE POLICY "repairer_subscriptions_select" ON public.repairer_subscriptions FOR SELECT
         USING (%I = auth.uid() OR public.is_admin(auth.uid()))',
        v_user_col
      );
      RAISE NOTICE 'D5 OK — repairer_subscriptions policy created';
    ELSE
      RAISE NOTICE 'D5 SKIPPED — repairer_subscriptions user column not found';
    END IF;
  ELSE
    RAISE NOTICE 'D5 SKIPPED — public.repairer_subscriptions does not exist';
  END IF;
END $$;

-- ============================================================================
-- Validation manuelle après application :
--
--   SELECT tablename, policyname FROM pg_policies
--   WHERE policyname IN ('payments_owner_access',
--                        'secure_payments_owner_access',
--                        'repairer_subscriptions_select');
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
