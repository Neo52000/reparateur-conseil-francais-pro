
-- Ajouter les colonnes pour les horaires d'ouverture dans la table repairer_profiles
ALTER TABLE public.repairer_profiles 
ADD COLUMN opening_hours JSONB DEFAULT NULL;

-- Ajouter les autres colonnes manquantes pour les nouvelles fonctionnalités
ALTER TABLE public.repairer_profiles 
ADD COLUMN services_offered TEXT[] DEFAULT '{}',
ADD COLUMN certifications TEXT[] DEFAULT '{}',
ADD COLUMN years_experience INTEGER DEFAULT NULL,
ADD COLUMN languages_spoken TEXT[] DEFAULT '{}',
ADD COLUMN payment_methods TEXT[] DEFAULT '{}',
ADD COLUMN warranty_duration TEXT DEFAULT NULL,
ADD COLUMN response_time TEXT DEFAULT NULL,
ADD COLUMN emergency_service BOOLEAN DEFAULT false,
ADD COLUMN home_service BOOLEAN DEFAULT false,
ADD COLUMN pickup_service BOOLEAN DEFAULT false,
ADD COLUMN pricing_info JSONB DEFAULT NULL;
