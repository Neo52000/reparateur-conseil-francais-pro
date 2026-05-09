-- ============================================================================
-- Tests pgTAP : RLS sur public.repairers_public (vue publique sans données sensibles)
-- Réf : audit AUDIT_20260507 P0 #6 + migration 20250829094420 (création de la vue)
--
-- La vue expose uniquement (id, name, city, postal_code, services, rating,
-- review_count, is_verified, lat, lng, created_at) et est filtrée par
-- WHERE is_active = true. SELECT autorisé pour anon + authenticated.
--
-- Exécution :
--   supabase test db
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA tests CASCADE;
SELECT plan(6);

-- ----- Setup -----------------------------------------------------------------

CREATE OR REPLACE FUNCTION tests.repairers_public_test_setup() RETURNS void AS $$
BEGIN
  -- Un réparateur actif (visible) et un inactif (masqué).
  INSERT INTO public.repairers (id, name, city, postal_code, services, rating, review_count, is_verified, is_active, created_at)
  VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Active Repair', 'Paris', '75001', ARRAY['screen']::text[], 4.5, 12, true, true, now()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Inactive Repair', 'Lyon', '69001', ARRAY['battery']::text[], 3.0, 0, false, false, now())
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

SELECT tests.repairers_public_test_setup();

CREATE OR REPLACE FUNCTION tests.set_anon() RETURNS void AS $$
BEGIN
  PERFORM set_config('role', 'anon', true);
  PERFORM set_config('request.jwt.claim.sub', '', true);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION tests.set_uid(p_uid uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.sub', p_uid::text, true);
END;
$$ LANGUAGE plpgsql;

-- ----- Tests ----------------------------------------------------------------

-- 1. Anonyme peut SELECT sur la vue.
SELECT tests.set_anon();
SELECT is(
  (SELECT count(*)::int FROM public.repairers_public WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  1,
  'anonyme peut SELECT le réparateur actif via la vue publique'
);

-- 2. Le réparateur inactif est masqué (filtre WHERE is_active = true).
SELECT is(
  (SELECT count(*)::int FROM public.repairers_public WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  0,
  'la vue ne renvoie pas les réparateurs is_active = false'
);

-- 3. Authentifié peut SELECT.
SELECT tests.set_uid('00000000-0000-0000-0000-00000000aaaa');
SELECT is(
  (SELECT count(*)::int FROM public.repairers_public WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  1,
  'authentifié peut SELECT via la vue publique'
);

-- 4. Anonyme ne peut PAS INSÉRER directement dans la table sous-jacente.
SELECT tests.set_anon();
SELECT throws_ok(
  $$ INSERT INTO public.repairers (id, name, city, postal_code, is_active)
     VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Hacker', 'Marseille', '13001', true) $$,
  '42501',
  NULL,
  'anonyme ne peut pas INSERT dans public.repairers (RLS)'
);

-- 5. Anonyme ne peut PAS UPDATE.
SELECT throws_ok(
  $$ UPDATE public.repairers SET name = 'Pwned' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  '42501',
  NULL,
  'anonyme ne peut pas UPDATE public.repairers (RLS)'
);

-- 6. Anonyme ne peut PAS DELETE.
SELECT throws_ok(
  $$ DELETE FROM public.repairers WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  '42501',
  NULL,
  'anonyme ne peut pas DELETE public.repairers (RLS)'
);

-- ----- Cleanup --------------------------------------------------------------
SELECT * FROM finish();
ROLLBACK;
