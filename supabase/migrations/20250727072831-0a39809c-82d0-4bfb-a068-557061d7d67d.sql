-- Ajouter les champs de sécurité et codes dans repair_devices
ALTER TABLE public.repair_devices 
ADD COLUMN pin_code TEXT,
ADD COLUMN sim_code TEXT,
ADD COLUMN lock_pattern TEXT,
ADD COLUMN security_notes TEXT;

-- Ajouter des commentaires pour clarifier l'usage
COMMENT ON COLUMN public.repair_devices.pin_code IS 'Code PIN de déverrouillage de l''appareil';
COMMENT ON COLUMN public.repair_devices.sim_code IS 'Code PIN de la carte SIM';
COMMENT ON COLUMN public.repair_devices.lock_pattern IS 'Modèle de verrouillage (9 points) ou code de déverrouillage';
COMMENT ON COLUMN public.repair_devices.security_notes IS 'Notes supplémentaires sur les codes de sécurité';