-- Fix missing foreign key relationship between repairers and repairer_subscriptions
-- This will resolve the PGRST200 error in the logs

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  -- Check if the constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'repairer_subscriptions' 
    AND constraint_name = 'repairer_subscriptions_user_id_fkey'
  ) THEN
    -- Add the foreign key constraint
    ALTER TABLE public.repairer_subscriptions 
    ADD CONSTRAINT repairer_subscriptions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END
$$;