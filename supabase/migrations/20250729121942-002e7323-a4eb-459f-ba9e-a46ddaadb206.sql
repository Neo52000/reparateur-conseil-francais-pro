-- Créer la table subscription_plans si elle n'existe pas déjà
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC NOT NULL DEFAULT 0,
  price_yearly NUMERIC NOT NULL DEFAULT 0,
  features TEXT[] NOT NULL DEFAULT '{}',
  promo BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux admins de gérer les plans
CREATE POLICY "Admins can manage subscription plans" 
ON public.subscription_plans 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Politique pour permettre à tout le monde de voir les plans actifs
CREATE POLICY "Anyone can view active subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (is_active = true);

-- Insérer quelques plans exemple orientés annuaire et référencement local
INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, features, promo) VALUES
('Gratuit', 'Découvrez notre plateforme', 0, 0, ARRAY[
  'Présence dans l''annuaire TopRéparateurs',
  'Profil de base avec coordonnées',
  'Affichage des spécialités',
  'Réception de demandes clients'
], false),
('Visibilité', 'Boostez votre présence locale', 19.90, 199, ARRAY[
  'Tout du plan Gratuit',
  'Référencement local optimisé',
  'Profil enrichi avec photos',
  'Avis clients et notation',
  'Gestion des horaires d''ouverture',
  'Contact direct par téléphone/email'
], true),
('Pro', 'Solution complète pour développer votre activité', 39.90, 399, ARRAY[
  'Tout du plan Visibilité',
  'Page dédiée avec URL personnalisée',
  'Galerie photos avant/après',
  'Gestion des devis en ligne',
  'Calendrier de prise de rendez-vous',
  'Analytics détaillées'
], false),
('Premium', 'Maximisez votre potentiel commercial', 99.90, 999, ARRAY[
  'Tout du plan Pro',
  'Boutique en ligne intégrée',
  'POS certifié NF525',
  'Gestion QualiRépar automatisée',
  'Campagnes publicitaires locales',
  'Support prioritaire 7j/7'
], false);