-- Grant required privileges to authenticated users for suppliers_directory
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers_directory TO authenticated;

-- Also grant on reviews table for completeness (select already used)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers_directory_reviews TO authenticated;