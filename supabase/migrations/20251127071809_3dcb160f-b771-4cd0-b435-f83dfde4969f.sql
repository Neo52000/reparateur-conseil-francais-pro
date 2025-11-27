-- Ajouter search_path aux fonctions restantes (vérifiées)

-- Fonctions SECURITY DEFINER existantes
ALTER FUNCTION public.assign_free_plan_to_repairer(user_email text, user_id uuid) SET search_path = '';
ALTER FUNCTION public.auto_archive_certificate(certificate_id uuid) SET search_path = '';
ALTER FUNCTION public.auto_archive_receipt(transaction_id uuid) SET search_path = '';
ALTER FUNCTION public.auto_assign_quote_to_paid_repairer(quote_id_param uuid) SET search_path = '';
ALTER FUNCTION public.calculate_invoice_hash(invoice_data jsonb) SET search_path = 'public';
ALTER FUNCTION public.can_create_subdomain(user_id uuid) SET search_path = '';
ALTER FUNCTION public.cleanup_expired_conversations() SET search_path = '';
ALTER FUNCTION public.create_admin_user(user_email text, admin_user_id uuid) SET search_path = 'public';
ALTER FUNCTION public.create_invoice_chain() SET search_path = 'public';

-- Fonctions de génération
ALTER FUNCTION public.generate_invoice_number(repairer_uuid uuid) SET search_path = '';

-- Fonctions d'accès
ALTER FUNCTION public.get_admin_subscription_overview() SET search_path = 'public';
ALTER FUNCTION public.has_admin_role(user_id uuid) SET search_path = 'public';
ALTER FUNCTION public.has_local_seo_access(user_id uuid) SET search_path = '';
ALTER FUNCTION public.has_module_access(user_id uuid, module_name text) SET search_path = '';
ALTER FUNCTION public.has_paid_subscription(repairer_user_id uuid) SET search_path = 'public';
ALTER FUNCTION public.has_shopify_ecommerce_access(user_id uuid) SET search_path = '';
ALTER FUNCTION public.has_shopify_pos_access(user_id uuid) SET search_path = '';

-- Triggers
ALTER FUNCTION public.handle_updated_at() SET search_path = '';
ALTER FUNCTION public.set_nf203_deletion_date() SET search_path = '';
ALTER FUNCTION public.set_owner_and_timestamps() SET search_path = '';
ALTER FUNCTION public.set_suppliers_created_by() SET search_path = '';
ALTER FUNCTION public.sync_inventory_stock() SET search_path = '';
ALTER FUNCTION public.trigger_auto_archive_receipt() SET search_path = '';
ALTER FUNCTION public.trigger_auto_assign_quote() SET search_path = '';
ALTER FUNCTION public.validate_module_pricing() SET search_path = '';