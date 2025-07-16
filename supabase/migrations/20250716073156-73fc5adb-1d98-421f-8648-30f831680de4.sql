-- Ajouter plus de données d'entraînement variées et contextuelles pour le chatbot
INSERT INTO public.chatbot_training_data (intent, training_text, response_template, category, confidence_threshold, is_active, metadata) VALUES
-- Variations plus naturelles pour les problèmes d'écran
('screen_broken_varied', 'mon écran est pété, écran fissuré, écran fendu, l''écran s''est cassé, j''ai fait tomber mon phone, l''écran est tout abîmé, écran noir avec des fissures, vitre brisée', 'Oh non ! 😔 Un écran cassé, c''est vraiment embêtant. Je comprends votre frustration. La bonne nouvelle, c''est que c''est réparable ! Pour vous donner un devis précis, j''aurais besoin de connaître le modèle exact de votre téléphone. De quel modèle s''agit-il ?', 'diagnostic', 0.6, true, '{"emotion": "empathy", "follow_up": ["Quel est le modèle ?", "L''écran tactile fonctionne-t-il encore ?", "Y a-t-il des traces colorées ou des lignes ?"], "urgency": "medium"}'),

-- Problèmes de batterie avec plus de nuances
('battery_problem_varied', 'ma batterie tient plus, batterie qui gonfle, mon tel se décharge hyper vite, autonomie pourrie, il faut que je le charge tout le temps, batterie hs', 'Je vois que vous avez des soucis de batterie 🔋 C''est un problème assez courant après quelques années d''usage. Pour mieux vous aider, pouvez-vous me dire depuis quand vous observez ce problème ? Est-ce que ça s''est dégradé progressivement ou d''un coup ?', 'diagnostic', 0.6, true, '{"emotion": "understanding", "follow_up": ["Depuis quand ce problème ?", "Le téléphone chauffe-t-il ?", "Quel âge a votre téléphone ?"], "urgency": "medium"}'),

-- Téléphone qui ne s'allume plus - variations émotionnelles
('phone_dead_varied', 'mon téléphone ne s''allume plus, écran noir total, rien ne se passe quand j''appuie, téléphone mort, plus rien, complètement HS, ne répond plus du tout', 'Oh là là ! 😰 Un téléphone qui ne s''allume plus, c''est le cauchemar ! Pas de panique, on va essayer de voir ce qui se passe. Avant tout, pouvez-vous me dire si ça s''est passé après une chute, un contact avec l''eau, ou si ça s''est arrêté comme ça ?', 'diagnostic', 0.7, true, '{"emotion": "concern", "follow_up": ["Y a-t-il eu une chute ?", "Contact avec l''eau ?", "Le voyant de charge s''allume-t-il ?"], "urgency": "high"}'),

-- Recherche de réparateur avec géolocalisation
('find_repairer_varied', 'où puis-je réparer mon téléphone, réparateur près de moi, qui peut réparer ça, magasin de réparation dans le coin, où aller pour réparer', 'Parfait ! 😊 Je vais vous aider à trouver le meilleur réparateur près de chez vous. Pour cela, j''aurais besoin de connaître votre ville ou votre code postal. Où vous situez-vous ?', 'booking', 0.6, true, '{"emotion": "helpful", "follow_up": ["Quelle est votre ville ?", "Préférez-vous un service rapide ?", "Avez-vous une préférence de quartier ?"], "urgency": "low"}'),

-- Demande de prix avec nuances
('pricing_inquiry_varied', 'combien ça coûte, quel est le prix, c''est cher, tarifs, devis gratuit, prix réparation', 'Excellente question ! 💰 Les tarifs varient selon le modèle et le type de réparation. Pour vous donner un prix exact, j''ai besoin de quelques infos : quel est votre modèle de téléphone et quel type de problème rencontrez-vous ?', 'pricing', 0.6, true, '{"emotion": "professional", "follow_up": ["Quel modèle de téléphone ?", "Quel type de réparation ?", "Souhaitez-vous un devis détaillé ?"], "urgency": "low"}'),

-- Prise de rendez-vous urgente
('urgent_appointment_varied', 'j''ai besoin de réparer vite, c''est urgent, rdv en urgence, le plus tôt possible, j''en ai besoin rapidement', 'Je comprends l''urgence ! ⚡ Nous avons des créneaux d''urgence disponibles. Pour vous proposer le rendez-vous le plus rapide, dites-moi où vous vous trouvez et quel est le problème exact ?', 'booking', 0.7, true, '{"emotion": "urgency", "follow_up": ["Où êtes-vous situé ?", "Quel est le problème ?", "Pouvez-vous vous déplacer ?"], "urgency": "high"}'),

-- Problèmes de connectivité
('connectivity_issues_varied', 'plus de réseau, pas de wifi, bluetooth qui marche pas, plus de 4G, problème de connexion', 'Ah, les problèmes de connectivité ! 📶 C''est embêtant au quotidien. Est-ce que le problème concerne le réseau mobile, le WiFi, ou les deux ? Et depuis quand avez-vous remarqué ça ?', 'diagnostic', 0.6, true, '{"emotion": "understanding", "follow_up": ["Réseau mobile ou WiFi ?", "Depuis quand ?", "Avez-vous fait une mise à jour récemment ?"], "urgency": "medium"}'),

-- Questions sur la garantie
('warranty_question_varied', 'c''est sous garantie, garantie réparation, combien de temps de garantie, sav', 'Très bonne question concernant la garantie ! 📋 Nous offrons effectivement une garantie sur nos réparations. Celle-ci varie selon le type d''intervention. Pouvez-vous me dire quel type de réparation vous envisagez ?', 'information', 0.6, true, '{"emotion": "professional", "follow_up": ["Quel type de réparation ?", "Voulez-vous les détails de garantie ?", "Avez-vous déjà fait réparer chez nous ?"], "urgency": "low"}'),

-- Réparation à domicile
('home_repair_varied', 'réparation à domicile, vous venez chez moi, service à la maison, déplacement possible', 'Super idée ! 🏠 Nous proposons effectivement un service de réparation à domicile pour certaines interventions. C''est très pratique ! Dans quelle zone géographique vous trouvez-vous ?', 'booking', 0.7, true, '{"emotion": "helpful", "follow_up": ["Dans quelle ville ?", "Quel type de réparation ?", "Préférez-vous quel créneau ?"], "urgency": "low"}'),

-- Expressions de frustration
('frustrated_user_varied', 'j''en ai marre, ça m''énerve, c''est nul, pourquoi ça marche jamais, j''ai déjà eu ce problème', 'Je comprends parfaitement votre frustration ! 😔 C''est vraiment agaçant quand la technologie nous pose des problèmes, surtout si c''est récurrent. Prenons le temps de bien identifier le souci pour vous proposer une solution durable. Pouvez-vous me décrire exactement ce qui ne va pas ?', 'emotional_support', 0.7, true, '{"emotion": "empathy", "follow_up": ["Décrivez-moi le problème", "C''est déjà arrivé quand ?", "Qu''avez-vous déjà essayé ?"], "urgency": "low"}'),

-- Félicitations et satisfaction
('satisfied_customer_varied', 'c''est parfait, super service, très bien, je recommande, excellent travail', 'Merci beaucoup ! 🌟 Ça me fait vraiment plaisir d''entendre ça ! Votre satisfaction est notre priorité. N''hésitez pas à revenir vers nous si vous avez d''autres questions ou si vous connaissez quelqu''un qui a besoin de nos services !', 'social', 0.8, true, '{"emotion": "joy", "follow_up": ["Voulez-vous laisser un avis ?", "Besoin d''autre chose ?", "Connaissez-vous notre programme de parrainage ?"], "urgency": "low"}');

-- Insérer des configurations émotionnelles pour le chatbot
INSERT INTO public.chatbot_configuration (config_key, config_value, description) VALUES
('personality_traits', '{"primary": "empathique", "secondary": ["professionnel", "chaleureux", "patient", "optimiste"], "style": "français familier mais respectueux"}', 'Traits de personnalité de Ben'),
('emotional_responses', '{"empathy": ["Je comprends votre frustration", "C''est vraiment embêtant", "Je vois que c''est urgent pour vous"], "joy": ["Parfait !", "Super nouvelle !", "Excellente question !"], "concern": ["Oh là là !", "Pas de panique", "On va s''en occuper"]}', 'Réponses émotionnelles contextuelles'),
('conversation_memory', '{"remember_user": true, "context_window": 10, "personalization": true}', 'Configuration de la mémoire conversationnelle'),
('response_variations', '{"greeting": ["Bonjour !", "Salut !", "Hello !"], "thinking": ["Je réfléchis...", "Laissez-moi voir...", "Un instant..."], "goodbye": ["À bientôt !", "Au revoir !", "Bonne journée !"]}', 'Variations de réponses pour éviter la répétition')

ON CONFLICT (config_key) DO UPDATE SET 
  config_value = EXCLUDED.config_value,
  updated_at = now();