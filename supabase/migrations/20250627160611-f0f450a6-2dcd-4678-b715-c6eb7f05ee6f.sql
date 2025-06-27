
-- Créer des politiques RLS plus permissives pour les bannières publicitaires

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Public can view active banners" ON public.ad_banners;
DROP POLICY IF EXISTS "Admins can manage all banners" ON public.ad_banners;
DROP POLICY IF EXISTS "Anyone can insert impressions" ON public.ad_impressions;
DROP POLICY IF EXISTS "Users can view their own impressions" ON public.ad_impressions;
DROP POLICY IF EXISTS "Admins can view all impressions" ON public.ad_impressions;
DROP POLICY IF EXISTS "Anyone can insert clicks" ON public.ad_clicks;
DROP POLICY IF EXISTS "Users can view their own clicks" ON public.ad_clicks;
DROP POLICY IF EXISTS "Admins can view all clicks" ON public.ad_clicks;

-- Créer des politiques plus permissives pour les bannières
CREATE POLICY "Public can view active banners"
ON public.ad_banners FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Admins can manage all banners"
ON public.ad_banners FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Politiques pour les impressions (permettre l'insertion publique)
CREATE POLICY "Anyone can insert impressions"
ON public.ad_impressions FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can view their own impressions"
ON public.ad_impressions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all impressions"
ON public.ad_impressions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Politiques pour les clics (permettre l'insertion publique)
CREATE POLICY "Anyone can insert clicks"
ON public.ad_clicks FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can view their own clicks"
ON public.ad_clicks FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all clicks"
ON public.ad_clicks FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- S'assurer que RLS est activé
ALTER TABLE public.ad_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_clicks ENABLE ROW LEVEL SECURITY;
