-- Table pour persister les résultats de scraping avant import
CREATE TABLE public.scraping_pending_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  source TEXT DEFAULT 'google_maps',
  ai_model TEXT,
  result_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  imported_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'imported', 'expired', 'cancelled'))
);

-- Index pour les requêtes courantes
CREATE INDEX idx_scraping_pending_user ON public.scraping_pending_results(user_id);
CREATE INDEX idx_scraping_pending_status ON public.scraping_pending_results(status);
CREATE INDEX idx_scraping_pending_expires ON public.scraping_pending_results(expires_at);

-- Enable RLS
ALTER TABLE public.scraping_pending_results ENABLE ROW LEVEL SECURITY;

-- Policies: Les admins peuvent tout voir et gérer
CREATE POLICY "Admins can view all pending results"
  ON public.scraping_pending_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin' 
      AND user_roles.is_active = true
    )
  );

CREATE POLICY "Admins can insert pending results"
  ON public.scraping_pending_results
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin' 
      AND user_roles.is_active = true
    )
  );

CREATE POLICY "Admins can update pending results"
  ON public.scraping_pending_results
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin' 
      AND user_roles.is_active = true
    )
  );

CREATE POLICY "Admins can delete pending results"
  ON public.scraping_pending_results
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin' 
      AND user_roles.is_active = true
    )
  );

-- Fonction pour nettoyer les résultats expirés
CREATE OR REPLACE FUNCTION public.cleanup_expired_scraping_results()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE scraping_pending_results 
  SET status = 'expired' 
  WHERE expires_at < now() AND status = 'pending';
END;
$$;