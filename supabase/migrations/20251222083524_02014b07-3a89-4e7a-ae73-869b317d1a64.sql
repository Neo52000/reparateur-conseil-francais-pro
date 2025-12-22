-- Add unique constraint on phone column for upsert operations
ALTER TABLE public.repairers 
ADD CONSTRAINT repairers_phone_unique UNIQUE (phone);