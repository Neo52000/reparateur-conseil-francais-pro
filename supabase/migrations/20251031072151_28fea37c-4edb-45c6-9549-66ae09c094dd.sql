-- Désactiver le chatbot globalement (structure key-value)
UPDATE public.chatbot_configuration 
SET 
  config_value = '"false"'::jsonb,
  updated_at = now(),
  updated_by = auth.uid()
WHERE config_key = 'chatbot_enabled';

-- Si la clé n'existe pas, la créer
INSERT INTO public.chatbot_configuration (config_key, config_value, description, updated_at)
SELECT 
  'chatbot_enabled',
  '"false"'::jsonb,
  'Active ou désactive le chatbot globalement',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.chatbot_configuration WHERE config_key = 'chatbot_enabled'
);