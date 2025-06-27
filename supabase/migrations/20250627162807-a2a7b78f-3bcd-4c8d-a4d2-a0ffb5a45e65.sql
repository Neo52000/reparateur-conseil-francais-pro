
-- Ajouter les types d'appareils manquants pour correspondre à ceux du formulaire de devis
INSERT INTO public.device_types (name, description, icon) VALUES
('Smartphone', 'Téléphones portables intelligents', 'smartphone'),
('Tablette', 'Tablettes tactiles', 'tablet'),
('Ordinateur portable', 'Ordinateurs portables et laptops', 'laptop'),
('Ordinateur de bureau', 'Ordinateurs fixes de bureau', 'monitor'),
('Console de jeux', 'Consoles de jeux vidéo', 'gamepad2'),
('Montre connectée', 'Montres intelligentes et connectées', 'watch'),
('Écouteurs/Casque', 'Écouteurs, casques audio et accessoires audio', 'headphones'),
('Autre', 'Autres types d''appareils électroniques', 'help-circle')
ON CONFLICT (name) DO NOTHING;
