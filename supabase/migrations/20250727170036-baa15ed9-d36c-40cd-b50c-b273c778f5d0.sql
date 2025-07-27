-- Créer la table de configuration du footer
CREATE TABLE public.footer_configuration (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  links JSONB DEFAULT '[]'::JSONB,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.footer_configuration ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active footer config" 
ON public.footer_configuration 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage footer config" 
ON public.footer_configuration 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Add trigger for updated_at
CREATE TRIGGER update_footer_configuration_updated_at
BEFORE UPDATE ON public.footer_configuration
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default footer configuration
INSERT INTO public.footer_configuration (section_key, title, content, links, display_order) VALUES
('company_info', 'TopRéparateurs.fr', 'La plateforme de référence pour trouver un réparateur de confiance près de chez vous. Comparez les prix, consultez les avis et prenez rendez-vous en ligne.', '[]'::JSONB, 1),
('services', 'Nos Services', 'Découvrez tous nos services de réparation avec des professionnels qualifiés et certifiés.', '[
  {"title": "Réparation Smartphone", "url": "/reparation-smartphone"},
  {"title": "Réparation Tablette", "url": "/reparation-tablette"}, 
  {"title": "Réparation Ordinateur", "url": "/reparation-ordinateur"},
  {"title": "Réparation Console", "url": "/reparation-console"}
]'::JSONB, 2),
('support', 'Support', 'Besoin d''aide ? Notre équipe est là pour vous accompagner.', '[
  {"title": "Centre d''aide", "url": "/aide"},
  {"title": "Contact", "url": "/contact"},
  {"title": "Guide réparateur", "url": "/guide-reparateur"}
]'::JSONB, 3),
('legal', 'Informations légales', 'Consultez nos mentions légales et conditions d''utilisation.', '[
  {"title": "Mentions légales", "url": "/mentions-legales"},
  {"title": "CGU", "url": "/cgu"},
  {"title": "Politique de confidentialité", "url": "/confidentialite"}
]'::JSONB, 4),
('repairer_cta', 'Vous êtes réparateur ?', 'Rejoignez notre réseau de professionnels et développez votre activité.', '[
  {"title": "Inscription réparateur", "url": "/devenir-reparateur", "className": "bg-primary text-primary-foreground"}
]'::JSONB, 5);

-- Améliorer la table visitor_analytics avec plus de détails
ALTER TABLE public.visitor_analytics 
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS referrer TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS device_type TEXT,
ADD COLUMN IF NOT EXISTS browser TEXT,
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 0;