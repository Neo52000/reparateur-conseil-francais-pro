-- ============================================================================
-- Tests pgTAP : RLS sur public.payments
-- Réf : audit AUDIT_20260507 P0 #6 + migration 20260423120000_phase0_fix_rls_critical.sql
--
-- Politique testée : payments_owner_access (FOR ALL)
--   USING       : auth.uid() = client_id OR auth.uid() = repairer_id OR is_admin(auth.uid())
--   WITH CHECK  : pareil
--
-- Exécution :
--   supabase test db
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA tests CASCADE;
SELECT plan(7);

-- ----- Setup -----------------------------------------------------------------
-- Trois utilisateurs : un client, un réparateur, un tiers (ni l'un ni l'autre).
-- Et un admin via user_roles pour vérifier le bypass.

CREATE OR REPLACE FUNCTION tests.payments_test_setup() RETURNS void AS $$
DECLARE
  v_client_id uuid := '00000000-0000-0000-0000-00000000c001';
  v_repairer_id uuid := '00000000-0000-0000-0000-00000000a001';
  v_other_id uuid := '00000000-0000-0000-0000-00000000d001';
  v_admin_id uuid := '00000000-0000-0000-0000-00000000aaaa';
BEGIN
  -- Création des comptes auth (best-effort : Supabase gère normalement la table auth.users).
  -- Si la table n'est pas exposée, on simule en insérant directement dans user_roles.
  INSERT INTO public.user_roles (user_id, role, is_active)
  VALUES (v_admin_id, 'admin', true)
  ON CONFLICT DO NOTHING;

  -- Une ligne payments pour le couple client/réparateur ci-dessus.
  INSERT INTO public.payments (id, client_id, repairer_id, amount, status, created_at)
  VALUES ('11111111-1111-1111-1111-111111111111', v_client_id, v_repairer_id, 5000, 'pending', now())
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

SELECT tests.payments_test_setup();

-- ----- Helper : exécuter en tant qu'utilisateur ------------------------------
-- Supabase pose `auth.uid()` à partir de `request.jwt.claim.sub`.
CREATE OR REPLACE FUNCTION tests.set_uid(p_uid uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.sub', p_uid::text, true);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION tests.set_anon() RETURNS void AS $$
BEGIN
  PERFORM set_config('role', 'anon', true);
  PERFORM set_config('request.jwt.claim.sub', '', true);
END;
$$ LANGUAGE plpgsql;

-- ----- Tests ----------------------------------------------------------------

-- 1. Le client owner voit son payment.
SELECT tests.set_uid('00000000-0000-0000-0000-00000000c001');
SELECT is(
  (SELECT count(*)::int FROM public.payments WHERE id = '11111111-1111-1111-1111-111111111111'),
  1,
  'le client owner voit son payment'
);

-- 2. Le réparateur owner voit son payment.
SELECT tests.set_uid('00000000-0000-0000-0000-00000000a001');
SELECT is(
  (SELECT count(*)::int FROM public.payments WHERE id = '11111111-1111-1111-1111-111111111111'),
  1,
  'le réparateur owner voit son payment'
);

-- 3. Un tiers (ni client, ni réparateur, ni admin) ne voit RIEN.
SELECT tests.set_uid('00000000-0000-0000-0000-00000000d001');
SELECT is(
  (SELECT count(*)::int FROM public.payments WHERE id = '11111111-1111-1111-1111-111111111111'),
  0,
  'un tiers non-owner ne voit pas le payment'
);

-- 4. Un utilisateur anonyme ne voit RIEN.
SELECT tests.set_anon();
SELECT is(
  (SELECT count(*)::int FROM public.payments),
  0,
  'un utilisateur anonyme ne voit aucun payment'
);

-- 5. Un admin voit le payment, même sans être owner.
SELECT tests.set_uid('00000000-0000-0000-0000-00000000aaaa');
SELECT is(
  (SELECT count(*)::int FROM public.payments WHERE id = '11111111-1111-1111-1111-111111111111'),
  1,
  'un admin voit le payment sans être owner'
);

-- 6. Un tiers ne peut pas INSÉRER un payment où il n'est ni client ni repairer.
SELECT tests.set_uid('00000000-0000-0000-0000-00000000d001');
SELECT throws_ok(
  $$ INSERT INTO public.payments (id, client_id, repairer_id, amount, status, created_at)
     VALUES ('22222222-2222-2222-2222-222222222222',
             '00000000-0000-0000-0000-00000000c001',
             '00000000-0000-0000-0000-00000000a001',
             1000, 'pending', now()) $$,
  '42501',
  NULL,
  'un tiers ne peut pas insérer un payment pour autrui (RLS WITH CHECK)'
);

-- 7. Le client peut INSÉRER un payment où il est lui-même client.
SELECT tests.set_uid('00000000-0000-0000-0000-00000000c001');
SELECT lives_ok(
  $$ INSERT INTO public.payments (id, client_id, repairer_id, amount, status, created_at)
     VALUES ('33333333-3333-3333-3333-333333333333',
             '00000000-0000-0000-0000-00000000c001',
             '00000000-0000-0000-0000-00000000a001',
             2000, 'pending', now()) $$,
  'le client peut insérer un payment où il est lui-même client'
);

-- ----- Cleanup --------------------------------------------------------------
SELECT * FROM finish();
ROLLBACK;
