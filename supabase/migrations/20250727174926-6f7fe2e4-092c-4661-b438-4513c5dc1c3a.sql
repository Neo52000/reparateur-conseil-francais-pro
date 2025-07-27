-- Add parent_id column to footer_configuration for sub-sections
ALTER TABLE public.footer_configuration 
ADD COLUMN parent_id UUID REFERENCES public.footer_configuration(id) ON DELETE CASCADE;