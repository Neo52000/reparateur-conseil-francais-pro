-- Créer la table pour l'annuaire des fournisseurs
CREATE TABLE public.suppliers_directory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  brands_sold TEXT[] DEFAULT '{}',
  product_types TEXT[] DEFAULT '{}',
  website TEXT,
  phone TEXT,
  email TEXT,
  address JSONB DEFAULT '{}',
  rating NUMERIC DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  specialties TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  logo_url TEXT,
  featured_image_url TEXT,
  payment_terms TEXT,
  minimum_order NUMERIC DEFAULT 0,
  delivery_info JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table pour les avis des fournisseurs
CREATE TABLE public.suppliers_directory_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES public.suppliers_directory(id) ON DELETE CASCADE,
  repairer_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  pros JSONB DEFAULT '[]',
  cons JSONB DEFAULT '[]',
  verified_purchase BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('published', 'pending', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(supplier_id, repairer_id)
);

-- Activer RLS sur les deux tables
ALTER TABLE public.suppliers_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers_directory_reviews ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour suppliers_directory
-- Les réparateurs avec abonnement payant peuvent voir les fournisseurs actifs
CREATE POLICY "Paid repairers can view active suppliers" 
ON public.suppliers_directory 
FOR SELECT 
USING (
  status = 'active' AND 
  EXISTS (
    SELECT 1 
    FROM public.repairer_subscriptions 
    WHERE user_id = auth.uid()
      AND subscription_tier IN ('premium', 'enterprise')
      AND subscribed = true
  )
);

-- Les admins peuvent tout gérer
CREATE POLICY "Admins can manage suppliers" 
ON public.suppliers_directory 
FOR ALL 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- Politiques RLS pour suppliers_directory_reviews
-- Les réparateurs avec abonnement payant peuvent voir les avis publiés
CREATE POLICY "Paid repairers can view published reviews" 
ON public.suppliers_directory_reviews 
FOR SELECT 
USING (
  status = 'published' AND 
  EXISTS (
    SELECT 1 
    FROM public.repairer_subscriptions 
    WHERE user_id = auth.uid()
      AND subscription_tier IN ('premium', 'enterprise')
      AND subscribed = true
  )
);

-- Les réparateurs peuvent créer des avis
CREATE POLICY "Repairers can create reviews" 
ON public.suppliers_directory_reviews 
FOR INSERT 
WITH CHECK (
  repairer_id = auth.uid() AND
  EXISTS (
    SELECT 1 
    FROM public.repairer_subscriptions 
    WHERE user_id = auth.uid()
      AND subscription_tier IN ('premium', 'enterprise')
      AND subscribed = true
  )
);

-- Les réparateurs peuvent modifier leurs propres avis
CREATE POLICY "Repairers can update own reviews" 
ON public.suppliers_directory_reviews 
FOR UPDATE 
USING (repairer_id = auth.uid())
WITH CHECK (repairer_id = auth.uid());

-- Les admins peuvent tout gérer
CREATE POLICY "Admins can manage reviews" 
ON public.suppliers_directory_reviews 
FOR ALL 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- Fonction pour mettre à jour la note moyenne des fournisseurs
CREATE OR REPLACE FUNCTION public.update_supplier_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.suppliers_directory 
  SET 
    rating = COALESCE((
      SELECT ROUND(AVG(rating)::NUMERIC, 1)
      FROM public.suppliers_directory_reviews 
      WHERE supplier_id = COALESCE(NEW.supplier_id, OLD.supplier_id)
        AND status = 'published'
    ), 0),
    review_count = COALESCE((
      SELECT COUNT(*)
      FROM public.suppliers_directory_reviews 
      WHERE supplier_id = COALESCE(NEW.supplier_id, OLD.supplier_id)
        AND status = 'published'
    ), 0),
    updated_at = now()
  WHERE id = COALESCE(NEW.supplier_id, OLD.supplier_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement les ratings
CREATE TRIGGER update_supplier_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.suppliers_directory_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_supplier_rating();

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_suppliers_directory_updated_at
  BEFORE UPDATE ON public.suppliers_directory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_directory_reviews_updated_at
  BEFORE UPDATE ON public.suppliers_directory_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();