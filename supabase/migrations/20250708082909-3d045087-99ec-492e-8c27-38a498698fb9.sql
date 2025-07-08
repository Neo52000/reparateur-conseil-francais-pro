-- Ajouter la colonne landing_page_id dans la table subdomains pour lier à landing_pages
ALTER TABLE public.subdomains 
ADD COLUMN landing_page_id UUID REFERENCES public.landing_pages(id) ON DELETE SET NULL;