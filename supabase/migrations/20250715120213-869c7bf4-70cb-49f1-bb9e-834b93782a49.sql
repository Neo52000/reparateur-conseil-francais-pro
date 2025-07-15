-- Ajouter des patterns spécifiques pour les problèmes d'écran
INSERT INTO chatbot_training_data (
  intent, training_text, response_template, category, confidence_threshold, is_active, metadata
) VALUES 
(
  'screen_broken',
  'écran cassé, écran fissuré, écran brisé, mon écran est cassé, écran endommagé, fissure écran, vitre cassée, écran noir, écran éteint, plus d''affichage',
  'Oh non ! 😱 Un écran cassé, c''est vraiment énervant ! Mais bonne nouvelle : c''est le problème le plus courant et nos réparateurs sont des experts là-dessus ! 💪 En général, ça coûte entre 60€ et 150€ selon le modèle. Vous avez quel type de téléphone ?',
  'diagnostic',
  0.75,
  true,
  '{"emotion": "empathy", "cost_range": "60-150", "difficulty": "common", "repair_time": "1-2h"}'
),
(
  'battery_problem',
  'batterie, problème de batterie, batterie vide, se décharge rapidement, plus d''autonomie, batterie défaillante, batterie gonflée',
  'Ah, le problème de batterie ! 🔋 C''est super frustrant quand il faut recharger sans arrêt. Généralement après 2-3 ans c''est normal. Le remplacement coûte entre 40€ et 80€ et ça prend 30 minutes. Depuis quand avez-vous ce problème ?',
  'diagnostic',
  0.75,
  true,
  '{"emotion": "understanding", "cost_range": "40-80", "repair_time": "30min", "common_cause": "battery_aging"}'
),
(
  'phone_wont_turn_on',
  'téléphone qui ne s''allume plus, ne démarre pas, téléphone mort, plus de vie, écran noir complet, ne s''allume pas',
  'Oh là là ! 😰 Un téléphone qui ne s''allume plus, c''est stressant ! Mais ne paniquez pas, dans 80% des cas c''est réparable ! Avez-vous essayé de le laisser charger pendant 30 minutes ? Parfois c''est juste la batterie complètement vide.',
  'diagnostic',
  0.80,
  true,
  '{"emotion": "reassurance", "success_rate": 0.8, "first_aid": "charge_30min", "urgency": "high"}'
),
(
  'general_repair_inquiry',
  'réparation, réparer, faire réparer, réparateur, trouver un réparateur, besoin de réparer',
  'Super ! Je suis là pour vous aider à trouver la meilleure solution ! 🔧 Pour vous donner des conseils précis, pouvez-vous me dire quel est le problème avec votre appareil ?',
  'general',
  0.70,
  true,
  '{"emotion": "helpful", "next_step": "problem_identification"}'
);

-- Mettre à jour l'intent existant pour écran cassé si il y en a un peu spécifique
UPDATE chatbot_training_data 
SET confidence_threshold = 0.70,
    training_text = 'iphone,samsung,xiaomi,huawei,modèle,type,marque',
    response_template = 'Parfait ! Connaître le modèle exact m''aide énormément ! 📱 De quel appareil s''agit-il exactement ? (iPhone, Samsung, Xiaomi, Huawei...)'
WHERE intent = 'identify_device';