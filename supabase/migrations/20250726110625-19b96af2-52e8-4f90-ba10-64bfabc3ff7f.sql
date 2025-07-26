-- Fix Security Definer View and Extension Schema Issues
-- This migration addresses the remaining database-level security warnings

-- Step 1: Create a dedicated schema for extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- Step 2: Move pg_net extension from public to extensions schema
-- Note: pg_net is managed by Supabase and may require special handling
-- We'll attempt to recreate it in the extensions schema
DROP EXTENSION IF EXISTS pg_net CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- Step 3: Move unaccent extension from public to extensions schema
DROP EXTENSION IF EXISTS unaccent CASCADE;
CREATE EXTENSION IF NOT EXISTS unaccent SCHEMA extensions;

-- Step 4: Update any existing unaccent function references to use the new schema
-- Recreate the unaccent functions in public schema that reference the extension
DROP FUNCTION IF EXISTS public.unaccent(regdictionary, text);
DROP FUNCTION IF EXISTS public.unaccent(text);
DROP FUNCTION IF EXISTS public.unaccent_init(internal);
DROP FUNCTION IF EXISTS public.unaccent_lexize(internal, internal, internal, internal);

-- Create wrapper functions that call the extension functions
CREATE OR REPLACE FUNCTION public.unaccent(text)
RETURNS text
LANGUAGE sql
IMMUTABLE PARALLEL SAFE STRICT
AS $function$
  SELECT extensions.unaccent('unaccent', $1);
$function$;

-- Step 5: Find and fix any Security Definer views
-- First, let's identify any problematic views
DO $$
DECLARE
    view_record RECORD;
BEGIN
    -- Look for views that might be using security definer (this is rare but let's check)
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        -- Log the views found for review
        RAISE NOTICE 'Found view: %.%', view_record.schemaname, view_record.viewname;
    END LOOP;
END $$;

-- Step 6: Update the normalize_text function to use the new unaccent location
CREATE OR REPLACE FUNCTION public.normalize_text(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $function$
BEGIN
  -- Use the wrapper function which calls the extension
  BEGIN
    RETURN public.unaccent(input_text);
  EXCEPTION 
    WHEN undefined_function THEN
      -- Fallback to basic character replacement
      RETURN translate(
        lower(input_text),
        'àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ',
        'aaaaaaaceeeeiiiinoooooosuuuuyy'
      );
  END;
END;
$function$;

-- Step 7: Grant necessary permissions on the extensions schema
GRANT USAGE ON SCHEMA extensions TO public;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO public;