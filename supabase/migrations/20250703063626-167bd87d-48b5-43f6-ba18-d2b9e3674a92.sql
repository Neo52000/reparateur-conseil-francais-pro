
-- Créer la table documentation_versions pour stocker l'historique des versions
CREATE TABLE public.documentation_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('prd', 'user-guide', 'technical')),
  version TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  file_size INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter les politiques RLS
ALTER TABLE public.documentation_versions ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent gérer les versions de documentation
CREATE POLICY "Only admins can manage documentation versions"
ON public.documentation_versions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Créer un trigger pour mettre à jour updated_at
CREATE TRIGGER update_documentation_versions_updated_at
  BEFORE UPDATE ON public.documentation_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Créer un index pour optimiser les requêtes
CREATE INDEX idx_documentation_versions_doc_type ON public.documentation_versions(doc_type);
CREATE INDEX idx_documentation_versions_generated_at ON public.documentation_versions(generated_at DESC);
