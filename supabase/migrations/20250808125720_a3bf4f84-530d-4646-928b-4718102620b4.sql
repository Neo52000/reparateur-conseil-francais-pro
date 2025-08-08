-- Ensure RLS is enabled and admins can manage suppliers directory
-- This fixes 404 on insert due to missing/denied RLS policies

-- Enable Row Level Security (safe if already enabled)
ALTER TABLE public.suppliers_directory ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to do everything on suppliers_directory
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'suppliers_directory' 
      AND policyname = 'Admins can manage suppliers directory'
  ) THEN
    CREATE POLICY "Admins can manage suppliers directory"
    ON public.suppliers_directory
    FOR ALL
    USING (public.get_current_user_role() = 'admin')
    WITH CHECK (public.get_current_user_role() = 'admin');
  END IF;
END $$;

-- Optionally, allow public read of active suppliers (keeps existing GETs working if used outside admin)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'suppliers_directory' 
      AND policyname = 'Public can view active suppliers'
  ) THEN
    CREATE POLICY "Public can view active suppliers"
    ON public.suppliers_directory
    FOR SELECT
    USING (status = 'active');
  END IF;
END $$;