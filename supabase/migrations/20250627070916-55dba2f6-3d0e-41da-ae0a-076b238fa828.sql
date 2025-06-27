
-- Supprimer toutes les politiques existantes d'abord
DROP POLICY IF EXISTS "Anyone can create quotes" ON quotes_with_timeline;
DROP POLICY IF EXISTS "Users can view quotes" ON quotes_with_timeline;
DROP POLICY IF EXISTS "Users can view their own quotes" ON quotes_with_timeline;
DROP POLICY IF EXISTS "Clients can create quotes" ON quotes_with_timeline;
DROP POLICY IF EXISTS "Authenticated users can create quotes" ON quotes_with_timeline;
DROP POLICY IF EXISTS "Repairers can update quotes" ON quotes_with_timeline;

-- Créer une politique restrictive pour la création de devis (utilisateurs authentifiés uniquement)
CREATE POLICY "Authenticated users can create quotes" ON quotes_with_timeline
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = client_id);

-- Politique de lecture pour les devis
CREATE POLICY "Users can view their own quotes" ON quotes_with_timeline
  FOR SELECT USING (
    auth.uid() = client_id OR 
    auth.uid() = repairer_id OR
    EXISTS (SELECT 1 FROM repairer_profiles WHERE user_id = auth.uid() AND id = repairer_id)
  );

-- Politique de mise à jour pour les réparateurs
CREATE POLICY "Repairers can update quotes" ON quotes_with_timeline  
  FOR UPDATE USING (
    auth.uid() = repairer_id OR
    EXISTS (SELECT 1 FROM repairer_profiles WHERE user_id = auth.uid() AND id = repairer_id)
  );
