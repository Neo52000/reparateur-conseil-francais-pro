-- Vérifier si la fonction edge generate-static-page-content existe et test des APIs
SELECT 
  'Edge Function Test' as test_type,
  'generate-static-page-content' as function_name,
  'Checking if function exists...' as status;