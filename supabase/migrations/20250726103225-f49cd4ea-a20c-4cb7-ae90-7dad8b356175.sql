-- Phase 1: Fix Critical Database Security Issues

-- 1. Fix SECURITY DEFINER functions with proper search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = auth.uid();
    
    RETURN COALESCE(user_role, 'user');
END;
$$;

-- 2. Update all other SECURITY DEFINER functions
CREATE OR REPLACE FUNCTION public.can_create_subdomain(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.repairer_subscriptions 
    WHERE repairer_subscriptions.user_id = can_create_subdomain.user_id
      AND subscription_tier IN ('basic', 'pro', 'premium', 'enterprise')
      AND subscribed = true
  );
$$;

CREATE OR REPLACE FUNCTION public.has_module_access(user_id uuid, module_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.module_subscriptions ms
    JOIN public.repairer_subscriptions rs ON rs.user_id = ms.repairer_id
    WHERE ms.repairer_id = user_id
      AND ms.module_type = module_name
      AND ms.module_active = true
      AND ms.payment_status = 'active'
      AND rs.subscription_tier = 'enterprise'
      AND rs.subscribed = true
  );
$$;

CREATE OR REPLACE FUNCTION public.has_pos_permission(staff_user_id uuid, repairer_id uuid, permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.pos_staff_assignments psa
    JOIN public.pos_staff_roles psr ON psa.role_id = psr.id
    WHERE psa.staff_user_id = has_pos_permission.staff_user_id
      AND psa.repairer_id = has_pos_permission.repairer_id
      AND psa.is_active = true
      AND psr.is_active = true
      AND psr.permissions ? permission_name
  );
$$;

CREATE OR REPLACE FUNCTION public.has_local_seo_access(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    -- Vérifier si l'utilisateur est admin
    SELECT 1 
    FROM public.profiles 
    WHERE profiles.id = user_id AND profiles.role = 'admin'
  ) OR EXISTS (
    -- Ou s'il a un abonnement premium/enterprise
    SELECT 1 
    FROM public.repairer_subscriptions 
    WHERE repairer_subscriptions.user_id = user_id
      AND subscription_tier IN ('premium', 'enterprise')
      AND subscribed = true
  );
$$;

-- 3. Create user_roles table for proper role management
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'repairer')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create secure role checking function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  )
$$;

-- 4. Add security audit table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    resource TEXT,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on security audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view security audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- 5. Add rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL, -- IP or user_id
    action TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(identifier, action, window_start)
);

-- Enable RLS on rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limits
CREATE POLICY "Only system can manage rate limits" 
ON public.rate_limits 
FOR ALL 
USING (false)
WITH CHECK (false);

-- 6. Create secure admin management
CREATE OR REPLACE FUNCTION public.create_admin_user(user_email text, admin_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    requesting_user_role text;
BEGIN
    -- Check if the requesting user is already an admin
    SELECT public.get_current_user_role() INTO requesting_user_role;
    
    IF requesting_user_role != 'admin' THEN
        RAISE EXCEPTION 'Only existing admins can create new admin users';
    END IF;
    
    -- Update the profile role
    UPDATE public.profiles 
    SET role = 'admin'
    WHERE email = user_email;
    
    -- Add to user_roles table
    INSERT INTO public.user_roles (user_id, role, assigned_by)
    SELECT p.id, 'admin', admin_user_id
    FROM public.profiles p
    WHERE p.email = user_email
    ON CONFLICT (user_id, role) DO UPDATE SET 
        is_active = true,
        assigned_by = admin_user_id,
        assigned_at = now();
    
    -- Log the action
    INSERT INTO public.security_audit_log (user_id, action, resource, success)
    VALUES (admin_user_id, 'ADMIN_USER_CREATED', user_email, true);
    
    RETURN true;
EXCEPTION WHEN OTHERS THEN
    -- Log the failed attempt
    INSERT INTO public.security_audit_log (user_id, action, resource, success, error_message)
    VALUES (admin_user_id, 'ADMIN_USER_CREATED', user_email, false, SQLERRM);
    
    RETURN false;
END;
$$;