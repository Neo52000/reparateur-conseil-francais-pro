-- Corriger les fonctions avec search_path mutable
ALTER FUNCTION public.update_qualirepar_updated_at() SET search_path = '';
ALTER FUNCTION public.update_quote_tracking_updated_at() SET search_path = '';
ALTER FUNCTION public.update_qualirepar_catalog_updated_at() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';