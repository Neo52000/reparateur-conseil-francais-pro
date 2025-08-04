-- Corriger les fonctions avec search_path pour la sécurité
CREATE OR REPLACE FUNCTION public.update_supplier_rating()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;