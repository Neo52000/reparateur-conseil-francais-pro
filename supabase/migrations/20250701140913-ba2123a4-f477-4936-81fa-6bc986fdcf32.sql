
-- Ajouter les colonnes manquantes à la table campaign_creatives
ALTER TABLE public.campaign_creatives 
ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Sans nom',
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Mettre à jour les enregistrements existants pour s'assurer qu'ils ont des valeurs par défaut
UPDATE public.campaign_creatives 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Ajouter le trigger pour updated_at si il n'existe pas déjà
DROP TRIGGER IF EXISTS update_campaign_creatives_updated_at ON public.campaign_creatives;
CREATE TRIGGER update_campaign_creatives_updated_at
  BEFORE UPDATE ON public.campaign_creatives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
