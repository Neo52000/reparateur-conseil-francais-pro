-- Fix remaining functions without search_path

CREATE OR REPLACE FUNCTION public.sync_inventory_stock()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- Log de synchronisation pour l'UX
  INSERT INTO public.sync_logs (
    repairer_id, 
    sync_type, 
    entity_type, 
    entity_id, 
    operation,
    after_data,
    sync_status
  ) VALUES (
    NEW.repairer_id,
    CASE WHEN TG_TABLE_NAME = 'pos_inventory_items' THEN 'pos_to_ecommerce' ELSE 'ecommerce_to_pos' END,
    'inventory',
    NEW.id,
    'stock_sync',
    to_jsonb(NEW),
    'completed'
  );

  -- Synchroniser les stocks du POS vers E-commerce
  IF TG_TABLE_NAME = 'pos_inventory_items' THEN
    UPDATE public.ecommerce_products 
    SET 
      stock_quantity = NEW.current_stock,
      stock_status = CASE 
        WHEN NEW.current_stock = 0 THEN 'out_of_stock'
        WHEN NEW.current_stock <= NEW.minimum_stock THEN 'low_stock'
        ELSE 'in_stock'
      END,
      updated_at = NOW(),
      last_synced_at = NOW()
    WHERE sku = NEW.sku AND repairer_id = NEW.repairer_id;
  END IF;
  
  -- Synchroniser les stocks d'E-commerce vers POS
  IF TG_TABLE_NAME = 'ecommerce_products' THEN
    UPDATE public.pos_inventory_items 
    SET 
      current_stock = NEW.stock_quantity,
      updated_at = NOW(),
      synced_at = NOW(),
      sync_source = 'ecommerce'
    WHERE sku = NEW.sku AND repairer_id = NEW.repairer_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_seo_page_content(page_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  page_record RECORD;
BEGIN
  -- Vérifier les permissions
  IF NOT (public.get_current_user_role() = 'admin' OR public.has_local_seo_access(auth.uid())) THEN
    RETURN FALSE;
  END IF;
  
  -- Récupérer la page
  SELECT * INTO page_record FROM public.local_seo_pages WHERE id = page_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Marquer pour régénération IA (sera traité par le service externe)
  UPDATE public.local_seo_pages 
  SET 
    last_updated_content = now(),
    generation_prompt = 'refresh_request_' || extract(epoch from now())
  WHERE id = page_id;
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_pos_inventory_to_dashboard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- Log de synchronisation
  INSERT INTO public.sync_logs (
    repairer_id, sync_type, entity_type, entity_id, operation,
    before_data, after_data, sync_status
  ) VALUES (
    NEW.repairer_id, 'pos_to_dashboard', 'inventory', NEW.id,
    CASE WHEN TG_OP = 'INSERT' THEN 'create' 
         WHEN TG_OP = 'UPDATE' THEN 'update'
         ELSE 'delete' END,
    CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    'pending'
  );

  -- Marquer la source de synchronisation
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    NEW.synced_at = now();
    NEW.sync_source = 'pos';
    RETURN NEW;
  END IF;
  
  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_ecommerce_order_to_pos()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- Log de synchronisation
  INSERT INTO public.sync_logs (
    repairer_id, sync_type, entity_type, entity_id, operation,
    after_data, sync_status
  ) VALUES (
    NEW.repairer_id, 'ecommerce_to_pos', 'order', NEW.id,
    CASE WHEN TG_OP = 'INSERT' THEN 'create' ELSE 'update' END,
    to_jsonb(NEW), 'pending'
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_transaction_number(repairer_id uuid)
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  prefix TEXT;
  counter INTEGER;
  transaction_number TEXT;
BEGIN
  -- Créer un préfixe basé sur la date
  prefix := 'TXN-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-';
  
  -- Obtenir le compteur du jour pour ce réparateur
  SELECT COALESCE(MAX(
    CASE WHEN transaction_number LIKE prefix || '%' 
    THEN CAST(SUBSTRING(transaction_number FROM LENGTH(prefix) + 1) AS INTEGER)
    ELSE 0 END
  ), 0) + 1 INTO counter
  FROM public.pos_transactions 
  WHERE pos_transactions.repairer_id = generate_transaction_number.repairer_id
  AND DATE(transaction_date) = CURRENT_DATE;
  
  transaction_number := prefix || LPAD(counter::TEXT, 4, '0');
  
  RETURN transaction_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_order_number(repairer_id uuid)
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  prefix TEXT;
  counter INTEGER;
  order_number TEXT;
BEGIN
  -- Créer un préfixe basé sur la date
  prefix := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-';
  
  -- Obtenir le compteur du jour pour ce réparateur
  SELECT COALESCE(MAX(
    CASE WHEN order_number LIKE prefix || '%' 
    THEN CAST(SUBSTRING(order_number FROM LENGTH(prefix) + 1) AS INTEGER)
    ELSE 0 END
  ), 0) + 1 INTO counter
  FROM public.ecommerce_orders 
  WHERE ecommerce_orders.repairer_id = generate_order_number.repairer_id
  AND DATE(created_at) = CURRENT_DATE;
  
  order_number := prefix || LPAD(counter::TEXT, 4, '0');
  
  RETURN order_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_url_to_monitoring(url_to_monitor text, url_type_param text, reference_id_param uuid DEFAULT NULL::uuid, priority_param integer DEFAULT 5)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  url_id UUID;
BEGIN
  INSERT INTO public.monitored_urls (url, url_type, reference_id, priority)
  VALUES (url_to_monitor, url_type_param, reference_id_param, priority_param)
  ON CONFLICT (url) DO UPDATE SET
    url_type = EXCLUDED.url_type,
    reference_id = EXCLUDED.reference_id,
    priority = EXCLUDED.priority,
    updated_at = now()
  RETURNING id INTO url_id;
  
  RETURN url_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.fix_encoding_issues()
RETURNS TABLE(fixed_count integer, details jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  repairer_record RECORD;
  fixed_count INTEGER := 0;
  details_array JSONB := '[]'::JSONB;
BEGIN
  -- Parcourir tous les réparateurs avec des problèmes d'encodage
  FOR repairer_record IN 
    SELECT id, name, city, address, description
    FROM public.repairers 
    WHERE name LIKE '%�%' 
       OR city LIKE '%�%' 
       OR address LIKE '%�%' 
       OR description LIKE '%�%'
  LOOP
    -- Correction des caractères d'encodage
    UPDATE public.repairers 
    SET 
      name = REPLACE(REPLACE(REPLACE(REPLACE(name, 'Ã©', 'é'), 'Ã¨', 'è'), 'Ã ', 'à'), '�', 'é'),
      city = REPLACE(REPLACE(REPLACE(REPLACE(city, 'Ã©', 'é'), 'Ã¨', 'è'), 'Ã ', 'à'), '�', 'é'),
      address = REPLACE(REPLACE(REPLACE(REPLACE(address, 'Ã©', 'é'), 'Ã¨', 'è'), 'Ã ', 'à'), '�', 'é'),
      description = REPLACE(REPLACE(REPLACE(REPLACE(description, 'Ã©', 'é'), 'Ã¨', 'è'), 'Ã ', 'à'), '�', 'é'),
      updated_at = now()
    WHERE id = repairer_record.id;
    
    fixed_count := fixed_count + 1;
    details_array := details_array || jsonb_build_object(
      'id', repairer_record.id,
      'name', repairer_record.name
    );
  END LOOP;
  
  RETURN QUERY SELECT fixed_count, details_array;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_top_performing_cities(limit_count integer DEFAULT 10)
RETURNS TABLE(city text, total_views integer, avg_ctr numeric, total_conversions integer, performance_score numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lsp.city,
    lsp.page_views::INTEGER as total_views,
    ROUND(lsp.click_through_rate::NUMERIC, 2) as avg_ctr,
    COALESCE(SUM(lsm.conversions), 0)::INTEGER as total_conversions,
    ROUND((lsp.page_views * lsp.click_through_rate * lsp.seo_score / 100)::NUMERIC, 1) as performance_score
  FROM public.local_seo_pages lsp
  LEFT JOIN public.local_seo_metrics lsm ON lsp.id = lsm.page_id
  WHERE lsp.is_published = true AND lsp.page_views > 0
  GROUP BY lsp.id, lsp.city, lsp.page_views, lsp.click_through_rate, lsp.seo_score
  ORDER BY performance_score DESC
  LIMIT limit_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_service_performance()
RETURNS TABLE(service_type text, total_pages integer, avg_views numeric, avg_ctr numeric, avg_seo_score numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lsp.service_type,
    COUNT(*)::INTEGER as total_pages,
    ROUND(AVG(lsp.page_views)::NUMERIC, 1) as avg_views,
    ROUND(AVG(lsp.click_through_rate)::NUMERIC, 2) as avg_ctr,
    ROUND(AVG(lsp.seo_score)::NUMERIC, 1) as avg_seo_score
  FROM public.local_seo_pages lsp
  WHERE lsp.is_published = true
  GROUP BY lsp.service_type
  ORDER BY avg_views DESC;
END;
$$;