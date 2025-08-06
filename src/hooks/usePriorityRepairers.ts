
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Repairer } from '@/types/repairer';
import { PriorityRepairersService } from '@/services/repairers/priorityRepairersService';
import { RepairersDataTransformer } from '@/services/repairers/repairersDataTransformer';

export const usePriorityRepairers = (limit: number = 50) => {
  const [repairers, setRepairers] = useState<Repairer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPriorityRepairers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('usePriorityRepairers - Fetching priority repairers...');
      const supabaseData = await PriorityRepairersService.fetchPriorityRepairers(limit);
      
      if (supabaseData && supabaseData.length > 0) {
        // Nettoyer et transformer les données
        const cleanedData = supabaseData.map(PriorityRepairersService.cleanRepairerData);
        const processedData = RepairersDataTransformer.transformSupabaseData(cleanedData);
        
        console.log('usePriorityRepairers - Successfully loaded:', processedData.length, 'repairers');
        setRepairers(processedData);
      } else {
        console.log('usePriorityRepairers - No priority repairers found');
        setRepairers([]);
      }
      
    } catch (err) {
      console.error('usePriorityRepairers - Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des réparateurs prioritaires';
      setError(errorMessage);
      setRepairers([]);
      
      // Ne pas afficher de toast d'erreur pour éviter de polluer l'interface
      console.warn('Priority repairers loading failed, using empty fallback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriorityRepairers();
  }, [limit]);

  return {
    repairers,
    loading,
    error,
    refetch: fetchPriorityRepairers
  };
};
