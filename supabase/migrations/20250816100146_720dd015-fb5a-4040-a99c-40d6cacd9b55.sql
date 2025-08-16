-- Mettre à jour la configuration du chatbot
UPDATE chatbot_configuration 
SET config_value = 'false' 
WHERE config_key = 'maintenance_mode';

-- Ajouter la configuration du nom du chatbot s'il n'existe pas
INSERT INTO chatbot_configuration (config_key, config_value, description)
VALUES ('chatbot_name', '"Ben"', 'Nom du chatbot affiché dans l''interface')
ON CONFLICT (config_key) DO UPDATE SET config_value = '"Ben"';

-- Ajouter le message de maintenance personnalisé
INSERT INTO chatbot_configuration (config_key, config_value, description)
VALUES ('maintenance_message', '"Je ne peux pas joindre l''IA pour le moment. Voulez-vous consulter notre FAQ ou prendre rendez-vous ?"', 'Message affiché pendant la maintenance')
ON CONFLICT (config_key) DO UPDATE SET config_value = '"Je ne peux pas joindre l''IA pour le moment. Voulez-vous consulter notre FAQ ou prendre rendez-vous ?"';