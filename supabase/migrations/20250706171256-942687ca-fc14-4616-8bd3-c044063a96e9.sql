-- Modifier la fonction has_local_seo_access pour inclure les administrateurs
CREATE OR REPLACE FUNCTION public.has_local_seo_access(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    -- Vérifier si l'utilisateur est admin
    SELECT 1 
    FROM public.profiles 
    WHERE profiles.id = user_id AND profiles.role = 'admin'
  ) OR EXISTS (
    -- Ou s'il a un abonnement premium/enterprise
    SELECT 1 
    FROM public.repairer_subscriptions 
    WHERE repairer_subscriptions.user_id = user_id
      AND subscription_tier IN ('premium', 'enterprise')
      AND subscribed = true
  );
$function$