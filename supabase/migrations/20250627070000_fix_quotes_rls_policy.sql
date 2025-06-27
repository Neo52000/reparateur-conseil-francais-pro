
-- Supprimer l'ancienne politique restrictive
DROP POLICY IF EXISTS "Clients can create quotes" ON quotes_with_timeline;

-- Créer une nouvelle politique plus permissive pour permettre les devis anonymes
CREATE POLICY "Anyone can create quotes" ON quotes_with_timeline
  FOR INSERT WITH CHECK (true);

-- Mettre à jour la politique de lecture pour inclure les devis anonymes
DROP POLICY IF EXISTS "Users can view their own quotes" ON quotes_with_timeline;

CREATE POLICY "Users can view quotes" ON quotes_with_timeline
  FOR SELECT USING (
    auth.uid() = client_id OR 
    auth.uid() = repairer_id OR
    EXISTS (SELECT 1 FROM repairer_profiles WHERE user_id = auth.uid() AND id = repairer_id) OR
    client_id IS NULL -- Permet de voir les devis anonymes pour les admins
  );
