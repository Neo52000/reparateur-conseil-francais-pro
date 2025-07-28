-- Désactiver temporairement le trigger qui pose problème
ALTER TABLE public.repairers DISABLE TRIGGER ALL;

-- Mettre à jour les réparateurs PIXOU PHONE pour qu'ils soient vérifiés et visibles sur la carte
UPDATE public.repairers 
SET is_verified = true,
    updated_at = now()
WHERE name LIKE '%PIXOU PHONE%' 
   OR name LIKE '%Pixou Phone%';

-- Réactiver les triggers
ALTER TABLE public.repairers ENABLE TRIGGER ALL;

-- Ajouter un index pour améliorer les performances de recherche par ville
CREATE INDEX IF NOT EXISTS idx_repairers_city_verified ON public.repairers(city, is_verified);

-- Ajouter un index pour améliorer les performances des coordonnées (carte)
CREATE INDEX IF NOT EXISTS idx_repairers_coordinates ON public.repairers(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;