-- Créer un bucket de stockage pour les médias des landing pages
INSERT INTO storage.buckets (id, name, public) 
VALUES ('landing-page-media', 'landing-page-media', true);

-- Créer des politiques pour le bucket
CREATE POLICY "Admins can upload landing page media"
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'landing-page-media' AND EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can update landing page media"
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'landing-page-media' AND EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can delete landing page media"
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'landing-page-media' AND EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Public can view landing page media"
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'landing-page-media');