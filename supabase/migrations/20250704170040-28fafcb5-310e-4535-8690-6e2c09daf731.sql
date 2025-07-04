-- =========================================
-- POLITIQUES RLS COMPLÈTES
-- =========================================

-- Politiques POS Sessions
CREATE POLICY "Users can manage their own POS sessions"
ON public.pos_sessions
FOR ALL
USING (auth.uid() = repairer_id AND has_module_access(auth.uid(), 'pos'))
WITH CHECK (auth.uid() = repairer_id AND has_module_access(auth.uid(), 'pos'));

CREATE POLICY "Admins can manage all POS sessions"
ON public.pos_sessions
FOR ALL
USING (get_current_user_role() = 'admin');

-- Politiques POS Transactions
CREATE POLICY "Users can manage their own POS transactions"
ON public.pos_transactions
FOR ALL
USING (auth.uid() = repairer_id AND has_module_access(auth.uid(), 'pos'))
WITH CHECK (auth.uid() = repairer_id AND has_module_access(auth.uid(), 'pos'));

CREATE POLICY "Admins can manage all POS transactions"
ON public.pos_transactions
FOR ALL
USING (get_current_user_role() = 'admin');

-- Politiques POS Transaction Items
CREATE POLICY "Users can manage their own transaction items"
ON public.pos_transaction_items
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.pos_transactions 
  WHERE pos_transactions.id = pos_transaction_items.transaction_id 
  AND pos_transactions.repairer_id = auth.uid()
  AND has_module_access(auth.uid(), 'pos')
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.pos_transactions 
  WHERE pos_transactions.id = pos_transaction_items.transaction_id 
  AND pos_transactions.repairer_id = auth.uid()
  AND has_module_access(auth.uid(), 'pos')
));

CREATE POLICY "Admins can manage all transaction items"
ON public.pos_transaction_items
FOR ALL
USING (get_current_user_role() = 'admin');

-- Politiques POS Inventory
CREATE POLICY "Users can manage their own inventory"
ON public.pos_inventory_items
FOR ALL
USING (auth.uid() = repairer_id AND has_module_access(auth.uid(), 'pos'))
WITH CHECK (auth.uid() = repairer_id AND has_module_access(auth.uid(), 'pos'));

CREATE POLICY "Admins can manage all inventory"
ON public.pos_inventory_items
FOR ALL
USING (get_current_user_role() = 'admin');

-- Politiques E-commerce Products
CREATE POLICY "Users can manage their own products"
ON public.ecommerce_products
FOR ALL
USING (auth.uid() = repairer_id AND has_module_access(auth.uid(), 'ecommerce'))
WITH CHECK (auth.uid() = repairer_id AND has_module_access(auth.uid(), 'ecommerce'));

CREATE POLICY "Admins can manage all products"
ON public.ecommerce_products
FOR ALL
USING (get_current_user_role() = 'admin');

CREATE POLICY "Public can view published products"
ON public.ecommerce_products
FOR SELECT
USING (status = 'published');

-- Politiques E-commerce Orders
CREATE POLICY "Users can manage their own orders"
ON public.ecommerce_orders
FOR ALL
USING (auth.uid() = repairer_id AND has_module_access(auth.uid(), 'ecommerce'))
WITH CHECK (auth.uid() = repairer_id AND has_module_access(auth.uid(), 'ecommerce'));

CREATE POLICY "Admins can manage all orders"
ON public.ecommerce_orders
FOR ALL
USING (get_current_user_role() = 'admin');

-- Politiques E-commerce Order Items
CREATE POLICY "Users can manage their order items"
ON public.ecommerce_order_items
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.ecommerce_orders 
  WHERE ecommerce_orders.id = ecommerce_order_items.order_id 
  AND ecommerce_orders.repairer_id = auth.uid()
  AND has_module_access(auth.uid(), 'ecommerce')
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.ecommerce_orders 
  WHERE ecommerce_orders.id = ecommerce_order_items.order_id 
  AND ecommerce_orders.repairer_id = auth.uid()
  AND has_module_access(auth.uid(), 'ecommerce')
));

CREATE POLICY "Admins can manage all order items"
ON public.ecommerce_order_items
FOR ALL
USING (get_current_user_role() = 'admin');

-- Politiques E-commerce Customers
CREATE POLICY "Users can manage their own customers"
ON public.ecommerce_customers
FOR ALL
USING (auth.uid() = repairer_id AND has_module_access(auth.uid(), 'ecommerce'))
WITH CHECK (auth.uid() = repairer_id AND has_module_access(auth.uid(), 'ecommerce'));

CREATE POLICY "Admins can manage all customers"
ON public.ecommerce_customers
FOR ALL
USING (get_current_user_role() = 'admin');

-- Politiques Sync Logs
CREATE POLICY "Users can view their own sync logs"
ON public.sync_logs
FOR SELECT
USING (auth.uid() = repairer_id);

CREATE POLICY "Users can create their own sync logs"
ON public.sync_logs
FOR INSERT
WITH CHECK (auth.uid() = repairer_id);

CREATE POLICY "Admins can manage all sync logs"
ON public.sync_logs
FOR ALL
USING (get_current_user_role() = 'admin');

-- Politiques Offline Queue
CREATE POLICY "Users can manage their own sync queue"
ON public.offline_sync_queue
FOR ALL
USING (auth.uid() = repairer_id)
WITH CHECK (auth.uid() = repairer_id);

CREATE POLICY "Admins can manage all sync queues"
ON public.offline_sync_queue
FOR ALL
USING (get_current_user_role() = 'admin');

-- =========================================
-- TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- =========================================

-- Trigger pour updated_at sur toutes les tables
CREATE TRIGGER update_pos_sessions_updated_at
  BEFORE UPDATE ON public.pos_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_transactions_updated_at
  BEFORE UPDATE ON public.pos_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_transaction_items_updated_at
  BEFORE UPDATE ON public.pos_transaction_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_inventory_items_updated_at
  BEFORE UPDATE ON public.pos_inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ecommerce_products_updated_at
  BEFORE UPDATE ON public.ecommerce_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ecommerce_orders_updated_at
  BEFORE UPDATE ON public.ecommerce_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ecommerce_customers_updated_at
  BEFORE UPDATE ON public.ecommerce_customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_offline_sync_queue_updated_at
  BEFORE UPDATE ON public.offline_sync_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- FONCTIONS DE SYNCHRONISATION BI-DIRECTIONNELLE
-- =========================================

-- Fonction pour synchroniser l'inventaire POS vers Dashboard
CREATE OR REPLACE FUNCTION sync_pos_inventory_to_dashboard()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger pour synchronisation inventaire POS
CREATE TRIGGER sync_pos_inventory_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.pos_inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION sync_pos_inventory_to_dashboard();

-- Fonction pour synchroniser les commandes e-commerce vers POS
CREATE OR REPLACE FUNCTION sync_ecommerce_order_to_pos()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger pour synchronisation commandes e-commerce
CREATE TRIGGER sync_ecommerce_order_trigger
  AFTER INSERT OR UPDATE ON public.ecommerce_orders
  FOR EACH ROW
  EXECUTE FUNCTION sync_ecommerce_order_to_pos();

-- Fonction pour générer des numéros de transaction uniques
CREATE OR REPLACE FUNCTION generate_transaction_number(repairer_id UUID)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Fonction pour générer des numéros de commande e-commerce
CREATE OR REPLACE FUNCTION generate_order_number(repairer_id UUID)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;