
-- 1) Activer RLS (idempotent)
ALTER TABLE public.suppliers_directory ENABLE ROW LEVEL SECURITY;

-- 2) Valeurs par défaut pour éviter les inserts qui échouent quand ces champs ne sont pas fournis
ALTER TABLE public.suppliers_directory
  ALTER COLUMN brands_sold SET DEFAULT '{}'::text[],
  ALTER COLUMN product_types SET DEFAULT '{}'::text[];

-- 3) Policies RLS complémentaires pour utilisateurs authentifiés (tout en conservant l'accès admin total)
DO $$
BEGIN
  -- INSERT: tout utilisateur authentifié peut créer un fournisseur
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'suppliers_directory'
      AND policyname = 'Authenticated can insert suppliers'
  ) THEN
    CREATE POLICY "Authenticated can insert suppliers"
      ON public.suppliers_directory
      FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;

  -- SELECT: un utilisateur peut voir ses propres fournisseurs
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'suppliers_directory'
      AND policyname = 'Authenticated can select own suppliers'
  ) THEN
    CREATE POLICY "Authenticated can select own suppliers"
      ON public.suppliers_directory
      FOR SELECT
      USING (created_by = auth.uid());
  END IF;

  -- UPDATE: un utilisateur peut modifier ses propres fournisseurs
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'suppliers_directory'
      AND policyname = 'Authenticated can update own suppliers'
  ) THEN
    CREATE POLICY "Authenticated can update own suppliers"
      ON public.suppliers_directory
      FOR UPDATE
      USING (created_by = auth.uid())
      WITH CHECK (created_by = auth.uid());
  END IF;
END
$$;

-- 4) Rappel: la policy Admins full access (suppliers_directory) existe déjà, on la laisse en place.
-- 5) Les triggers set_suppliers_created_by() et bu_suppliers_directory_updated_at existent déjà (créés précédemment).
