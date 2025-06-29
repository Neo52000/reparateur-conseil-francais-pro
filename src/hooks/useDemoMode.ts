
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook pour gérer le mode démo de l'application
 */
export const useDemoMode = () => {
  const [demoModeEnabled, setDemoModeEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  /**
   * Vérifie si le mode démo est activé pour l'utilisateur actuel
   */
  const checkDemoMode = async () => {
    try {
      setLoading(true);
      
      // Vérifier si l'utilisateur est admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

      if (profile?.role === 'admin' || profile?.role === 'superadmin') {
        // Pour les admins, vérifier le feature flag
        const { data: flags } = await supabase
          .from('feature_flags_by_plan')
          .select('enabled')
          .eq('feature_key', 'demo_mode_enabled')
          .eq('plan_name', 'Enterprise')
          .single();

        setDemoModeEnabled(flags?.enabled || false);
      } else {
        // Pour les utilisateurs normaux, mode démo désactivé
        setDemoModeEnabled(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du mode démo:', error);
      setDemoModeEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Active ou désactive le mode démo
   */
  const toggleDemoMode = async () => {
    try {
      const newState = !demoModeEnabled;
      
      const { error } = await supabase
        .from('feature_flags_by_plan')
        .update({ enabled: newState })
        .eq('feature_key', 'demo_mode_enabled')
        .eq('plan_name', 'Enterprise');

      if (error) throw error;

      setDemoModeEnabled(newState);
      toast({
        title: newState ? 'Mode démo activé' : 'Mode démo désactivé',
        description: newState 
          ? 'Les données de démonstration sont maintenant visibles'
          : 'Seules les vraies données sont maintenant visibles',
      });
    } catch (error) {
      console.error('Erreur lors du changement de mode démo:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de changer le mode démo',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (user) {
      checkDemoMode();
    }
  }, [user]);

  return {
    demoModeEnabled,
    loading,
    toggleDemoMode,
    checkDemoMode
  };
};
