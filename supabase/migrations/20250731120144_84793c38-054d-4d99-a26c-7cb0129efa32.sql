-- Créer une table de liaison entre repair_categories et device_types
CREATE TABLE IF NOT EXISTS public.repair_category_device_types (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    repair_category_id UUID NOT NULL REFERENCES public.repair_categories(id) ON DELETE CASCADE,
    device_type_id UUID NOT NULL REFERENCES public.device_types(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(repair_category_id, device_type_id)
);

-- Activer RLS
ALTER TABLE public.repair_category_device_types ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins
CREATE POLICY "Admins can manage category-device links" 
ON public.repair_category_device_types 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Politique pour lecture publique des liaisons actives
CREATE POLICY "Public can view active category-device links" 
ON public.repair_category_device_types 
FOR SELECT 
USING (is_active = true);

-- Ajouter un trigger pour updated_at
CREATE OR REPLACE FUNCTION public.update_repair_category_device_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE TRIGGER update_repair_category_device_types_updated_at_trigger
    BEFORE UPDATE ON public.repair_category_device_types
    FOR EACH ROW
    EXECUTE FUNCTION public.update_repair_category_device_types_updated_at();

-- Insérer quelques liaisons par défaut logiques
INSERT INTO public.repair_category_device_types (repair_category_id, device_type_id)
SELECT rc.id, dt.id
FROM public.repair_categories rc, public.device_types dt
WHERE 
    -- Écran pour smartphones et tablettes
    (rc.name = 'Écran' AND dt.name IN ('Smartphone', 'Tablette', 'Console de jeux'))
    OR 
    -- Batterie pour appareils électroniques
    (rc.name = 'Batterie' AND dt.name IN ('Smartphone', 'Tablette', 'Montre connectée', 'Console de jeux'))
    OR
    -- Audio pour appareils avec haut-parleurs
    (rc.name = 'Audio' AND dt.name IN ('Smartphone', 'Tablette', 'Console de jeux'))
    OR
    -- Connectique pour tous
    (rc.name = 'Connectique' AND dt.name IN ('Smartphone', 'Tablette', 'Montre connectée', 'Console de jeux'))
    OR
    -- Boutons pour appareils avec boutons physiques
    (rc.name = 'Boutons' AND dt.name IN ('Smartphone', 'Tablette', 'Console de jeux'))
    OR
    -- Carte mère pour appareils complexes
    (rc.name = 'Carte mère' AND dt.name IN ('Smartphone', 'Tablette', 'Console de jeux'))
    OR
    -- Bracelet pour montres
    (rc.name = 'Bracelet' AND dt.name = 'Montre connectée')
    OR
    -- Capteurs pour montres
    (rc.name = 'Capteurs' AND dt.name = 'Montre connectée')
ON CONFLICT (repair_category_id, device_type_id) DO NOTHING;