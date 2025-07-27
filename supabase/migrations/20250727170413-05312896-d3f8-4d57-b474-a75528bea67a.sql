-- Créer la table visitor_analytics 
CREATE TABLE public.visitor_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  session_id TEXT,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  duration_seconds INTEGER DEFAULT 0,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all visitor analytics" 
ON public.visitor_analytics 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Anyone can insert visitor analytics" 
ON public.visitor_analytics 
FOR INSERT 
WITH CHECK (true);

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