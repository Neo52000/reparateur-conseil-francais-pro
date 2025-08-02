-- Drop the existing foreign key constraint
ALTER TABLE public.client_favorites 
DROP CONSTRAINT IF EXISTS client_favorites_repairer_id_fkey;

-- Add the correct foreign key constraint pointing to the repairers table
ALTER TABLE public.client_favorites 
ADD CONSTRAINT client_favorites_repairer_id_fkey 
FOREIGN KEY (repairer_id) REFERENCES public.repairers(id) ON DELETE CASCADE;