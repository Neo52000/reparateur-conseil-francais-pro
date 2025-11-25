-- ============================================
-- MIGRATION CRITIQUE : Correction vulnérabilité escalade de privilèges
-- ÉTAPE 2/2 : Supprimer la colonne role de profiles
-- ============================================

-- Supprimer la colonne role (toutes les dépendances ont été corrigées)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

COMMENT ON TABLE public.profiles IS 
'Profils utilisateurs. SÉCURITÉ : La colonne role a été supprimée pour éviter escalade de privilèges. Utilisez user_roles pour gérer les rôles de manière sécurisée.';

-- Mettre à jour la vue admin_subscription_overview avec SECURITY INVOKER
CREATE OR REPLACE VIEW public.admin_subscription_overview
WITH (security_invoker = true)
AS
SELECT 
    rs.id, rs.repairer_id, rs.email, rs.user_id,
    p.first_name, p.last_name,
    rs.subscription_tier, rs.billing_cycle, rs.subscribed,
    rs.created_at, rs.updated_at, rs.subscription_end,
    CASE rs.subscription_tier
        WHEN 'free' THEN 'Gratuit' WHEN 'basic' THEN 'Basic'
        WHEN 'pro' THEN 'Pro' WHEN 'premium' THEN 'Premium'
        WHEN 'enterprise' THEN 'Enterprise' ELSE 'Unknown'
    END as plan_name,
    CASE rs.subscription_tier
        WHEN 'free' THEN 0 WHEN 'basic' THEN 9.90 WHEN 'pro' THEN 19.90
        WHEN 'premium' THEN 39.90 WHEN 'enterprise' THEN 99.90 ELSE 0
    END as price_monthly,
    CASE rs.subscription_tier
        WHEN 'free' THEN 0 WHEN 'basic' THEN 99.00 WHEN 'pro' THEN 199.00
        WHEN 'premium' THEN 399.00 WHEN 'enterprise' THEN 999.00 ELSE 0
    END as price_yearly
FROM public.repairer_subscriptions rs
LEFT JOIN public.profiles p ON rs.user_id = p.id
WHERE EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true);

-- Fonction d'audit pour les admins
CREATE OR REPLACE FUNCTION public.audit_user_roles()
RETURNS TABLE(user_id uuid, email text, roles text[], has_profile boolean, status text)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT ur.user_id, p.email,
    ARRAY_AGG(ur.role) FILTER (WHERE ur.is_active) as roles,
    (p.id IS NOT NULL) as has_profile,
    CASE 
      WHEN p.id IS NULL THEN 'ERREUR: Pas de profil'
      WHEN NOT EXISTS(SELECT 1 FROM user_roles WHERE user_id = ur.user_id AND is_active = true) 
      THEN 'ERREUR: Aucun rôle actif' 
      ELSE 'OK' 
    END as status
  FROM public.user_roles ur
  LEFT JOIN public.profiles p ON p.id = ur.user_id
  WHERE public.has_admin_role(auth.uid())
  GROUP BY ur.user_id, p.email, p.id;
$$;

COMMENT ON FUNCTION public.audit_user_roles() IS 
'Fonction admin pour auditer les rôles utilisateurs et détecter les incohérences.';

-- Log de succès
DO $$
BEGIN
  RAISE NOTICE '✅ VULNÉRABILITÉ CRITIQUE CORRIGÉE';
  RAISE NOTICE '==================================';
  RAISE NOTICE '✓ Fonction get_current_user_role() utilise maintenant user_roles';
  RAISE NOTICE '✓ Fonction has_admin_role() créée pour vérifications rapides';
  RAISE NOTICE '✓ Colonne profiles.role SUPPRIMÉE (vulnérabilité éliminée)';
  RAISE NOTICE '✓ Toutes les politiques RLS mises à jour vers user_roles';
  RAISE NOTICE '✓ Vue admin_subscription_overview sécurisée avec SECURITY INVOKER';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ ACTIONS REQUISES :';
  RAISE NOTICE '1. Tester l''authentification admin sur l''application web';
  RAISE NOTICE '2. Vérifier les edge functions pour qu''elles utilisent user_roles';
  RAISE NOTICE '3. Nettoyer le code client (références à profiles.role)';
  RAISE NOTICE '4. Exécuter SELECT * FROM audit_user_roles() pour vérifier';
END $$;