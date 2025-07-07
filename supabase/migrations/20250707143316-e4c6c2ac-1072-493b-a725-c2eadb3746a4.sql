-- Créer le dossier docs avec les fichiers de base et la table documentation_versions

-- Table pour gérer les versions de documentation
CREATE TABLE IF NOT EXISTS public.documentation_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_type TEXT NOT NULL CHECK (doc_type IN ('prd', 'user-guide', 'technical')),
  version TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  file_size BIGINT NOT NULL,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_documentation_versions_doc_type ON public.documentation_versions(doc_type);
CREATE INDEX IF NOT EXISTS idx_documentation_versions_generated_at ON public.documentation_versions(generated_at DESC);

-- RLS policies
ALTER TABLE public.documentation_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage documentation versions" 
ON public.documentation_versions 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Trigger pour updated_at
CREATE TRIGGER update_documentation_versions_updated_at
  BEFORE UPDATE ON public.documentation_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();