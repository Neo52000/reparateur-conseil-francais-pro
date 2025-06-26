
-- Vérifier les politiques existantes et créer seulement celles qui manquent

-- Créer la politique admin pour voir tous les réparateurs (si elle n'existe pas)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'repairers' 
        AND policyname = 'Admins can view all repairers'
    ) THEN
        CREATE POLICY "Admins can view all repairers" 
          ON public.repairers 
          FOR SELECT 
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );
    END IF;
END
$$;

-- Créer la politique admin pour modifier les réparateurs (si elle n'existe pas)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'repairers' 
        AND policyname = 'Admins can update repairers'
    ) THEN
        CREATE POLICY "Admins can update repairers" 
          ON public.repairers 
          FOR UPDATE 
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );
    END IF;
END
$$;

-- S'assurer que RLS est activé sur la table repairers
ALTER TABLE public.repairers ENABLE ROW LEVEL SECURITY;
