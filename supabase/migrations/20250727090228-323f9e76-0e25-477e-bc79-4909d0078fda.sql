-- Mettre à jour la contrainte de vérification du statut pour inclure toutes les valeurs utilisées dans l'application
ALTER TABLE public.repair_orders 
DROP CONSTRAINT IF EXISTS repair_orders_status_check;

-- Ajouter la nouvelle contrainte avec toutes les valeurs de statut utilisées
ALTER TABLE public.repair_orders 
ADD CONSTRAINT repair_orders_status_check 
CHECK (status = ANY (ARRAY[
  'diagnostic'::text,
  'quote_pending'::text, 
  'quote_accepted'::text,
  'in_progress'::text,
  'waiting_parts'::text,
  'testing'::text,
  'completed'::text,
  'ready_pickup'::text,
  'delivered'::text,
  'cancelled'::text,
  'warranty_return'::text
]));