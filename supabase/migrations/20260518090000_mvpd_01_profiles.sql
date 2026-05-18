-- ============================================================================
-- MVP D — Migration 1/7 : table profiles unifiée (idempotent)
-- ============================================================================
-- Beaucoup de migrations historiques (20250614, 20250630, 20250707, 20250803,
-- 20251024) référencent `public.profiles` avec les colonnes id, email,
-- first_name, last_name, role. La fonction public.handle_new_user()
-- (migration 20250803154717) INSERT dans cette table à la création d'un
-- utilisateur — donc elle est censée exister.
--
-- Pour rester compatible avec ce trigger et avec toutes les policies en
-- aval, on utilise CREATE TABLE IF NOT EXISTS + ALTER conditionnels.
-- On ne fait JAMAIS de DROP — risque trop élevé de perte de données
-- (profils consommateurs déjà créés via /client-auth).
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  first_name text,
  last_name text,
  role text NOT NULL DEFAULT 'user',
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Colonnes potentiellement manquantes (l'ordre des migrations historiques
-- n'est pas garanti) — on les ajoute en idempotent.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Contrainte CHECK ouverte (couvre les valeurs historiques 'user', 'admin'
-- ET les nouvelles 'consumer'/'repairer' utilisées par le MVP D).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('user', 'consumer', 'repairer', 'admin'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop puis recrée nos policies (idempotent — n'écrase pas les anciennes
-- portant d'autres noms).
DROP POLICY IF EXISTS "mvpd_profiles_self_select" ON public.profiles;
DROP POLICY IF EXISTS "mvpd_profiles_self_update" ON public.profiles;
DROP POLICY IF EXISTS "mvpd_profiles_admin_all" ON public.profiles;

CREATE POLICY "mvpd_profiles_self_select"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "mvpd_profiles_self_update"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "mvpd_profiles_admin_all"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Le trigger d'auto-création (public.handle_new_user) existe déjà
-- (cf. 20250803154717). On ne le redéfinit pas pour éviter tout
-- conflit / double exécution.

COMMIT;
