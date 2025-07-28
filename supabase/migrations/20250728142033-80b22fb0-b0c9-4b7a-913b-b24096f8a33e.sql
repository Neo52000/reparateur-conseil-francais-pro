-- Create storage bucket for QualiRépar documents
INSERT INTO storage.buckets (id, name, public) VALUES ('qualirepar-documents', 'qualirepar-documents', false);

-- Create storage policies for QualiRépar documents
CREATE POLICY "Repairers can upload their QualiRépar documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'qualirepar-documents' 
  AND EXISTS (
    SELECT 1 FROM qualirepar_dossiers 
    WHERE qualirepar_dossiers.id::text = (storage.foldername(name))[1]
    AND qualirepar_dossiers.repairer_id = auth.uid()
  )
);

CREATE POLICY "Repairers can view their QualiRépar documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'qualirepar-documents' 
  AND EXISTS (
    SELECT 1 FROM qualirepar_dossiers 
    WHERE qualirepar_dossiers.id::text = (storage.foldername(name))[1]
    AND qualirepar_dossiers.repairer_id = auth.uid()
  )
);

CREATE POLICY "Repairers can delete their QualiRépar documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'qualirepar-documents' 
  AND EXISTS (
    SELECT 1 FROM qualirepar_dossiers 
    WHERE qualirepar_dossiers.id::text = (storage.foldername(name))[1]
    AND qualirepar_dossiers.repairer_id = auth.uid()
  )
);

-- Admins can manage all documents
CREATE POLICY "Admins can manage all QualiRépar documents" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'qualirepar-documents' AND get_current_user_role() = 'admin');

-- Create edge function configuration for qualirepar-submission
CREATE TABLE IF NOT EXISTS public.edge_function_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL UNIQUE,
  config JSONB NOT NULL DEFAULT '{}',
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert config for QualiRépar submission function
INSERT INTO public.edge_function_configs (function_name, config, is_enabled)
VALUES (
  'qualirepar-submission',
  '{
    "max_documents": 10,
    "allowed_file_types": ["pdf", "jpg", "jpeg", "png", "doc", "docx"],
    "max_file_size_mb": 10,
    "eco_organisms": {
      "ecosystem": "qualirepar@ecosystem.eco",
      "ecologic": "qualirepar@ecologic-france.com",
      "recycleurs": "qualirepar@recycleurs.org"
    }
  }',
  true
);