-- Add demo reviews with proper UUIDs for testing the review system
INSERT INTO public.reviews (user_id, repairer_id, rating, comment, created_at) VALUES
  (gen_random_uuid(), 'demo-repairer-1', 5, 'Service excellent ! Mon iPhone a été réparé rapidement et efficacement. Je recommande vivement ce réparateur.', now() - interval '2 days'),
  (gen_random_uuid(), 'demo-repairer-1', 4, 'Très bon travail, prix correct. Seul bémol : un peu d''attente mais le résultat est là.', now() - interval '5 days'),
  (gen_random_uuid(), 'demo-repairer-1', 5, 'Parfait ! Réparation rapide, garantie respectée, et excellent accueil. Merci !', now() - interval '1 week'),
  (gen_random_uuid(), 'demo-repairer-1', 4, 'Professionnel compétent. La réparation a été effectuée dans les temps annoncés.', now() - interval '10 days'),
  (gen_random_uuid(), 'demo-repairer-1', 5, 'Je suis très satisfait du service. Mon téléphone fonctionne comme neuf !', now() - interval '2 weeks'),
  (gen_random_uuid(), 'demo-repairer-1', 3, 'Correct sans plus. Le travail a été fait mais l''accueil pourrait être amélioré.', now() - interval '3 weeks'),
  (gen_random_uuid(), 'demo-repairer-1', 5, 'Excellent réparateur ! Diagnostic précis et réparation de qualité.', now() - interval '1 month'),
  (gen_random_uuid(), 'demo-repairer-1', 4, 'Bon service client et réparation réussie. Je reviendrai si besoin.', now() - interval '5 weeks');

-- Add a few reviews for another demo repairer
INSERT INTO public.reviews (user_id, repairer_id, rating, comment, created_at) VALUES
  (gen_random_uuid(), 'demo-repairer-2', 4, 'Très bon réparateur, travail soigné et prix compétitif.', now() - interval '3 days'),
  (gen_random_uuid(), 'demo-repairer-2', 5, 'Parfait ! Réparation express et garantie au top.', now() - interval '1 week'),
  (gen_random_uuid(), 'demo-repairer-2', 4, 'Service de qualité, je recommande.', now() - interval '2 weeks');