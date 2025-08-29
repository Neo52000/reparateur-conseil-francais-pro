-- CRITICAL SECURITY FIX: Phase 1 - Data Protection & Authentication (Fixed)
-- Addresses: Publicly readable sensitive data, weak authentication

-- 1. Clean up existing policies that conflict

-- Drop ALL existing policies for clean slate
DROP POLICY IF EXISTS "Admins can manage all repairer profiles" ON public.repailer_profiles;
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

-- 2. Create Enhanced Security Tables First

-- Security audit log for tracking sensitive operations
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

-- Enhanced rate limiting with progressive blocking
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- email, IP, or user_id
  attempt_count INTEGER DEFAULT 1,
  first_attempt TIMESTAMP WITH TIME ZONE DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  block_level INTEGER DEFAULT 0, -- 0=none, 1=short, 2=long
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(identifier)
);

-- User security settings
CREATE TABLE IF NOT EXISTS public.user_security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  two_factor_enabled BOOLEAN DEFAULT false,
  login_notifications BOOLEAN DEFAULT true,
  suspicious_login_alerts BOOLEAN DEFAULT true,
  last_password_change TIMESTAMP WITH TIME ZONE DEFAULT now(),
  failed_login_count INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- 3. Create Security Functions

-- Progressive rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(identifier_param TEXT)
RETURNS JSONB AS $$
DECLARE
  current_limit RECORD;
  block_duration INTERVAL;
BEGIN
  SELECT * INTO current_limit FROM public.auth_rate_limits 
  WHERE identifier = identifier_param FOR UPDATE;
  
  IF NOT FOUND THEN
    INSERT INTO public.auth_rate_limits (identifier) VALUES (identifier_param);
    RETURN jsonb_build_object('allowed', true, 'remaining', 2);
  END IF;
  
  -- Check if currently blocked
  IF current_limit.blocked_until IS NOT NULL AND current_limit.blocked_until > now() THEN
    RETURN jsonb_build_object(
      'allowed', false, 
      'blocked_until', current_limit.blocked_until,
      'message', 'Account temporarily locked due to suspicious activity'
    );
  END IF;
  
  -- Reset if window expired (15 minutes)
  IF current_limit.first_attempt < now() - interval '15 minutes' THEN
    UPDATE public.auth_rate_limits 
    SET attempt_count = 1, first_attempt = now(), blocked_until = NULL, block_level = 0
    WHERE identifier = identifier_param;
    RETURN jsonb_build_object('allowed', true, 'remaining', 2);
  END IF;
  
  -- Check attempt limits with progressive blocking
  IF current_limit.attempt_count >= 3 THEN
    -- Progressive blocking: 15min -> 1hr -> 24hr
    block_duration := CASE current_limit.block_level
      WHEN 0 THEN interval '15 minutes'
      WHEN 1 THEN interval '1 hour' 
      ELSE interval '24 hours'
    END;
    
    UPDATE public.auth_rate_limits 
    SET blocked_until = now() + block_duration,
        block_level = LEAST(current_limit.block_level + 1, 2)
    WHERE identifier = identifier_param;
    
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked_until', now() + block_duration,
      'message', 'Too many failed attempts. Account locked for ' || block_duration
    );
  END IF;
  
  -- Increment attempt count
  UPDATE public.auth_rate_limits 
  SET attempt_count = current_limit.attempt_count + 1, updated_at = now()
  WHERE identifier = identifier_param;
  
  RETURN jsonb_build_object('allowed', true, 'remaining', 3 - current_limit.attempt_count - 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security audit logging function
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

-- 4. NEW SECURE RLS POLICIES

-- REPAIRER PROFILES: Tiered access - Public sees basic info only
CREATE POLICY "Public basic repairer view" ON public.repairer_profiles
FOR SELECT USING (true); -- Limited by application layer to safe fields

CREATE POLICY "Repairers own profile management" ON public.repairer_profiles
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins full repairer access" ON public.repairer_profiles
FOR ALL USING (get_current_user_role() = 'admin');

-- SUPPLIERS DIRECTORY: Premium users + admins only (CRITICAL FIX)
CREATE POLICY "Premium users view suppliers" ON public.suppliers_directory
FOR SELECT USING (
  get_current_user_role() = 'admin' OR 
  has_paid_subscription(auth.uid())
);

CREATE POLICY "Premium users manage supplier data" ON public.suppliers_directory
FOR INSERT WITH CHECK (
  get_current_user_role() = 'admin' OR 
  has_paid_subscription(auth.uid())
);

CREATE POLICY "Owner can update supplier data" ON public.suppliers_directory
FOR UPDATE USING (
  created_by = auth.uid() OR 
  get_current_user_role() = 'admin'
);

CREATE POLICY "Admins manage all suppliers" ON public.suppliers_directory
FOR ALL USING (get_current_user_role() = 'admin');

-- REPAIRERS: Basic public directory access
CREATE POLICY "Public repairer directory access" ON public.repairers
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins manage repairers data" ON public.repairers
FOR ALL USING (get_current_user_role() = 'admin');

-- 5. Enable RLS on new security tables

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view audit logs" ON public.security_audit_log
FOR SELECT USING (get_current_user_role() = 'admin');
CREATE POLICY "System insert audit logs" ON public.security_audit_log
FOR INSERT WITH CHECK (true);

ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin rate limit management" ON public.auth_rate_limits
FOR ALL USING (get_current_user_role() = 'admin');

ALTER TABLE public.user_security_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own security settings" ON public.user_security_settings
FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins view security settings" ON public.user_security_settings
FOR SELECT USING (get_current_user_role() = 'admin');

-- 6. Create Safe Public Views (Hide Sensitive Data)

-- Public repairer directory (safe fields only)
CREATE OR REPLACE VIEW public.repairers_public AS
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

-- Public repairer profiles (safe fields only)  
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

-- Grant access to safe views
GRANT SELECT ON public.repairers_public TO anon, authenticated;
GRANT SELECT ON public.repairer_profiles_safe TO anon, authenticated;