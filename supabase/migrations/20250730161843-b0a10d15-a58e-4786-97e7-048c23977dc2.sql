-- Phase 3: Gestion avancée des documents QualiRépar V3

-- Amélioration de la table des documents
ALTER TABLE public.qualirepar_documents 
ADD COLUMN IF NOT EXISTS file_validation_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS file_validation_errors JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS file_metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS ocr_extracted_text TEXT,
ADD COLUMN IF NOT EXISTS file_checksum TEXT,
ADD COLUMN IF NOT EXISTS original_filename TEXT;

-- Création du bucket storage pour les documents QualiRépar
INSERT INTO storage.buckets (id, name, public) 
VALUES ('qualirepar-documents-v3', 'qualirepar-documents-v3', false)
ON CONFLICT (id) DO NOTHING;

-- Politiques de sécurité pour le storage
CREATE POLICY "Repairers can upload their documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'qualirepar-documents-v3' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Repairers can view their documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'qualirepar-documents-v3' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can manage all documents" ON storage.objects
  FOR ALL USING (
    bucket_id = 'qualirepar-documents-v3' AND
    get_current_user_role() = 'admin'
  );