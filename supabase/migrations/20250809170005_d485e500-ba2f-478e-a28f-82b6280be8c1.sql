
-- 1) Sécuriser RLS et donner un accès complet aux admins

-- Activer RLS (idempotent, ne casse rien si déjà activé)
ALTER TABLE public.suppliers_directory ENABLE ROW LEVEL SECURITY;

-- Créer la policy admin si elle n'existe pas déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'suppliers_directory'
      AND policyname = 'Admins full access (suppliers_directory)'
  ) THEN
    CREATE POLICY "Admins full access (suppliers_directory)"
      ON public.suppliers_directory
      FOR ALL
      USING (public.get_current_user_role() = 'admin')
      WITH CHECK (public.get_current_user_role() = 'admin');
  END IF;
END
$$;

-- 2) Définir des valeurs par défaut robustes pour éviter des rejets d'INSERT si certains champs manquent
ALTER TABLE public.suppliers_directory
  ALTER COLUMN rating SET DEFAULT 0,
  ALTER COLUMN review_count SET DEFAULT 0,
  ALTER COLUMN is_featured SET DEFAULT false,
  ALTER COLUMN is_verified SET DEFAULT false,
  ALTER COLUMN specialties SET DEFAULT '{}'::text[],
  ALTER COLUMN certifications SET DEFAULT '{}'::text[],
  ALTER COLUMN address SET DEFAULT '{}'::jsonb,
  ALTER COLUMN delivery_info SET DEFAULT '{}'::jsonb,
  ALTER COLUMN status SET DEFAULT 'active';

-- 3) Créer/mettre à jour la fonction de trigger qui renseigne created_by/created_at/updated_at
CREATE OR REPLACE FUNCTION public.set_suppliers_created_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $fn$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;

  IF NEW.created_at IS NULL THEN
    NEW.created_at := now();
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$fn$;

-- 4) Ajouter le trigger BEFORE INSERT pour setter created_by et les timestamps (si pas déjà présent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'public.suppliers_directory'::regclass
      AND tgname = 'bi_suppliers_directory_set_created_by'
  ) THEN
    CREATE TRIGGER bi_suppliers_directory_set_created_by
    BEFORE INSERT ON public.suppliers_directory
    FOR EACH ROW
    EXECUTE FUNCTION public.set_suppliers_created_by();
  END IF;
END
$$;

-- 5) Ajouter le trigger BEFORE UPDATE pour updated_at (utilise la fonction générique déjà existante)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'public.suppliers_directory'::regclass
      AND tgname = 'bu_suppliers_directory_updated_at'
  ) THEN
    CREATE TRIGGER bu_suppliers_directory_updated_at
    BEFORE UPDATE ON public.suppliers_directory
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;

-- 6) S’assurer que les rôles ont les droits d’accès bas niveau (complémentaire aux policies)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers_directory TO authenticated;
