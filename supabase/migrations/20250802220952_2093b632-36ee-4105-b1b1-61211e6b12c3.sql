-- Nettoyage complet des données demo de la base de données

-- Supprimer le compte demo et toutes ses données associées
DELETE FROM repairer_subscriptions WHERE email = 'demo@demo.fr';
DELETE FROM profiles WHERE email = 'demo@demo.fr';

-- Supprimer toutes les données avec source = 'demo'
DELETE FROM repairers WHERE source = 'demo';
DELETE FROM scraping_suggestions WHERE source = 'demo';

-- Supprimer les données demo des quotes et autres tables
DELETE FROM quotes_with_timeline WHERE client_id IN (
  SELECT id FROM profiles WHERE email = 'demo@demo.fr'
);

-- Nettoyer les données de test obsolètes
DELETE FROM repairers WHERE name LIKE '%demo%' OR name LIKE '%test%' OR name LIKE '%example%';

-- Nettoyer les utilisateurs de test obsolètes
DELETE FROM profiles WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%';