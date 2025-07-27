-- Vérifier et créer le trigger pour la génération automatique du numéro d'ordre
-- La fonction generate_repair_order_number existe déjà selon la configuration

-- Créer le trigger pour auto-générer les numéros d'ordre
CREATE TRIGGER auto_generate_repair_order_number
  BEFORE INSERT ON public.repair_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_repair_order_number();

-- Vérifier et ajuster les contraintes sur le statut si nécessaire
-- S'assurer que 'diagnostic' est accepté comme statut valide
ALTER TABLE public.repair_orders 
DROP CONSTRAINT IF EXISTS repair_orders_status_check;

-- Ajouter une contrainte de statut mise à jour qui inclut 'diagnostic'
ALTER TABLE public.repair_orders 
ADD CONSTRAINT repair_orders_status_check 
CHECK (status IN ('pending', 'diagnostic', 'in_progress', 'completed', 'ready_for_pickup', 'delivered', 'cancelled'));

-- S'assurer que order_number peut être NULL initialement (pour que le trigger puisse le remplir)
ALTER TABLE public.repair_orders 
ALTER COLUMN order_number DROP NOT NULL;