-- Corriger la fonction de génération de numéro d'ordre pour éviter l'ambiguïté

CREATE OR REPLACE FUNCTION public.auto_generate_repair_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_repair_order_number(NEW.repairer_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Corriger aussi la fonction generate_repair_order_number pour être plus spécifique
CREATE OR REPLACE FUNCTION public.generate_repair_order_number(repairer_id_param uuid)
RETURNS text
LANGUAGE plpgsql
SET search_path TO ''
AS $$
DECLARE
  prefix TEXT;
  counter INTEGER;
  order_number_result TEXT;
BEGIN
  -- Créer un préfixe basé sur la date
  prefix := 'REP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-';
  
  -- Obtenir le compteur du jour pour ce réparateur
  SELECT COALESCE(MAX(
    CASE WHEN ro.order_number LIKE prefix || '%' 
    THEN CAST(SUBSTRING(ro.order_number FROM LENGTH(prefix) + 1) AS INTEGER)
    ELSE 0 END
  ), 0) + 1 INTO counter
  FROM public.repair_orders ro
  WHERE ro.repairer_id = repairer_id_param
  AND DATE(ro.created_at) = CURRENT_DATE;
  
  order_number_result := prefix || LPAD(counter::TEXT, 4, '0');
  
  RETURN order_number_result;
END;
$$;