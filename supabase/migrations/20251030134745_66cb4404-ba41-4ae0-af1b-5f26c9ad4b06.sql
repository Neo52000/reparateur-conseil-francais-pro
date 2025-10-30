-- Create secure RPC function for blog automation config
CREATE OR REPLACE FUNCTION public.get_blog_automation_config()
RETURNS SETOF public.blog_automation_config
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND role = 'admin' 
      AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Permission denied: admin role required'
      USING ERRCODE = '42501';
  END IF;
  
  -- Return the config row
  RETURN QUERY
  SELECT * FROM public.blog_automation_config LIMIT 1;
END;
$$;

-- Grant execute permission to authenticated users (function checks admin internally)
GRANT EXECUTE ON FUNCTION public.get_blog_automation_config() TO authenticated;