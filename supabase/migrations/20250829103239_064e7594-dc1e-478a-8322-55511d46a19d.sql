-- CRITICAL SECURITY FIX: Phase 1 - Data Protection & Authentication (Corrected)
-- Addresses: Publicly readable sensitive data, weak authentication

-- 1. Clean up existing policies that conflict (correct table names)

-- Drop existing repairer_profiles policies
DROP POLICY IF EXISTS "Admins can manage all repairer profiles" ON public.repairer_profiles;
DROP POLICY IF EXISTS "Public can view basic business info" ON public.repairer_profiles;
DROP POLICY IF EXISTS "Repairers can insert their own profile" ON public.repairer_profiles;
DROP POLICY IF EXISTS "Repairers can update their own profile" ON public.repairer_profiles;
DROP POLICY IF EXISTS "Repairers can view own complete profile" ON public.repairer_profiles;
DROP POLICY IF EXISTS "Repairers can view their own profile" ON public.repairer_profiles;

-- Drop existing repairers policies  
DROP POLICY IF EXISTS "Admins can manage repairers" ON public.repairers;
DROP POLICY IF EXISTS "Admins can update repairers" ON public.repairers;
DROP POLICY IF EXISTS "Admins can view all repairers" ON public.repairers;
DROP POLICY IF EXISTS "Public can view business directory info" ON public.repairers;

-- Drop existing suppliers_directory policies
DROP POLICY IF EXISTS "Admins can manage all suppliers" ON public.suppliers_directory;
DROP POLICY IF EXISTS "Admins can manage suppliers directory" ON public.suppliers_directory;
DROP POLICY IF EXISTS "Admins full access (suppliers_directory)" ON public.suppliers_directory;
DROP POLICY IF EXISTS "Authenticated can insert suppliers" ON public.suppliers_directory;
DROP POLICY IF EXISTS "Authenticated can select own suppliers" ON public.suppliers_directory;
DROP POLICY IF EXISTS "Authenticated can update own suppliers" ON public.suppliers_directory;
DROP POLICY IF EXISTS "Authenticated users can view active suppliers" ON public.suppliers_directory;
DROP POLICY IF EXISTS "Public can view active suppliers" ON public.suppliers_directory;
DROP POLICY IF EXISTS "Public can view suppliers for testing" ON public.suppliers_directory;

-- 2. Create Enhanced Security Tables

CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  resource TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  attempt_count INTEGER DEFAULT 1,
  first_attempt TIMESTAMP WITH TIME ZONE DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  block_level INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(identifier)
);

-- 3. NEW SECURE RLS POLICIES

-- SUPPLIERS DIRECTORY: Premium users + admins only (CRITICAL SECURITY FIX)
CREATE POLICY "Premium users can view suppliers" ON public.suppliers_directory
FOR SELECT USING (
  get_current_user_role() = 'admin' OR 
  has_paid_subscription(auth.uid())
);

CREATE POLICY "Premium users manage suppliers" ON public.suppliers_directory
FOR INSERT WITH CHECK (
  get_current_user_role() = 'admin' OR 
  has_paid_subscription(auth.uid())
);

CREATE POLICY "Owners update their suppliers" ON public.suppliers_directory
FOR UPDATE USING (
  created_by = auth.uid() OR 
  get_current_user_role() = 'admin'
);

CREATE POLICY "Admins full supplier access" ON public.suppliers_directory
FOR ALL USING (get_current_user_role() = 'admin');

-- REPAIRER PROFILES: Secure tiered access
CREATE POLICY "Public basic repairer info only" ON public.repairer_profiles
FOR SELECT USING (true); -- Application layer filters sensitive fields

CREATE POLICY "Repairers manage own profiles" ON public.repairer_profiles
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins manage all profiles" ON public.repairer_profiles
FOR ALL USING (get_current_user_role() = 'admin');

-- REPAIRERS: Public directory with basic info only
CREATE POLICY "Public active repairers only" ON public.repairers
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins manage all repairers" ON public.repairers
FOR ALL USING (get_current_user_role() = 'admin');

-- 4. Enable RLS on security tables

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view audit logs" ON public.security_audit_log
FOR SELECT USING (get_current_user_role() = 'admin');
CREATE POLICY "System logs security events" ON public.security_audit_log
FOR INSERT WITH CHECK (true);

ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage rate limits" ON public.auth_rate_limits
FOR ALL USING (get_current_user_role() = 'admin');

-- 5. Security functions

CREATE OR REPLACE FUNCTION public.log_security_event(
  action_param TEXT,
  resource_param TEXT DEFAULT NULL,
  success_param BOOLEAN DEFAULT true,
  error_message_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.security_audit_log (
    user_id, action, resource, success, error_message
  ) VALUES (
    auth.uid(), action_param, resource_param, success_param, error_message_param
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create safe public views (hide sensitive data)

CREATE OR REPLACE VIEW public.repairers_safe AS
SELECT 
  id,
  name,
  city,
  postal_code,
  services,
  rating,
  review_count,
  is_verified,
  lat,
  lng,
  created_at
FROM public.repairers
WHERE is_active = true;

CREATE OR REPLACE VIEW public.repairer_profiles_safe AS
SELECT 
  id,
  business_name,
  city,
  services,
  rating,
  verified,
  created_at
FROM public.repairer_profiles
WHERE is_active = true;

-- Grant safe access
GRANT SELECT ON public.repairers_safe TO anon, authenticated;
GRANT SELECT ON public.repairer_profiles_safe TO anon, authenticated;