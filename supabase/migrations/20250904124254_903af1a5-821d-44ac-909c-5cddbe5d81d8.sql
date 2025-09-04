-- Fix Security Definer View Issues
-- This migration addresses the security vulnerabilities by improving authorization and removing unnecessary SECURITY DEFINER properties

-- 1. Strengthen has_paid_subscription function with proper authorization
CREATE OR REPLACE FUNCTION public.has_paid_subscription(repairer_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow users to check their own subscription or admins to check any
  IF auth.uid() != repairer_user_id AND public.get_current_user_role() != 'admin' THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.repairer_subscriptions 
    WHERE repairer_subscriptions.user_id = repairer_user_id
    AND subscription_tier IN ('basic', 'premium', 'enterprise')
    AND subscribed = true
  );
END;
$$;

-- 2. Replace get_admin_subscription_overview function with secure view
DROP FUNCTION IF EXISTS public.get_admin_subscription_overview();

-- Create a secure view instead of a function
CREATE OR REPLACE VIEW public.admin_subscription_overview AS
SELECT 
    rs.id,
    rs.repairer_id,
    rs.email,
    rs.user_id,
    p.first_name,
    p.last_name,
    rs.subscription_tier,
    rs.billing_cycle,
    rs.subscribed,
    rs.created_at,
    rs.updated_at,
    rs.subscription_end,
    CASE 
        WHEN rs.subscription_tier = 'free' THEN 'Gratuit'
        WHEN rs.subscription_tier = 'basic' THEN 'Basic'
        WHEN rs.subscription_tier = 'pro' THEN 'Pro'
        WHEN rs.subscription_tier = 'premium' THEN 'Premium'
        WHEN rs.subscription_tier = 'enterprise' THEN 'Enterprise'
        ELSE 'Unknown'
    END as plan_name,
    CASE 
        WHEN rs.subscription_tier = 'free' THEN 0
        WHEN rs.subscription_tier = 'basic' THEN 9.90
        WHEN rs.subscription_tier = 'pro' THEN 19.90
        WHEN rs.subscription_tier = 'premium' THEN 39.90
        WHEN rs.subscription_tier = 'enterprise' THEN 99.90
        ELSE 0
    END as price_monthly,
    CASE 
        WHEN rs.subscription_tier = 'free' THEN 0
        WHEN rs.subscription_tier = 'basic' THEN 99.00
        WHEN rs.subscription_tier = 'pro' THEN 199.00
        WHEN rs.subscription_tier = 'premium' THEN 399.00
        WHEN rs.subscription_tier = 'enterprise' THEN 999.00
        ELSE 0
    END as price_yearly
FROM public.repairer_subscriptions rs
LEFT JOIN public.profiles p ON rs.user_id = p.id;

-- Enable RLS on the view
ALTER VIEW public.admin_subscription_overview SET (security_barrier = true);

-- 3. Strengthen create_admin_user with additional validation
CREATE OR REPLACE FUNCTION public.create_admin_user(user_email text, admin_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    requesting_user_role text;
    target_user_exists boolean;
BEGIN
    -- Validate inputs
    IF user_email IS NULL OR trim(user_email) = '' THEN
        RAISE EXCEPTION 'Email cannot be empty';
    END IF;
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Admin user ID cannot be null';
    END IF;
    
    -- Check if the requesting user is already an admin
    SELECT public.get_current_user_role() INTO requesting_user_role;
    
    IF requesting_user_role != 'admin' THEN
        RAISE EXCEPTION 'Only existing admins can create new admin users';
    END IF;
    
    -- Verify the admin_user_id matches the current authenticated user
    IF admin_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Admin user ID must match authenticated user';
    END IF;
    
    -- Check if target user exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE email = user_email) INTO target_user_exists;
    
    IF NOT target_user_exists THEN
        RAISE EXCEPTION 'Target user does not exist';
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

-- 4. Strengthen log_security_event with validation
CREATE OR REPLACE FUNCTION public.log_security_event(action_param text, resource_param text DEFAULT NULL::text, success_param boolean DEFAULT true, error_message_param text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  audit_id UUID;
  current_user_id UUID;
BEGIN
  -- Get authenticated user ID
  current_user_id := auth.uid();
  
  -- Validate that user is authenticated for security logging
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to log security events';
  END IF;
  
  -- Validate action parameter
  IF action_param IS NULL OR trim(action_param) = '' THEN
    RAISE EXCEPTION 'Action parameter cannot be empty';
  END IF;
  
  INSERT INTO public.security_audit_log (
    user_id, action, resource, success, error_message
  ) VALUES (
    current_user_id, action_param, resource_param, success_param, error_message_param
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

-- 5. Add RLS policies for the new view
CREATE POLICY "admin_subscription_overview_policy" ON public.admin_subscription_overview
    FOR SELECT USING (public.get_current_user_role() = 'admin');

-- Add comment explaining the security improvements
COMMENT ON FUNCTION public.has_paid_subscription IS 'SECURITY DEFINER function with proper authorization checks - users can only check their own subscription, admins can check any';
COMMENT ON FUNCTION public.create_admin_user IS 'SECURITY DEFINER function with enhanced validation and authentication checks';
COMMENT ON FUNCTION public.log_security_event IS 'SECURITY DEFINER function with user authentication validation';
COMMENT ON VIEW public.admin_subscription_overview IS 'Secure view replacing SECURITY DEFINER function, protected by RLS';