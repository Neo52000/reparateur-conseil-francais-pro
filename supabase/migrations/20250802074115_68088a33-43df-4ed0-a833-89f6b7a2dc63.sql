-- Suppression complète des données de démonstration et désactivation du mode démo
-- Migration vers mode production uniquement

-- 1. Supprimer toutes les données avec source = 'demo'
DELETE FROM public.repairers WHERE source = 'demo';

-- 2. Désactiver définitivement le mode démo pour tous les plans
UPDATE public.feature_flags_by_plan 
SET enabled = false, updated_at = now() 
WHERE feature_key = 'demo_mode_enabled';

-- 3. Supprimer le feature flag demo_mode_enabled complètement
DELETE FROM public.feature_flags_by_plan WHERE feature_key = 'demo_mode_enabled';

-- 4. Supprimer les profils de réparateurs de démonstration
DELETE FROM public.repairer_profiles WHERE business_name LIKE '%Démo%' OR business_name LIKE '%Demo%';

-- 5. Supprimer les utilisateurs de test/démo s'ils existent
DELETE FROM public.profiles WHERE email LIKE '%demo%' OR email LIKE '%test%';

-- 6. Nettoyer les campagnes publicitaires de test
DELETE FROM public.advertising_campaigns WHERE name LIKE '%test%' OR name LIKE '%demo%';
DELETE FROM public.ai_generated_content WHERE generated_content::text LIKE '%demo%';

-- 7. Supprimer les données d'analytics de test
DELETE FROM public.admin_analytics WHERE metric_data::text LIKE '%demo%';

-- 8. Nettoyer les templates AI de démonstration
DELETE FROM public.ai_campaign_templates WHERE name LIKE '%demo%' OR name LIKE '%test%';

-- 9. Confirmer qu'aucune donnée de démo ne reste
DO $$
BEGIN
    -- Vérifications de sécurité
    IF EXISTS (SELECT 1 FROM public.repairers WHERE source = 'demo') THEN
        RAISE EXCEPTION 'ERREUR: Des données de démo existent encore dans repairers';
    END IF;
    
    IF EXISTS (SELECT 1 FROM public.feature_flags_by_plan WHERE feature_key = 'demo_mode_enabled' AND enabled = true) THEN
        RAISE EXCEPTION 'ERREUR: Le mode démo est encore activé';
    END IF;
    
    RAISE NOTICE 'SUCCESS: Migration vers production terminée - aucune donnée de démo restante';
END $$;