
-- Ajouter des politiques RLS pour les tables publicitaires

-- Politiques pour ad_banners
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

-- Politiques pour ad_impressions
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

-- Politiques pour ad_clicks
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

-- Activer RLS sur toutes les tables si ce n'est pas déjà fait
ALTER TABLE public.ad_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_clicks ENABLE ROW LEVEL SECURITY;
