-- Ajouter une colonne pour le statut d'attribution des devis
ALTER TABLE public.quotes_with_timeline 
ADD COLUMN assignment_status TEXT DEFAULT 'auto_assigned',
ADD COLUMN admin_assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN admin_assigned_by UUID REFERENCES auth.users(id);

-- Créer une table pour les devis en attente d'attribution admin
CREATE TABLE public.admin_quote_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes_with_timeline(id) ON DELETE CASCADE,
  target_repairer_id UUID REFERENCES public.repairer_profiles(id),
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS pour la table des assignations admin
ALTER TABLE public.admin_quote_assignments ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins uniquement
CREATE POLICY "Admins can manage quote assignments" 
ON public.admin_quote_assignments 
FOR ALL 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- Fonction pour vérifier si un réparateur a un abonnement payant
CREATE OR REPLACE FUNCTION public.has_paid_subscription(repairer_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.repairer_subscriptions 
    WHERE user_id = repairer_user_id
      AND subscription_tier IN ('basic', 'premium', 'enterprise')
      AND subscribed = true
  );
$$;

-- Fonction pour distribuer automatiquement les devis
CREATE OR REPLACE FUNCTION public.auto_assign_quote_to_paid_repairer(quote_id_param UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  assigned_repairer_id UUID;
  quote_record RECORD;
BEGIN
  -- Récupérer les informations du devis
  SELECT * INTO quote_record FROM public.quotes_with_timeline WHERE id = quote_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quote not found: %', quote_id_param;
  END IF;
  
  -- Si le réparateur spécifique a un abonnement payant, l'attribuer directement
  IF quote_record.repairer_id IS NOT NULL THEN
    SELECT rp.user_id INTO assigned_repairer_id 
    FROM public.repairer_profiles rp 
    WHERE rp.id = quote_record.repairer_id;
    
    IF public.has_paid_subscription(assigned_repairer_id) THEN
      UPDATE public.quotes_with_timeline 
      SET assignment_status = 'auto_assigned'
      WHERE id = quote_id_param;
      
      RETURN quote_record.repairer_id;
    ELSE
      -- Marquer pour attribution admin
      UPDATE public.quotes_with_timeline 
      SET assignment_status = 'pending_admin_assignment'
      WHERE id = quote_id_param;
      
      -- Créer une entrée dans admin_quote_assignments
      INSERT INTO public.admin_quote_assignments (quote_id, target_repairer_id, status)
      VALUES (quote_id_param, quote_record.repairer_id, 'pending');
      
      RETURN NULL;
    END IF;
  ELSE
    -- Trouver un réparateur payant disponible dans la même zone
    SELECT rp.id INTO assigned_repairer_id
    FROM public.repairer_profiles rp
    INNER JOIN public.repairer_subscriptions rs ON rs.user_id = rp.user_id
    WHERE rs.subscription_tier IN ('basic', 'premium', 'enterprise')
      AND rs.subscribed = true
      AND rp.is_available = true
    ORDER BY RANDOM()
    LIMIT 1;
    
    IF assigned_repairer_id IS NOT NULL THEN
      UPDATE public.quotes_with_timeline 
      SET 
        repairer_id = assigned_repairer_id,
        assignment_status = 'auto_assigned'
      WHERE id = quote_id_param;
      
      RETURN assigned_repairer_id;
    ELSE
      -- Aucun réparateur payant disponible, marquer pour admin
      UPDATE public.quotes_with_timeline 
      SET assignment_status = 'pending_admin_assignment'
      WHERE id = quote_id_param;
      
      INSERT INTO public.admin_quote_assignments (quote_id, status)
      VALUES (quote_id_param, 'pending');
      
      RETURN NULL;
    END IF;
  END IF;
END;
$$;

-- Trigger pour l'auto-attribution lors de la création d'un devis
CREATE OR REPLACE FUNCTION public.trigger_auto_assign_quote()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
  PERFORM public.auto_assign_quote_to_paid_repairer(NEW.id);
  RETURN NEW;
END;
$$;

-- Créer le trigger
CREATE TRIGGER auto_assign_quote_trigger
  AFTER INSERT ON public.quotes_with_timeline
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_auto_assign_quote();

-- Politique pour permettre aux admins de voir tous les devis
CREATE POLICY "Admins can view all quotes for assignment" 
ON public.quotes_with_timeline 
FOR SELECT 
USING (
  get_current_user_role() = 'admin' OR
  (auth.uid() = client_id) OR 
  (EXISTS (
    SELECT 1 FROM repairer_profiles 
    WHERE user_id = auth.uid() AND id = quotes_with_timeline.repairer_id
  ))
);

-- Mise à jour du trigger pour updated_at
CREATE TRIGGER update_admin_quote_assignments_updated_at
  BEFORE UPDATE ON public.admin_quote_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();