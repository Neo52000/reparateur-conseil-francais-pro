-- Attacher le trigger manquant à la table repair_orders
CREATE TRIGGER auto_generate_repair_order_number_trigger
  BEFORE INSERT ON public.repair_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_repair_order_number();