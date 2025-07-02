import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

/**
 * Hook pour gérer le mode démo de l'application
 */
export const useDemoMode = () => {
  const [demoModeEnabled, setDemoModeEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  /**
   * Vérifie si le mode démo est activé pour l'utilisateur actuel
   */
  const checkDemoMode = async () => {
    try {
      setLoading(true);
      logger.debug('Vérification du mode démo pour:', { 
        userId: user?.id, 
        userEmail: user?.email,
        isAdmin 
      });
      
      // Vérifier si l'utilisateur est admin
      if (isAdmin) {
        logger.debug('Utilisateur admin détecté, vérification du feature flag');
        
        // Pour les admins, vérifier le feature flag
        const { data: flags, error } = await supabase
          .from('feature_flags_by_plan')
          .select('enabled')
          .eq('feature_key', 'demo_mode_enabled')
          .eq('plan_name', 'Enterprise')
          .single();

        if (error) {
          logger.error('Erreur lors de la récupération du feature flag:', error);
          setDemoModeEnabled(false);
        } else {
          logger.debug('Feature flag récupéré:', flags);
          const isEnabled = flags?.enabled || false;
          setDemoModeEnabled(isEnabled);
          logger.debug('Mode démo défini à:', isEnabled);
        }
      } else {
        // Pour les utilisateurs normaux, mode démo désactivé
        logger.debug('Utilisateur normal, mode démo désactivé');
        setDemoModeEnabled(false);
      }
    } catch (error) {
      logger.error('Erreur lors de la vérification du mode démo:', error);
      setDemoModeEnabled(false);
    } finally {
      setLoading(false);
      logger.debug('Vérification terminée, état final:', { demoModeEnabled, loading: false });
    }
  };

  /**
   * Active ou désactive le mode démo
   */
  const toggleDemoMode = async () => {
    try {
      const newState = !demoModeEnabled;
      logger.debug('Basculement du mode démo:', { from: demoModeEnabled, to: newState });
      
      const { error } = await supabase
        .from('feature_flags_by_plan')
        .update({ enabled: newState })
        .eq('feature_key', 'demo_mode_enabled')
        .eq('plan_name', 'Enterprise');

      if (error) {
        logger.error('Erreur lors du basculement:', error);
        throw error;
      }

      setDemoModeEnabled(newState);
      logger.debug('Mode démo basculé avec succès:', newState);
      
      toast({
        title: newState ? 'Mode démo activé' : 'Mode démo désactivé',
        description: newState 
          ? 'Les données de démonstration sont maintenant visibles'
          : 'Seules les vraies données sont maintenant visibles',
      });
    } catch (error) {
      logger.error('Erreur lors du changement de mode démo:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de changer le mode démo',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    logger.debug('Hook useDemoMode initialisé, utilisateur:', { 
      hasUser: !!user, 
      userId: user?.id,
      isAdmin 
    });
    
    if (user) {
      checkDemoMode();
    } else {
      logger.debug('Pas d\'utilisateur, attente...');
      setDemoModeEnabled(false);
      setLoading(false);
    }
  }, [user, isAdmin]);

  logger.debug('Retour du hook useDemoMode:', { demoModeEnabled, loading });

  return {
    demoModeEnabled,
    loading,
    toggleDemoMode,
    checkDemoMode
  };
};