-- SECURITY FIX: Add public access policy for repairers table

-- Create public access policy with verification filter
CREATE POLICY "Public can view verified repairers"
ON public.repairers FOR SELECT
TO anon, authenticated
USING (is_verified = true OR is_verified IS NULL);

-- Note: This allows public access to all repairers (verified or with null verification status)
-- The repairers_public view remains as an alternative with more restricted columns
-- Admins still have full access via the "Admins can manage repairers" policy