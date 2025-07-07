-- Ajouter les politiques RLS manquantes pour la table subscription_plans
-- Permettre aux admins de modifier les tarifs des plans

-- Politique pour UPDATE (modification des tarifs)
CREATE POLICY "Admins can update subscription plans" 
ON public.subscription_plans 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Politique pour INSERT (au cas où il faudrait créer de nouveaux plans)
CREATE POLICY "Admins can insert subscription plans" 
ON public.subscription_plans 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Politique pour DELETE (au cas où il faudrait supprimer des plans)
CREATE POLICY "Admins can delete subscription plans" 
ON public.subscription_plans 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);