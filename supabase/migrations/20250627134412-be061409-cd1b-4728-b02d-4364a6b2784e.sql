
-- Créer un bucket pour les images de bannières publicitaires
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-banners', 'ad-banners', true);

-- Créer une politique pour permettre l'upload d'images aux admins
CREATE POLICY "Admins can upload banner images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ad-banners' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Créer une politique pour permettre la lecture publique des images de bannières
CREATE POLICY "Public can view banner images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ad-banners');

-- Créer une politique pour permettre aux admins de supprimer les images
CREATE POLICY "Admins can delete banner images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'ad-banners' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
