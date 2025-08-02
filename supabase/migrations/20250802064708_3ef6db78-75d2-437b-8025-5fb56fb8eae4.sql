-- Créer les nouvelles catégories de blog spécifiques
INSERT INTO blog_categories (name, slug, description, icon, display_order, is_active) VALUES
('Réparer ou jeter ?', 'reparer-ou-jeter', 'Guides pour vous aider à décider entre réparation et remplacement, impact environnemental et économique', '♻️', 1, true),
('Trouver un réparateur', 'trouver-un-reparateur', 'Conseils pour choisir le bon réparateur, témoignages clients et critères de sélection', '🔍', 2, true),
('Bonus ADEME : mode d''emploi', 'bonus-ademe-mode-emploi', 'Guide complet des aides ADEME, démarches administratives et conseils pratiques', '💰', 3, true),
('Actualités réparation', 'actualites-reparation', 'Dernières nouvelles du secteur de la réparation et innovations technologiques', '📰', 4, true);

-- Créer des templates de génération IA pour les nouvelles catégories
INSERT INTO blog_generation_templates (name, category_id, visibility, prompt_template, ai_model, is_active) VALUES
('Guide Réparer ou Jeter', 
 (SELECT id FROM blog_categories WHERE slug = 'reparer-ou-jeter'), 
 'public', 
 'Créer un guide pratique pour aider les consommateurs à décider s''il faut réparer ou remplacer leur {device_type}. Inclure : 1) Critères de décision (âge, coût réparation vs remplacement, disponibilité pièces), 2) Impact environnemental de chaque option, 3) Conseils pour évaluer l''état de l''appareil, 4) Cas pratiques avec exemples chiffrés. Ton : informatif et accessible, 800-1000 mots.',
 'mistral',
 true),

('Sélectionner un Réparateur', 
 (SELECT id FROM blog_categories WHERE slug = 'trouver-un-reparateur'), 
 'public', 
 'Rédiger un guide pour bien choisir son réparateur de {device_type}. Couvrir : 1) Questions à poser avant de confier l''appareil, 2) Signaux d''alarme à éviter, 3) Critères de qualité (certifications, garanties, transparence des prix), 4) Comment vérifier la réputation d''un réparateur, 5) Négociation et devis. Inclure des témoignages fictifs mais réalistes. 800-1000 mots.',
 'mistral',
 true),

('Guide Bonus ADEME', 
 (SELECT id FROM blog_categories WHERE slug = 'bonus-ademe-mode-emploi'), 
 'public', 
 'Expliquer le bonus réparation ADEME pour {device_type} de manière simple et pratique. Détailler : 1) Conditions d''éligibilité, 2) Montants des aides par type d''appareil, 3) Étapes de la demande (documents, délais), 4) Réparateurs partenaires, 5) Pièges à éviter, 6) Alternatives si refus. Inclure des exemples concrets et FAQ. Ton : pratique et rassurant, 800-1000 mots.',
 'mistral',
 true),

('Actualité Réparation', 
 (SELECT id FROM blog_categories WHERE slug = 'actualites-reparation'), 
 'both', 
 'Rédiger un article d''actualité sur {topic} dans le secteur de la réparation. Aborder : 1) Contexte et enjeux, 2) Impact sur les consommateurs et réparateurs, 3) Évolutions attendues, 4) Conseils pratiques pour s''adapter. Adopter un ton informatif et engageant, 600-800 mots.',
 'mistral',
 true);