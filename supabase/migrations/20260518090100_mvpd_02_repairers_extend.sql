-- ============================================================================
-- MVP D — Migration 2/7 : extension de la table repairers
-- ============================================================================
-- La table public.repairers existe (créée par 20250614134422) et contient
-- principalement des données scrapées. On ajoute les colonnes du modèle
-- lead-gen MVP D sans toucher aux données existantes.
--
-- Les réparateurs scrapés conservent status NULL/'pending' et credit_balance=0,
-- donc ils ne seront jamais sélectionnés par match-and-distribute (qui filtre
-- sur status='active' AND credit_balance>=1).
-- ============================================================================

BEGIN;

ALTER TABLE public.repairers
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS service_zones text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS qualirepar_certified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS qualirepar_categories text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS credit_balance integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status text
    CHECK (status IN ('pending', 'active', 'suspended')),
  ADD COLUMN IF NOT EXISTS siret text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS photo_url text;

ALTER TABLE public.repairers
  ADD CONSTRAINT repairers_credit_balance_nonneg CHECK (credit_balance >= 0);

CREATE UNIQUE INDEX IF NOT EXISTS repairers_user_id_unique
  ON public.repairers(user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS repairers_service_zones_gin
  ON public.repairers USING gin(service_zones);

CREATE INDEX IF NOT EXISTS repairers_specialties_gin
  ON public.repairers USING gin(specialties);

CREATE INDEX IF NOT EXISTS repairers_services_gin
  ON public.repairers USING gin(services);

CREATE INDEX IF NOT EXISTS repairers_status_active_idx
  ON public.repairers(status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS repairers_active_credits_idx
  ON public.repairers(credit_balance)
  WHERE status = 'active' AND credit_balance > 0;

-- Policy : un réparateur peut lire/MAJ sa propre fiche.
-- La policy "Public can view repairers" existante reste active (SELECT anon).
DROP POLICY IF EXISTS "repairers_self_manage" ON public.repairers;
CREATE POLICY "repairers_self_manage"
  ON public.repairers FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMIT;
