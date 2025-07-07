-- Créer la fonction de correction d'encodage des réparateurs
CREATE OR REPLACE FUNCTION public.fix_encoding_issues()
RETURNS TABLE(
  fixed_count INTEGER,
  details JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  repairer_record RECORD;
  fixed_count INTEGER := 0;
  details_array JSONB := '[]'::JSONB;
BEGIN
  -- Parcourir tous les réparateurs avec des problèmes d'encodage
  FOR repairer_record IN 
    SELECT id, name, city, address, description
    FROM public.repairers 
    WHERE name LIKE '%�%' 
       OR city LIKE '%�%' 
       OR address LIKE '%�%' 
       OR description LIKE '%�%'
  LOOP
    -- Correction des caractères d'encodage
    UPDATE public.repairers 
    SET 
      name = REPLACE(REPLACE(REPLACE(REPLACE(name, 'Ã©', 'é'), 'Ã¨', 'è'), 'Ã ', 'à'), '�', 'é'),
      city = REPLACE(REPLACE(REPLACE(REPLACE(city, 'Ã©', 'é'), 'Ã¨', 'è'), 'Ã ', 'à'), '�', 'é'),
      address = REPLACE(REPLACE(REPLACE(REPLACE(address, 'Ã©', 'é'), 'Ã¨', 'è'), 'Ã ', 'à'), '�', 'é'),
      description = REPLACE(REPLACE(REPLACE(REPLACE(description, 'Ã©', 'é'), 'Ã¨', 'è'), 'Ã ', 'à'), '�', 'é'),
      updated_at = now()
    WHERE id = repairer_record.id;
    
    fixed_count := fixed_count + 1;
    details_array := details_array || jsonb_build_object(
      'id', repairer_record.id,
      'name', repairer_record.name
    );
  END LOOP;
  
  RETURN QUERY SELECT fixed_count, details_array;
END;
$$;

-- Créer la table pour les templates de contenu mobile
CREATE TABLE IF NOT EXISTS public.repair_content_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  device_type TEXT,
  repair_type TEXT,
  content_template TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insérer des templates par défaut
INSERT INTO public.repair_content_templates (name, category, device_type, repair_type, content_template, variables) VALUES
('Template Écran Cassé', 'reparation', 'smartphone', 'ecran', 
'Votre écran de {device_brand} {device_model} est cassé ? Pas de panique ! Notre équipe de techniciens experts est là pour vous aider.

**Diagnostic rapide** : Nous examinons votre appareil en quelques minutes pour identifier le problème exact.

**Réparation professionnelle** : Remplacement de l''écran avec des pièces de qualité et garantie.

**Délai express** : Réparation en 30 minutes à 2h selon la disponibilité de la pièce.

Tarif indicatif : à partir de {price_estimate}€ TTC', 
'{"device_brand": "Samsung", "device_model": "Galaxy S21", "price_estimate": "89"}'),

('Template Batterie', 'reparation', 'smartphone', 'batterie',
'Votre batterie ne tient plus la charge ? Autonomie réduite ? Il est temps de la remplacer !

**Symptômes** : Décharge rapide, extinction soudaine, surchauffe anormale.

**Solution** : Remplacement de la batterie par une batterie neuve haute capacité.

**Avantages** : Retrouvez l''autonomie d''origine, performances optimales, sécurité garantie.

Estimation : {price_range}€ - Garantie {warranty_period} mois', 
'{"price_range": "45-75", "warranty_period": "6"}'),

('Template Réparation Générale', 'general', null, null,
'Réparation express de votre {device_type} {device_brand}

Notre service de réparation professionnel vous garantit :
- Diagnostic gratuit en 10 minutes
- Réparation avec pièces d''origine ou compatibles
- Garantie {warranty_period} mois sur la réparation
- Tarifs transparents et compétitifs

Problèmes courants traités :
{common_issues}

N''hésitez pas à nous contacter pour un devis personnalisé !', 
'{"device_type": "smartphone", "device_brand": "iPhone", "warranty_period": "6", "common_issues": "Écran cassé, batterie défaillante, connecteur de charge, haut-parleur"}');

-- Politiques RLS pour les templates
ALTER TABLE public.repair_content_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin full access to templates"
ON public.repair_content_templates
FOR ALL
USING (get_current_user_role() = 'admin');

CREATE POLICY "Allow public read access to active templates"
ON public.repair_content_templates
FOR SELECT
USING (is_active = true);

-- Trigger pour updated_at
CREATE TRIGGER update_repair_content_templates_updated_at
BEFORE UPDATE ON public.repair_content_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();