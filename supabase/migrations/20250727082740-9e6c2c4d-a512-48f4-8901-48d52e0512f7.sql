-- Ajouter le champ customer_phone_fixed à la table repair_devices
ALTER TABLE public.repair_devices 
ADD COLUMN customer_phone_fixed text;