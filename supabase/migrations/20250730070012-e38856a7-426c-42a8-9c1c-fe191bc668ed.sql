-- Migration QualiRépar v2 - Conformité API officielle du Fonds Réparation

-- Ajouter de nouvelles colonnes pour supporter l'API officielle
ALTER TABLE public.qualirepar_dossiers 
ADD COLUMN IF NOT EXISTS temporary_claim_id TEXT,
ADD COLUMN IF NOT EXISTS official_claim_id TEXT,
ADD COLUMN IF NOT EXISTS api_upload_urls JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS document_types_uploaded TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS api_status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS api_response_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS wizard_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_api_compliant BOOLEAN DEFAULT false;

-- Mettre à jour le type de colonne status pour inclure les nouveaux statuts
ALTER TABLE public.qualirepar_dossiers 
DROP CONSTRAINT IF EXISTS qualirepar_dossiers_status_check;

ALTER TABLE public.qualirepar_dossiers 
ADD CONSTRAINT qualirepar_dossiers_status_check 
CHECK (status IN ('draft', 'metadata_complete', 'documents_uploaded', 'ready_to_submit', 'submitted', 'processing', 'approved', 'paid', 'rejected'));

-- Mettre à jour la table documents pour supporter les codes officiels
ALTER TABLE public.qualirepar_documents 
ADD COLUMN IF NOT EXISTS official_document_type TEXT,
ADD COLUMN IF NOT EXISTS upload_url TEXT,
ADD COLUMN IF NOT EXISTS upload_status TEXT DEFAULT 'pending';

-- Ajouter contrainte pour les types de documents officiels
ALTER TABLE public.qualirepar_documents 
ADD CONSTRAINT official_document_type_check 
CHECK (official_document_type IN ('FACTURE', 'BON_DEPOT', 'SERIALTAG', 'PHOTO_PRODUIT', 'JUSTIFICATIF_COMPLEMENTAIRE'));

-- Créer une table pour stocker les templates de catalogues de produits
CREATE TABLE IF NOT EXISTS public.qualirepar_product_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_code TEXT NOT NULL,
  category_name TEXT NOT NULL,
  min_repair_cost NUMERIC DEFAULT 15,
  max_bonus_amount NUMERIC NOT NULL,
  eco_organism TEXT DEFAULT 'Ecosystem',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insérer quelques catégories de base
INSERT INTO public.qualirepar_product_catalog (category_code, category_name, max_bonus_amount) VALUES
('SMARTPHONE', 'Smartphone', 25),
('TABLET', 'Tablette', 25),
('LAPTOP', 'Ordinateur portable', 50),
('TV', 'Télévision', 50),
('WASHING_MACHINE', 'Lave-linge', 60),
('MICROWAVE', 'Micro-ondes', 30),
('VACUUM', 'Aspirateur', 30)
ON CONFLICT DO NOTHING;

-- Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_qualirepar_dossiers_api_status 
ON public.qualirepar_dossiers(api_status);

CREATE INDEX IF NOT EXISTS idx_qualirepar_dossiers_temporary_claim_id 
ON public.qualirepar_dossiers(temporary_claim_id);

CREATE INDEX IF NOT EXISTS idx_qualirepar_documents_official_type 
ON public.qualirepar_documents(official_document_type);

-- Mettre à jour les RLS policies pour la nouvelle table
ALTER TABLE public.qualirepar_product_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active catalog" 
ON public.qualirepar_product_catalog 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage catalog" 
ON public.qualirepar_product_catalog 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_qualirepar_catalog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_qualirepar_catalog_updated_at
BEFORE UPDATE ON public.qualirepar_product_catalog
FOR EACH ROW
EXECUTE FUNCTION update_qualirepar_catalog_updated_at();