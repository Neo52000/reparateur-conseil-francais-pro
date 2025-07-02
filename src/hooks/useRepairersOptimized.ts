import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Repairer } from '@/types/repairer';
import { RepairersDataService } from '@/services/repairers/repairersDataService';
import { RepairersDataTransformer } from '@/services/repairers/repairersDataTransformer';
import { DistanceCalculator } from '@/utils/geolocation/distanceCalculator';
import { logger } from '@/utils/logger';
import { withErrorHandling, ErrorHandler } from '@/utils/errorHandling';
import { validateSearchFilters } from '@/utils/validation';
import { measurePerformance, TTLCache } from '@/utils/performance';

export interface SearchFilters {
  services?: string[];
  brands?: string[];
  priceRange?: [number, number];
  distance?: number;
  minRating?: number;
  openNow?: boolean;
  fastResponse?: boolean;
  city?: string;
  postalCode?: string;
}

// Cache optimisé avec TTL
const cache = new TTLCache<string, Repairer[]>(5 * 60 * 1000); // 5 minutes

export const useRepairersOptimized = (filters?: SearchFilters, userLocation?: [number, number]) => {
  const [repairers, setRepairers] = useState<Repairer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Générer une clé de cache unique basée sur les filtres
  const cacheKey = useMemo(() => {
    return JSON.stringify({ filters, userLocation });
  }, [filters, userLocation]);

  // Validation des filtres
  const filtersValidation = useMemo(() => {
    return validateSearchFilters(filters || {});
  }, [filters]);

  // Fonction de fetch avec gestion d'erreur intégrée
  const fetchRepairersWithErrorHandling = useMemo(() => {
    return withErrorHandling(measurePerformance('fetchRepairers', async (searchFilters: SearchFilters) => {
      const supabaseData = await RepairersDataService.fetchRepairers(searchFilters);
      
      if (!supabaseData || supabaseData.length === 0) {
        return [];
      }

      // Filter out corrupted data
      const validData = supabaseData.filter(repairer => {
        const hasValidName = repairer.name && !repairer.name.includes('�');
        const hasValidCity = repairer.city && !repairer.city.includes('�');
        return hasValidName && hasValidCity;
      });

      // Transform data
      let processedData = RepairersDataTransformer.transformSupabaseData(validData);

      // Apply distance filter if user location is available
      if (userLocation && searchFilters.distance && processedData.length > 0) {
        processedData = DistanceCalculator.filterByDistance(
          processedData, 
          userLocation, 
          searchFilters.distance
        );
      }

      return processedData;
    }));
  }, [userLocation]);

  const fetchRepairers = useCallback(async () => {
    // Validation des filtres avant la requête
    if (!filtersValidation.isValid) {
      logger.warn('Filtres invalides:', filtersValidation.errors);
      setError('Filtres de recherche invalides');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Vérifier le cache d'abord
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        logger.debug('Using cached repairers data');
        setRepairers(cachedData);
        setLoading(false);
        return;
      }

      logger.debug('Fetching repairers with filters:', filters);
      
      const result = await fetchRepairersWithErrorHandling(filters || {});
      
      if (result.error) {
        const errorMessage = ErrorHandler.getDisplayMessage(result.error);
        setError(errorMessage);
        setRepairers([]);
        
        toast({
          title: "Erreur de chargement",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      const processedData = result.data || [];
      setRepairers(processedData);
      cache.set(cacheKey, processedData);
      
      // Show success toast only if significant results
      if (processedData.length > 5) {
        toast({
          title: "Réparateurs chargés",
          description: `${processedData.length} réparateur${processedData.length > 1 ? 's' : ''} trouvé${processedData.length > 1 ? 's' : ''}`,
        });
      }
      
    } catch (err) {
      const appError = ErrorHandler.handle(err);
      const errorMessage = ErrorHandler.getDisplayMessage(appError);
      
      logger.error('Error fetching repairers:', appError);
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
  }, [filters, userLocation, cacheKey, filtersValidation, fetchRepairersWithErrorHandling, toast]);

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
      cache.clear();
      logger.debug('Cache cleared due to repairers update');
      fetchRepairers().catch(err => {
        const appError = ErrorHandler.handle(err);
        logger.error('Error during repairers update:', appError);
      });
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