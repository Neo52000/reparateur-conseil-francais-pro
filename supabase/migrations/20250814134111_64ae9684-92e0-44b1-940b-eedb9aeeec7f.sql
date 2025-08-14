-- Update chatbot configuration to set maintenance mode off and add Ben configuration
INSERT INTO public.chatbot_configuration (config_key, config_value)
VALUES 
  ('maintenance_mode', false),
  ('chatbot_enabled', true),
  ('chatbot_name', 'Ben'),
  ('maintenance_message', 'Le chatbot est temporairement indisponible pour maintenance.')
ON CONFLICT (config_key) DO UPDATE SET 
  config_value = EXCLUDED.config_value;