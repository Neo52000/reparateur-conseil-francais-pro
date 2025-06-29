
import { useState, useEffect } from 'react';
import { Repairer } from '@/types/repairer';
import { useDemoMode } from '@/hooks/useDemoMode';
import { DemoDataService } from '@/services/demoDataService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook pour gérer les réparateurs avec prise en compte du mode démo
 */
export const useRepairersWithDemo = () => {
  const [repairers, setRepairers] = useState<Repairer[]>([]);
  const [loading, setLoading] = useState(false);
  const { demoModeEnabled } = useDemoMode();
  const { toast } = useToast();

  const fetchRepairers = async () => {
    try {
      setLoading(true);
      
      // Récupérer les données réelles
      const { data: realData, error } = await supabase
        .from('repairers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des réparateurs:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les réparateurs',
          variant: 'destructive',
        });
        return;
      }

      // Appliquer la logique du mode démo
      const demoData = DemoDataService.getDemoRepairers();
      const combinedData = DemoDataService.combineWithDemoData(
        realData || [],
        demoData,
        demoModeEnabled
      );

      setRepairers(combinedData);
    } catch (error) {
      console.error('Erreur lors du chargement des réparateurs:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur inattendue s\'est produite',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairers();
  }, [demoModeEnabled]);

  return {
    repairers,
    loading,
    refetch: fetchRepairers
  };
};
