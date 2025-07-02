import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Repairer } from '@/types/repairer';
import { RepairersDataService } from '@/services/repairers/repairersDataService';
import { RepairersDataTransformer } from '@/services/repairers/repairersDataTransformer';
import { DistanceCalculator } from '@/utils/geolocation/distanceCalculator';
import { logger } from '@/utils/logger';

export interface SearchFilters {
  services?: string[];
  brands?: string[];
  priceRange?: string;
  distance?: number;
  minRating?: number;
  openNow?: boolean;
  fastResponse?: boolean;
  city?: string;
  postalCode?: string;
}

// Cache pour éviter les requêtes répétées
const cache = new Map<string, { data: Repairer[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useRepairersOptimized = (filters?: SearchFilters, userLocation?: [number, number]) => {
  const [repairers, setRepairers] = useState<Repairer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Générer une clé de cache unique basée sur les filtres
  const cacheKey = useMemo(() => {
    return JSON.stringify({ filters, userLocation });
  }, [filters, userLocation]);

  // Vérifier le cache
  const getCachedData = useCallback((key: string) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logger.debug('Using cached repairers data');
      return cached.data;
    }
    return null;
  }, []);

  // Mettre en cache les données
  const setCachedData = useCallback((key: string, data: Repairer[]) => {
    cache.set(key, { data, timestamp: Date.now() });
    logger.debug('Cached repairers data');
  }, []);

  const fetchRepairers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Vérifier le cache d'abord
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setRepairers(cachedData);
        setLoading(false);
        return;
      }

      logger.debug('Fetching repairers with filters:', filters);
      
      const supabaseData = await RepairersDataService.fetchRepairers(filters);
      logger.debug('Raw data count:', supabaseData?.length);
      
      if (supabaseData && supabaseData.length > 0) {
        // Filter out repairers with corrupted data
        const validData = supabaseData.filter(repairer => {
          const hasValidName = repairer.name && !repairer.name.includes('�');
          const hasValidCity = repairer.city && !repairer.city.includes('�');
          return hasValidName && hasValidCity;
        });

        logger.debug(`Valid repairers: ${validData.length}/${supabaseData.length}`);

        // Transform data
        let processedData = RepairersDataTransformer.transformSupabaseData(validData);

        // Apply distance filter if user location is available
        if (userLocation && filters?.distance && processedData.length > 0) {
          processedData = DistanceCalculator.filterByDistance(
            processedData, 
            userLocation, 
            filters.distance
          );
          logger.debug(`After distance filter: ${processedData.length}`);
        }

        setRepairers(processedData);
        setCachedData(cacheKey, processedData);
        
        // Show success toast only if significant results
        if (processedData.length > 5) {
          toast({
            title: "Réparateurs chargés",
            description: `${processedData.length} réparateur${processedData.length > 1 ? 's' : ''} trouvé${processedData.length > 1 ? 's' : ''}`,
          });
        }
      } else {
        logger.debug('No data returned from service');
        setRepairers([]);
      }
      
    } catch (err) {
      logger.error('Error fetching repairers:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des réparateurs';
      setError(errorMessage);
      setRepairers([]);
      
      toast({
        title: "Erreur de chargement",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [filters, userLocation, toast, cacheKey, getCachedData, setCachedData]);

  // Debounced effect pour éviter trop de requêtes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRepairers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchRepairers]);

  // Listen for repairers update events (optimisé)
  useEffect(() => {
    const handleRepairersUpdate = () => {
      // Clear cache on update
      cache.clear();
      logger.debug('Cache cleared due to repairers update');
      fetchRepairers().catch(logger.error);
    };

    window.addEventListener('repairersUpdated', handleRepairersUpdate);
    
    return () => {
      window.removeEventListener('repairersUpdated', handleRepairersUpdate);
    };
  }, [fetchRepairers]);

  return {
    repairers,
    loading,
    error,
    refetch: fetchRepairers
  };
};