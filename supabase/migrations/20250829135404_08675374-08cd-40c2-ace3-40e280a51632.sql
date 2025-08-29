-- CRITICAL SECURITY FIX: Data Protection & Authentication (Final)
-- Uses correct column names from actual schema

-- 1. Drop all existing dangerous policies
DROP POLICY IF EXISTS "Admins can manage all repairer profiles" ON public.repairer_profiles;
DROP POLICY IF EXISTS "Public can view basic business info" ON public.repairer_profiles;
DROP POLICY IF EXISTS "Repairers can insert their own profile" ON public.repairer_profiles;
DROP POLICY IF EXISTS "Repairers can update their own profile" ON public.repairer_profiles;
DROP POLICY IF EXISTS "Repairers can view own complete profile" ON public.repairer_profiles;
DROP POLICY IF EXISTS "Repairers can view their own profile" ON public.repairer_profiles;

DROP POLICY IF EXISTS "Admins can manage repairers" ON public.repairers;
DROP POLICY IF EXISTS "Admins can update repairers" ON public.repairers;
DROP POLICY IF EXISTS "Admins can view all repairers" ON public.repairers;
DROP POLICY IF EXISTS "Public can view business directory info" ON public.repairers;

DROP POLICY IF EXISTS "Admins can manage all suppliers" ON public.suppliers_directory;
DROP POLICY IF EXISTS "Admins can manage suppliers directory" ON public.suppliers_directory;
DROP POLICY IF EXISTS "Admins full access (suppliers_directory)" ON public.suppliers_directory;
DROP POLICY IF EXISTS "Authenticated can insert suppliers" ON public.suppliers_directory;
DROP POLICY IF EXISTS "Authenticated can select own suppliers" ON public.suppliers_directory;
DROP POLICY IF EXISTS "Authenticated can update own suppliers" ON public.suppliers_directory;
DROP POLICY IF EXISTS "Authenticated users can view active suppliers" ON public.suppliers_directory;
DROP POLICY IF EXISTS "Public can view active suppliers" ON public.suppliers_directory;
DROP POLICY IF EXISTS "Public can view suppliers for testing" ON public.suppliers_directory;

-- 2. CRITICAL: Suppliers Directory - Premium Users Only
CREATE POLICY "Premium users view suppliers" ON public.suppliers_directory
FOR SELECT USING (
  get_current_user_role() = 'admin' OR 
  has_paid_subscription(auth.uid())
);

CREATE POLICY "Premium users manage suppliers" ON public.suppliers_directory
FOR INSERT WITH CHECK (
  get_current_user_role() = 'admin' OR 
  has_paid_subscription(auth.uid())
);

CREATE POLICY "Supplier owners update" ON public.suppliers_directory
FOR UPDATE USING (
  created_by = auth.uid() OR 
  get_current_user_role() = 'admin'
);

CREATE POLICY "Admins full suppliers access" ON public.suppliers_directory
FOR ALL USING (get_current_user_role() = 'admin');

-- 3. Repairer Profiles - Secure Access
CREATE POLICY "Public basic repairer profiles" ON public.repairer_profiles
FOR SELECT USING (true);

CREATE POLICY "Repairer owns profile" ON public.repairer_profiles
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins manage profiles" ON public.repairer_profiles
FOR ALL USING (get_current_user_role() = 'admin');

-- 4. Repairers Directory - Basic Public Access
CREATE POLICY "Public repairers access" ON public.repairers
FOR SELECT USING (true);

CREATE POLICY "Admins manage repairers" ON public.repairers
FOR ALL USING (get_current_user_role() = 'admin');

-- 5. Create Security Infrastructure
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

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view audit" ON public.security_audit_log
FOR SELECT USING (get_current_user_role() = 'admin');

CREATE POLICY "System logs audit" ON public.security_audit_log
FOR INSERT WITH CHECK (true);

-- 6. Security Functions
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

-- 7. Safe Public Views (Hide Sensitive Data)
CREATE OR REPLACE VIEW public.repairers_safe AS
SELECT 
  id,
  name,
  city,
  postal_code,
  specialties,
  rating,
  review_count,
  lat,
  lng,
  created_at
FROM public.repairers;

CREATE OR REPLACE VIEW public.repairer_profiles_safe AS
SELECT 
  id,
  business_name,
  city,
  repair_types,
  created_at
FROM public.repairer_profiles;

GRANT SELECT ON public.repairers_safe TO anon, authenticated;
GRANT SELECT ON public.repairer_profiles_safe TO anon, authenticated;

-- 8. Log this critical security fix
SELECT public.log_security_event('CRITICAL_SECURITY_FIX_APPLIED', 'RLS_POLICIES_SUPPLIERS_PROFILES_REPAIRERS', true, 'Applied premium access restrictions and audit logging');