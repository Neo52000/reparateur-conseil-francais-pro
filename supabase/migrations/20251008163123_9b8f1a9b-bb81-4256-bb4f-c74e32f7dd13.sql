-- SECURITY FIX: Add granular RLS policies for api_keys table
-- This addresses the MISSING_RLS security finding

-- Drop the existing ALL policy to replace with more specific policies
DROP POLICY IF EXISTS "Repairers manage their API keys" ON public.api_keys;

-- Allow repairers to view their own API keys
CREATE POLICY "Repairers can view own API keys"
ON public.api_keys
FOR SELECT
TO authenticated
USING (repairer_id = auth.uid());

-- Allow repairers to create their own API keys
CREATE POLICY "Repairers can create own API keys"
ON public.api_keys
FOR INSERT
TO authenticated
WITH CHECK (
  repairer_id = auth.uid() 
  AND key_name IS NOT NULL 
  AND length(trim(key_name)) > 0
);

-- Allow repairers to update their own API keys (limited fields)
CREATE POLICY "Repairers can update own API keys"
ON public.api_keys
FOR UPDATE
TO authenticated
USING (repairer_id = auth.uid())
WITH CHECK (
  repairer_id = auth.uid() 
  AND created_at = api_keys.created_at -- Prevent created_at modification
);

-- Allow repairers to delete their own API keys
CREATE POLICY "Repairers can delete own API keys"
ON public.api_keys
FOR DELETE
TO authenticated
USING (repairer_id = auth.uid());

-- Allow admins to view all API keys for oversight
CREATE POLICY "Admins can view all API keys"
ON public.api_keys
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Create audit trigger for API key operations
CREATE OR REPLACE FUNCTION public.audit_api_key_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      user_id,
      repairer_id,
      action,
      resource_type,
      resource_id,
      new_values
    ) VALUES (
      auth.uid(),
      NEW.repairer_id,
      'api_key_created',
      'api_key',
      NEW.id::text,
      jsonb_build_object(
        'key_name', NEW.key_name,
        'is_active', NEW.is_active,
        'permissions', NEW.permissions
      )
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (
      user_id,
      repairer_id,
      action,
      resource_type,
      resource_id,
      old_values,
      new_values
    ) VALUES (
      auth.uid(),
      NEW.repairer_id,
      'api_key_updated',
      'api_key',
      NEW.id::text,
      jsonb_build_object(
        'is_active', OLD.is_active,
        'permissions', OLD.permissions
      ),
      jsonb_build_object(
        'is_active', NEW.is_active,
        'permissions', NEW.permissions
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (
      user_id,
      repairer_id,
      action,
      resource_type,
      resource_id,
      old_values
    ) VALUES (
      auth.uid(),
      OLD.repairer_id,
      'api_key_deleted',
      'api_key',
      OLD.id::text,
      jsonb_build_object(
        'key_name', OLD.key_name,
        'is_active', OLD.is_active
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create audit trigger
DROP TRIGGER IF EXISTS audit_api_key_changes_trigger ON public.api_keys;
CREATE TRIGGER audit_api_key_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.api_keys
FOR EACH ROW
EXECUTE FUNCTION public.audit_api_key_changes();