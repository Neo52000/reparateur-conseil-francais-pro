import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Repairer } from '@/types/repairer';
import { PriorityRepairersService } from '@/services/repairers/priorityRepairersService';
import { RepairersDataTransformer } from '@/services/repairers/repairersDataTransformer';
import { logger } from '@/utils/logger';

// Cache simple pour les réparateurs prioritaires
let priorityCache: { data: Repairer[]; timestamp: number; limit: number } | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes pour les données prioritaires

export const usePriorityRepairersOptimized = (limit: number = 50) => {
  const [repairers, setRepairers] = useState<Repairer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Vérifier si le cache est valide
  const isCacheValid = useMemo(() => {
    return priorityCache && 
           Date.now() - priorityCache.timestamp < CACHE_DURATION &&
           priorityCache.limit >= limit;
  }, [limit]);

  const fetchPriorityRepairers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Utiliser le cache si valide
      if (isCacheValid && priorityCache) {
        logger.debug('Using cached priority repairers');
        setRepairers(priorityCache.data.slice(0, limit));
        setLoading(false);
        return;
      }

      logger.debug('Fetching priority repairers, limit:', limit);
      const supabaseData = await PriorityRepairersService.fetchPriorityRepairers(limit);
      
      if (supabaseData && supabaseData.length > 0) {
        // Nettoyer et transformer les données
        const cleanedData = supabaseData.map(PriorityRepairersService.cleanRepairerData);
        const processedData = RepairersDataTransformer.transformSupabaseData(cleanedData);
        
        logger.debug('Priority repairers loaded:', processedData.length);
        
        // Mettre en cache
        priorityCache = {
          data: processedData,
          timestamp: Date.now(),
          limit: processedData.length
        };
        
        setRepairers(processedData);
      } else {
        logger.debug('No priority repairers found');
        setRepairers([]);
      }
      
    } catch (err) {
      logger.error('Priority repairers error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des réparateurs prioritaires';
      setError(errorMessage);
      setRepairers([]);
      
      // Fallback silencieux pour éviter de polluer l'interface
      logger.warn('Priority repairers loading failed, using empty fallback');
    } finally {
      setLoading(false);
    }
  }, [limit, isCacheValid]);

  useEffect(() => {
    fetchPriorityRepairers();
  }, [fetchPriorityRepairers]);

  // Clear cache on update events
  useEffect(() => {
    const handleUpdate = () => {
      priorityCache = null;
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