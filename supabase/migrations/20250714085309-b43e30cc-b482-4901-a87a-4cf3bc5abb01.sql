-- Créer un bucket pour les images de blog
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true);

-- Créer des politiques pour permettre l'upload et la lecture des images
CREATE POLICY "Tout le monde peut voir les images de blog" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'blog-images');

CREATE POLICY "Les utilisateurs authentifiés peuvent uploader des images de blog" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'blog-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres images de blog" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'blog-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres images de blog" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'blog-images' AND auth.uid() IS NOT NULL);