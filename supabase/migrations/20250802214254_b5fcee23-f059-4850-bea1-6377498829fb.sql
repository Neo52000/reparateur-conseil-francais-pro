-- Ajouter la colonne assignment_status à la table quotes_with_timeline
ALTER TABLE public.quotes_with_timeline 
ADD COLUMN assignment_status TEXT DEFAULT 'pending' CHECK (assignment_status IN ('pending', 'auto_assigned', 'pending_admin_assignment', 'assigned'));

-- Créer un index pour optimiser les requêtes sur ce champ
CREATE INDEX idx_quotes_assignment_status ON public.quotes_with_timeline(assignment_status);