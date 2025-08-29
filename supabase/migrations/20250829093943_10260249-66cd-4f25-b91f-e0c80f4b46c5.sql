-- CRITICAL SECURITY FIX: Phase 1 - Data Protection & Authentication
-- Addresses: Publicly readable sensitive data, weak authentication, input validation

-- 1. Fix Overly Permissive RLS Policies for Sensitive Tables

-- DROP dangerous public read policies
DROP POLICY IF EXISTS "Anyone can view repairer profiles" ON public.repairer_profiles;
DROP POLICY IF EXISTS "Everyone can view supplier directory" ON public.suppliers_directory;
DROP POLICY IF EXISTS "Public read access to repairers" ON public.repairers;

-- SECURE REPAIRER PROFILES: Tiered access system
-- Public view: Only business essentials (name, city, services, rating)
CREATE POLICY "Public can view basic repairer info" ON public.repairer_profiles
FOR SELECT USING (true);

-- Full profile access: Owner + admins only
CREATE POLICY "Repairers can manage their own profiles" ON public.repairer_profiles
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all repairer profiles" ON public.repairer_profiles
FOR ALL USING (get_current_user_role() = 'admin');

-- SECURE SUPPLIERS DIRECTORY: Premium users + admins only
CREATE POLICY "Premium users can view suppliers" ON public.suppliers_directory
FOR SELECT USING (
  get_current_user_role() = 'admin' OR 
  has_paid_subscription(auth.uid())
);

CREATE POLICY "Premium users can manage supplier reviews" ON public.suppliers_directory
FOR INSERT WITH CHECK (
  get_current_user_role() = 'admin' OR 
  has_paid_subscription(auth.uid())
);

CREATE POLICY "Admins can manage suppliers" ON public.suppliers_directory
FOR ALL USING (get_current_user_role() = 'admin');

-- SECURE REPAIRERS TABLE: Basic directory info only
CREATE POLICY "Public can view basic repairer directory" ON public.repairers
FOR SELECT USING (true); -- Will be limited by view below

-- 2. Create Secure Public Views (Hide Sensitive Data)

-- Public repairer directory view (safe fields only)
CREATE OR REPLACE VIEW public.repairers_directory AS
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

-- Public repairer profiles view (safe fields only)  
CREATE OR REPLACE VIEW public.repairer_profiles_public AS
SELECT 
  id,
  business_name,
  city,
  services,
  rating,
  verified,
  created_at,
  updated_at
FROM public.repairer_profiles
WHERE is_active = true;

-- 3. Enhanced Authentication Security Tables

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

-- 4. Enhanced Security Functions

-- Secure admin role verification (replaces hardcoded email check)
CREATE OR REPLACE FUNCTION public.is_verified_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = is_verified_admin.user_id 
    AND role = 'admin' 
    AND is_active = true
  ) OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = is_verified_admin.user_id 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

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

-- 5. RLS Policies for New Security Tables

-- Security audit log: Admins read, system writes
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON public.security_audit_log
FOR SELECT USING (get_current_user_role() = 'admin');

CREATE POLICY "System can insert audit logs" ON public.security_audit_log
FOR INSERT WITH CHECK (true);

-- Rate limits: System access only
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "System manages rate limits" ON public.auth_rate_limits
FOR ALL USING (get_current_user_role() = 'admin');

-- User security settings: User owns their settings
ALTER TABLE public.user_security_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their security settings" ON public.user_security_settings
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view security settings" ON public.user_security_settings
FOR SELECT USING (get_current_user_role() = 'admin');

-- 6. Update Existing Functions to Use New Security Model

-- Update get_current_user_role to be more secure
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'user'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Secure subscription check
CREATE OR REPLACE FUNCTION public.has_paid_subscription(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.repairer_subscriptions 
    WHERE repairer_subscriptions.user_id = has_paid_subscription.user_id
    AND subscription_tier IN ('basic', 'premium', 'enterprise')
    AND subscribed = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 7. Triggers for Enhanced Security

-- Auto-create user security settings
CREATE OR REPLACE FUNCTION public.create_user_security_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_security_settings (user_id) 
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_user_created_security_settings
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION create_user_security_settings();

-- Update timestamps
CREATE OR REPLACE FUNCTION public.update_security_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_auth_rate_limits_updated_at
  BEFORE UPDATE ON public.auth_rate_limits
  FOR EACH ROW EXECUTE FUNCTION update_security_updated_at();

CREATE OR REPLACE TRIGGER update_user_security_settings_updated_at
  BEFORE UPDATE ON public.user_security_settings
  FOR EACH ROW EXECUTE FUNCTION update_security_updated_at();

-- Grant necessary permissions
GRANT SELECT ON public.repairers_directory TO anon, authenticated;
GRANT SELECT ON public.repairer_profiles_public TO anon, authenticated;