-- ============================================
-- SCRIPT UTILITAIRE : Attribution du rôle admin
-- ============================================
-- Ce script vous aide à attribuer le rôle admin à votre compte utilisateur.
-- Exécutez-le dans le SQL Editor de Supabase.

-- ÉTAPE 1 : Vérifier les rôles existants
-- ----------------------------------------
-- Exécutez cette requête pour voir les rôles actuellement attribués :

SELECT 
  ur.id,
  ur.user_id,
  u.email,
  ur.role,
  ur.is_active,
  ur.created_at
FROM public.user_roles ur
LEFT JOIN auth.users u ON ur.user_id = u.id
ORDER BY ur.created_at DESC;


-- ÉTAPE 2 : Récupérer votre user_id
-- ----------------------------------------
-- Allez dans Supabase Dashboard > Authentication > Users
-- Copiez votre User UID (format : xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)


-- ÉTAPE 3 : Attribuer le rôle admin
-- ----------------------------------------
-- Remplacez 'VOTRE-USER-ID-ICI' par votre User UID et exécutez :

INSERT INTO public.user_roles (user_id, role, is_active)
VALUES ('VOTRE-USER-ID-ICI', 'admin', true)
ON CONFLICT (user_id, role) 
DO UPDATE SET is_active = true;


-- ÉTAPE 4 : Vérifier l'attribution
-- ----------------------------------------
-- Re-exécutez la requête de l'ÉTAPE 1 pour confirmer que le rôle admin est bien attribué.


-- ============================================
-- NOTES DE SÉCURITÉ
-- ============================================
-- ⚠️ Le rôle admin donne accès à toutes les fonctionnalités d'administration
-- ⚠️ N'attribuez ce rôle qu'aux personnes de confiance
-- ⚠️ Conservez ce script en sécurité et ne le partagez pas publiquement
