-- Ajouter une table pour les paramètres API des réparateurs
CREATE TABLE public.repairer_api_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_secret_key TEXT,
  resend_api_key TEXT,
  has_buyback_module BOOLEAN DEFAULT FALSE,
  has_police_logbook BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(repairer_id)
);

-- Enable RLS
ALTER TABLE public.repairer_api_settings ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux réparateurs de gérer leurs propres paramètres
CREATE POLICY "Repairers can manage their own API settings" 
ON public.repairer_api_settings 
FOR ALL 
USING (auth.uid() = repairer_id);

-- Politique pour les admins
CREATE POLICY "Admins can manage all API settings" 
ON public.repairer_api_settings 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Trigger pour updated_at
CREATE TRIGGER update_repairer_api_settings_updated_at
    BEFORE UPDATE ON public.repairer_api_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();