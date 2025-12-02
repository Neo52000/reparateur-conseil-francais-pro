-- Créer la table pour historiser les consentements RGPD
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL CHECK (consent_type IN ('marketing', 'newsletter', 'analytics', 'terms', 'cookies', 'sms')),
  consented BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_user_consents_user_id ON public.user_consents(user_id);
CREATE INDEX idx_user_consents_type ON public.user_consents(consent_type);
CREATE INDEX idx_user_consents_created_at ON public.user_consents(created_at DESC);

-- Activer RLS
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir leur propre historique de consentements
CREATE POLICY "Users can view own consents"
ON public.user_consents
FOR SELECT
USING (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent créer leurs propres consentements
CREATE POLICY "Users can create own consents"
ON public.user_consents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Politique: Les admins peuvent tout voir
CREATE POLICY "Admins can view all consents"
ON public.user_consents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Commentaires pour documentation
COMMENT ON TABLE public.user_consents IS 'Historique des consentements RGPD des utilisateurs';
COMMENT ON COLUMN public.user_consents.consent_type IS 'Type de consentement: marketing, newsletter, analytics, terms, cookies, sms';
COMMENT ON COLUMN public.user_consents.consented IS 'true si l''utilisateur a consenti, false s''il a refusé';
COMMENT ON COLUMN public.user_consents.metadata IS 'Métadonnées additionnelles (source, version des CGU, etc.)';