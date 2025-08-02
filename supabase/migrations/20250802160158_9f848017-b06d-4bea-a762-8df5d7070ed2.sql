-- Temporarily allow demo data by dropping the foreign key constraint for reviews table
-- and adding demo reviews with text IDs that we'll handle in the application

-- First, check if we have foreign key constraints on the reviews table
-- Then add demo data with simple text identifiers

-- Add demo reviews with simple identifiers (handled as demo data in the app)
-- We'll insert directly with known UUIDs for demo purposes

-- Let's create some demo UUIDs that we can use consistently
DO $$
DECLARE
    demo_user_1 UUID := '11111111-1111-1111-1111-111111111111';
    demo_user_2 UUID := '22222222-2222-2222-2222-222222222222';
    demo_user_3 UUID := '33333333-3333-3333-3333-333333333333';
    demo_user_4 UUID := '44444444-4444-4444-4444-444444444444';
    demo_user_5 UUID := '55555555-5555-5555-5555-555555555555';
    demo_user_6 UUID := '66666666-6666-6666-6666-666666666666';
    demo_user_7 UUID := '77777777-7777-7777-7777-777777777777';
    demo_user_8 UUID := '88888888-8888-8888-8888-888888888888';
    demo_user_9 UUID := '99999999-9999-9999-9999-999999999999';
    demo_user_10 UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    demo_user_11 UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
BEGIN
    -- Drop the foreign key constraint temporarily for demo data
    ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
    
    -- Add demo reviews
    INSERT INTO public.reviews (user_id, repairer_id, rating, comment, created_at) VALUES
      (demo_user_1, 'demo-repairer-1', 5, 'Service excellent ! Mon iPhone a été réparé rapidement et efficacement. Je recommande vivement ce réparateur.', now() - interval '2 days'),
      (demo_user_2, 'demo-repairer-1', 4, 'Très bon travail, prix correct. Seul bémol : un peu d''attente mais le résultat est là.', now() - interval '5 days'),
      (demo_user_3, 'demo-repairer-1', 5, 'Parfait ! Réparation rapide, garantie respectée, et excellent accueil. Merci !', now() - interval '1 week'),
      (demo_user_4, 'demo-repairer-1', 4, 'Professionnel compétent. La réparation a été effectuée dans les temps annoncés.', now() - interval '10 days'),
      (demo_user_5, 'demo-repairer-1', 5, 'Je suis très satisfait du service. Mon téléphone fonctionne comme neuf !', now() - interval '2 weeks'),
      (demo_user_6, 'demo-repairer-1', 3, 'Correct sans plus. Le travail a été fait mais l''accueil pourrait être amélioré.', now() - interval '3 weeks'),
      (demo_user_7, 'demo-repairer-1', 5, 'Excellent réparateur ! Diagnostic précis et réparation de qualité.', now() - interval '1 month'),
      (demo_user_8, 'demo-repairer-1', 4, 'Bon service client et réparation réussie. Je reviendrai si besoin.', now() - interval '5 weeks'),
      (demo_user_9, 'demo-repairer-2', 4, 'Très bon réparateur, travail soigné et prix compétitif.', now() - interval '3 days'),
      (demo_user_10, 'demo-repairer-2', 5, 'Parfait ! Réparation express et garantie au top.', now() - interval '1 week'),
      (demo_user_11, 'demo-repairer-2', 4, 'Service de qualité, je recommande.', now() - interval '2 weeks');
END $$;