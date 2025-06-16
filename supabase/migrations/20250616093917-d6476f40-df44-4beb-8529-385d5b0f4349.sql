
-- Mettre à jour la contrainte de vérification pour inclure 'free_months'
ALTER TABLE public.promo_codes 
DROP CONSTRAINT IF EXISTS promo_codes_discount_type_check;

ALTER TABLE public.promo_codes 
ADD CONSTRAINT promo_codes_discount_type_check 
CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_months'));
