
-- Créer la table pour les demandes d'intérêt client
CREATE TABLE public.client_interest_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_profile_id uuid NOT NULL,
  client_email text,
  client_message text,
  client_phone text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  approved_at timestamp with time zone,
  sent_at timestamp with time zone,
  approved_by uuid REFERENCES auth.users(id)
);

-- Ajouter les contraintes et index
ALTER TABLE public.client_interest_requests 
ADD CONSTRAINT client_interest_requests_status_check 
CHECK (status IN ('pending', 'approved', 'sent', 'rejected'));

CREATE INDEX idx_client_interest_requests_status ON public.client_interest_requests(status);
CREATE INDEX idx_client_interest_requests_created_at ON public.client_interest_requests(created_at DESC);

-- Activer RLS
ALTER TABLE public.client_interest_requests ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de créer des demandes
CREATE POLICY "Allow users to create interest requests" 
ON public.client_interest_requests 
FOR INSERT 
WITH CHECK (true);

-- Politique pour permettre aux admins de voir toutes les demandes
CREATE POLICY "Allow admins to view all requests" 
ON public.client_interest_requests 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Politique pour permettre aux admins de modifier les demandes
CREATE POLICY "Allow admins to update requests" 
ON public.client_interest_requests 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
