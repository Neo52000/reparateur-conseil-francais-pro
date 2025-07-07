-- Nettoyer et corriger les templates problématiques dans la base de données

-- Supprimer le template "Bons Plans" qui semble poser problème
DELETE FROM public.blog_generation_templates 
WHERE name = 'Bons Plans';

-- Mettre à jour tous les templates pour s'assurer qu'ils ont un format cohérent
UPDATE public.blog_generation_templates 
SET prompt_template = CASE 
  WHEN name = 'Guide de réparation smartphone' THEN 
    'Écris un guide complet de réparation de smartphone pour {saison} {date}. Inclus les étapes détaillées, les outils nécessaires, et les conseils de sécurité. Structure ton article avec un titre accrocheur, un extrait informatif, et un contenu détaillé.'
  
  WHEN name = 'Actualités tech mobile' THEN 
    'Rédige un article sur les dernières actualités technologiques dans le domaine de la téléphonie mobile pour {saison} {date}. Aborde les nouvelles sorties, les innovations technologiques, et leur impact sur les réparations. Structure ton article avec un titre accrocheur, un extrait informatif, et un contenu détaillé.'
  
  WHEN name = 'Conseils entretien smartphone' THEN 
    'Écris un article avec des conseils pratiques pour bien entretenir son smartphone en {saison} {date}. Inclus les bonnes pratiques, les erreurs à éviter, et les signes avant-coureurs de problèmes. Structure ton article avec un titre accrocheur, un extrait informatif, et un contenu détaillé.'
  
  WHEN name = 'Tendances réparation' THEN 
    'Rédige un article sur les tendances actuelles dans le domaine de la réparation de smartphones pour {saison} {date}. Aborde l''évolution du secteur, les nouvelles techniques, et les perspectives d''avenir. Structure ton article avec un titre accrocheur, un extrait informatif, et un contenu détaillé.'
  
  ELSE prompt_template
END
WHERE prompt_template IS NULL OR LENGTH(TRIM(prompt_template)) < 50;

-- S'assurer que tous les templates ont une visibilité définie
UPDATE public.blog_generation_templates 
SET visibility = 'public' 
WHERE visibility IS NULL OR visibility = '';

-- S'assurer que tous les templates ont un modèle IA défini
UPDATE public.blog_generation_templates 
SET ai_model = 'perplexity' 
WHERE ai_model IS NULL OR ai_model = '';

-- Créer un template par défaut simple si aucun n'existe
INSERT INTO public.blog_generation_templates (name, prompt_template, ai_model, visibility, is_active)
SELECT 
  'Article général smartphone',
  'Écris un article informatif sur les smartphones et leur réparation pour {saison} {date}. Donne des conseils pratiques et des informations utiles pour les utilisateurs. Structure ton article avec un titre accrocheur, un extrait informatif, et un contenu détaillé.',
  'perplexity',
  'public',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.blog_generation_templates WHERE is_active = true);

-- Nettoyer les caractères spéciaux dans les prompts
UPDATE public.blog_generation_templates 
SET prompt_template = REPLACE(REPLACE(prompt_template, '"', '"'), '"', '"')
WHERE prompt_template LIKE '%"%' OR prompt_template LIKE '%"%';