import { useSafeState } from './useSafeState';
import { useSafeToast } from './useSafeToast';
import { useCallback, useEffect } from 'react';

interface SafeRepairer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  rating?: number;
}

export const useSafePriorityRepairers = (limit: number = 20) => {
  const [repairers, setRepairers] = useSafeState<SafeRepairer[]>([]);
  const [loading, setLoading] = useSafeState(true);
  const [error, setError] = useSafeState<string | null>(null);
  const { toast } = useSafeToast();

  const fetchPriorityRepairers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('SafePriorityRepairers - Fetching data...');
      
      // Mock data pour éviter les erreurs de service
      const mockRepairers: SafeRepairer[] = [
        { id: '1', name: 'TechRepair Pro', phone: '01 23 45 67 89', rating: 4.8 },
        { id: '2', name: 'Mobile Fix Expert', phone: '01 98 76 54 32', rating: 4.9 },
        { id: '3', name: 'Phone Doctor', phone: '01 11 22 33 44', rating: 4.7 }
      ];
      
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRepairers(mockRepairers.slice(0, limit));
      console.log('SafePriorityRepairers - Successfully loaded mock data');
      
    } catch (err) {
      console.error('SafePriorityRepairers - Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(errorMessage);
      setRepairers([]);
    } finally {
      setLoading(false);
    }
  }, [limit, setLoading, setError, setRepairers]);

  useEffect(() => {
    fetchPriorityRepairers();
  }, [fetchPriorityRepairers]);

  return {
    repairers,
    loading,
    error,
    refetch: fetchPriorityRepairers
  };
};