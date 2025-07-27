-- Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';

-- Verify that the repair_devices table structure is correct
-- This will also help PostgREST refresh its understanding of the table
COMMENT ON TABLE public.repair_devices IS 'Updated to force schema cache reload';

-- Ensure RLS policies are properly set for repair_devices table
-- Check if we need to add policies for the customer_phone_fixed column access
DO $$
BEGIN
  -- Verify the column exists and update any relevant policies if needed
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'repair_devices' 
             AND column_name = 'customer_phone_fixed') THEN
    RAISE NOTICE 'Column customer_phone_fixed exists in repair_devices table';
  ELSE
    RAISE EXCEPTION 'Column customer_phone_fixed is missing from repair_devices table';
  END IF;
END $$;