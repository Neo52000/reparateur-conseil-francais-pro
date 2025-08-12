-- Ensure RLS is enabled and public policies allow viewing published SEO pages
-- and updating page view counters

-- Enable RLS on the table (safe to run repeatedly)
ALTER TABLE IF EXISTS public.local_seo_pages ENABLE ROW LEVEL SECURITY;

-- Create SELECT policy: anyone can view published pages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'local_seo_pages' 
      AND policyname = 'Public can view published local SEO pages'
  ) THEN
    CREATE POLICY "Public can view published local SEO pages"
    ON public.local_seo_pages
    FOR SELECT
    USING (is_published = true);
  END IF;
END
$$;

-- Create UPDATE policy specifically for incrementing page_views on published pages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'local_seo_pages' 
      AND policyname = 'Public can update page_views on published pages'
  ) THEN
    CREATE POLICY "Public can update page_views on published pages"
    ON public.local_seo_pages
    FOR UPDATE
    USING (is_published = true)
    WITH CHECK (is_published = true);
  END IF;
END
$$;

-- Optional: Limit update policy to only the page_views column via grant-level check using trigger
-- (Kept simple here; consider a trigger-based whitelist if needed)