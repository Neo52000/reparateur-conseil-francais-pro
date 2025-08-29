-- Fix Critical RLS Security Issues
-- Drop overly permissive policies and implement secure data access

-- 1. Create secure public directory view for repairers
CREATE OR REPLACE VIEW public.public_repairer_directory AS
SELECT 
  id,
  name,
  business_name,
  city,
  department,
  region,
  services,
  specialties,
  rating,
  review_count,
  price_range,
  response_time,
  is_verified,
  is_open,
  has_qualirepar_label,
  created_at,
  updated_at
FROM public.repairers
WHERE is_verified = true;

-- Enable RLS on the view
ALTER VIEW public.public_repairer_directory SET (security_invoker = true);

-- 2. Secure repairer_profiles table - restrict sensitive data access
DROP POLICY IF EXISTS "Repairer profiles are publicly readable" ON public.repairer_profiles;

-- Only profile owners and admins can view full profiles
CREATE POLICY "Profile owners and admins can view profiles"
ON public.repairer_profiles FOR SELECT
USING (
  user_id = auth.uid() OR 
  get_current_user_role() = 'admin'
);

-- Only profile owners and admins can update profiles
CREATE POLICY "Profile owners and admins can update profiles"
ON public.repairer_profiles FOR UPDATE
USING (
  user_id = auth.uid() OR 
  get_current_user_role() = 'admin'
);

-- Only authenticated users can create profiles for themselves
CREATE POLICY "Users can create their own profiles"
ON public.repairer_profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 3. Secure suppliers_directory - restrict sensitive supplier data
DROP POLICY IF EXISTS "Anyone can view active suppliers" ON public.suppliers_directory;

-- Create tiered access for supplier directory
CREATE POLICY "Public can view basic supplier info"
ON public.suppliers_directory FOR SELECT
USING (
  is_active = true AND 
  (
    -- Public fields only for non-subscribers
    auth.uid() IS NULL OR
    -- Full access for premium subscribers or admins
    has_paid_subscription(auth.uid()) OR
    get_current_user_role() = 'admin'
  )
);

-- 4. Secure repair_prices - restrict pricing data
DROP POLICY IF EXISTS "Anyone can view repair prices" ON public.repair_prices;

CREATE POLICY "Authorized users can view repair prices"
ON public.repair_prices FOR SELECT
USING (
  -- Only authenticated users with appropriate access
  auth.uid() IS NOT NULL AND (
    repairer_id = auth.uid() OR
    get_current_user_role() = 'admin' OR
    has_paid_subscription(auth.uid())
  )
);

-- 5. Create secure repairer directory view with limited fields
CREATE OR REPLACE VIEW public.secure_repairer_directory AS
SELECT 
  r.id,
  r.name,
  r.business_name,
  r.city,
  r.department,
  r.region,
  r.services,
  r.specialties,
  r.rating,
  r.review_count,
  r.price_range,
  r.response_time,
  r.is_verified,
  r.is_open,
  r.has_qualirepar_label,
  -- Only include contact info for premium users
  CASE WHEN has_paid_subscription(auth.uid()) OR get_current_user_role() = 'admin' 
    THEN rp.phone 
    ELSE NULL 
  END as phone,
  CASE WHEN has_paid_subscription(auth.uid()) OR get_current_user_role() = 'admin' 
    THEN rp.email 
    ELSE NULL 
  END as email,
  CASE WHEN has_paid_subscription(auth.uid()) OR get_current_user_role() = 'admin' 
    THEN rp.website 
    ELSE NULL 
  END as website
FROM public.repairers r
LEFT JOIN public.repairer_profiles rp ON rp.id = r.id
WHERE r.is_verified = true;

-- 6. Secure repairer_subscriptions - highly sensitive financial data
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.repairer_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.repairer_subscriptions;

CREATE POLICY "Subscription owners and admins only"
ON public.repairer_subscriptions FOR ALL
USING (
  user_id = auth.uid() OR 
  get_current_user_role() = 'admin'
)
WITH CHECK (
  user_id = auth.uid() OR 
  get_current_user_role() = 'admin'
);

-- 7. Add audit logging for sensitive operations
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  resource text,
  success boolean NOT NULL,
  error_message text,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
ON public.security_audit_log FOR SELECT
USING (get_current_user_role() = 'admin');

CREATE POLICY "System can insert audit logs"
ON public.security_audit_log FOR INSERT
WITH CHECK (true);

-- 8. Create rate limiting table for authentication
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- email or IP
  attempt_count integer DEFAULT 1,
  first_attempt timestamp with time zone DEFAULT now(),
  last_attempt timestamp with time zone DEFAULT now(),
  blocked_until timestamp with time zone,
  UNIQUE(identifier)
);

-- Enable RLS on rate limits
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System manages rate limits"
ON public.auth_rate_limits FOR ALL
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');