-- Forcer la mise à jour du cache de schéma Supabase
-- Recréer la colonne pour forcer le refresh du cache
ALTER TABLE public.repair_devices 
DROP COLUMN IF EXISTS customer_phone_fixed;

ALTER TABLE public.repair_devices 
ADD COLUMN customer_phone_fixed text;