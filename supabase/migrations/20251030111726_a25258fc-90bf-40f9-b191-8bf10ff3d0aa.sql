-- ✅ SECURITY FIX: Restrict public access to repairer_profiles and repairers tables

-- 1. Fix repairer_profiles table - Remove overly permissive public policy
-- The table doesn't have is_verified column, so we remove public access entirely
-- Public can access basic info through the repairers table instead
DROP POLICY IF EXISTS "Public basic repairer profiles" ON public.repairer_profiles;

-- Keep existing secure policies:
-- - "Admins manage profiles" - admins can do anything
-- - "Repairer owns profile" - repairers can manage own profile

-- Add a read-only policy for authenticated users to view profiles
CREATE POLICY "Authenticated users can view all profiles"
ON public.repairer_profiles
FOR SELECT
TO authenticated
USING (true);

-- 2. Fix repairers table - Remove overly permissive policy, keep only the filtered one
DROP POLICY IF EXISTS "Public repairers access" ON public.repairers;

-- Keep the existing "Public can view verified repairers" policy which is more restrictive:
-- It uses: USING ((is_verified = true) OR (is_verified IS NULL))

-- Log the security fix
DO $$
BEGIN
  RAISE NOTICE 'Security policies updated: Removed overly permissive public access from repairer_profiles and repairers tables';
END $$;