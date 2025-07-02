import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Repairer } from '@/types/repairer';
import { PriorityRepairersService } from '@/services/repairers/priorityRepairersService';
import { RepairersDataTransformer } from '@/services/repairers/repairersDataTransformer';
import { logger } from '@/utils/logger';
import { withErrorHandling, ErrorHandler } from '@/utils/errorHandling';
import { TTLCache } from '@/utils/performance';

// Cache optimisé avec TTL
const priorityCache = new TTLCache<number, Repairer[]>(10 * 60 * 1000); // 10 minutes

export const usePriorityRepairersOptimized = (limit: number = 50) => {
  const [repairers, setRepairers] = useState<Repairer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch avec gestion d'erreur intégrée
  const fetchPriorityRepairersWithErrorHandling = useMemo(() => {
    return withErrorHandling(async (fetchLimit: number) => {
      const supabaseData = await PriorityRepairersService.fetchPriorityRepairers(fetchLimit);
      
      if (!supabaseData || supabaseData.length === 0) {
        return [];
      }
      
      const cleanedData = supabaseData.map(PriorityRepairersService.cleanRepairerData);
      return RepairersDataTransformer.transformSupabaseData(cleanedData);
    });
  }, []);

  const fetchPriorityRepairers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Utiliser le cache si valide
      const cachedData = priorityCache.get(limit);
      if (cachedData && cachedData.length >= limit) {
        logger.debug('Using cached priority repairers');
        setRepairers(cachedData.slice(0, limit));
        setLoading(false);
        return;
      }

      logger.debug('Fetching priority repairers, limit:', limit);
      
      const result = await fetchPriorityRepairersWithErrorHandling(limit);
      
      if (result.error) {
        const errorMessage = ErrorHandler.getDisplayMessage(result.error);
        logger.error('Priority repairers error:', result.error);
        setError(errorMessage);
        setRepairers([]);
        return;
      }

      const processedData = result.data || [];
      logger.debug('Priority repairers loaded:', processedData.length);
      
      // Mettre en cache
      priorityCache.set(limit, processedData);
      setRepairers(processedData);
      
    } catch (err) {
      const appError = ErrorHandler.handle(err);
      const errorMessage = ErrorHandler.getDisplayMessage(appError);
      
      logger.error('Priority repairers error:', appError);
      setError(errorMessage);
      setRepairers([]);
      
      // Fallback silencieux pour éviter de polluer l'interface
      logger.warn('Priority repairers loading failed, using empty fallback');
    } finally {
      setLoading(false);
    }
  }, [limit, fetchPriorityRepairersWithErrorHandling]);

  useEffect(() => {
    fetchPriorityRepairers();
  }, [fetchPriorityRepairers]);

  // Clear cache on update events
  useEffect(() => {
    const handleUpdate = () => {
      priorityCache.clear();
      logger.debug('Priority cache cleared');
    };

    window.addEventListener('repairersUpdated', handleUpdate);
    return () => window.removeEventListener('repairersUpdated', handleUpdate);
  }, []);

  return {
    repairers,
    loading,
    error,
    refetch: fetchPriorityRepairers
  };
};