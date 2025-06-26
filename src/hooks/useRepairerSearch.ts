
import { useState, useEffect } from 'react';
import { SearchIntegrationService } from '@/services/pricing/searchIntegrationService';
import { useToast } from '@/hooks/use-toast';

interface SearchFilters {
  deviceModelId?: string;
  repairTypeId?: string;
  location?: {
    lat: number;
    lng: number;
    radius?: number;
  };
  maxPrice?: number;
  minPrice?: number;
}

export const useRepairerSearch = () => {
  const [results, setResults] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const searchRepairers = async (filters: SearchFilters) => {
    if (!filters.deviceModelId || !filters.repairTypeId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [searchResults, priceStats] = await Promise.all([
        SearchIntegrationService.searchRepairersByRepairType(
          filters.deviceModelId,
          filters.repairTypeId,
          filters.location
        ),
        SearchIntegrationService.getPriceStatistics(
          filters.deviceModelId,
          filters.repairTypeId
        )
      ]);

      // Filtrer par prix si spécifié
      let filteredResults = searchResults;
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        filteredResults = searchResults.filter((repairer: any) => {
          const price = repairer.custom_price;
          const minOk = filters.minPrice === undefined || price >= filters.minPrice;
          const maxOk = filters.maxPrice === undefined || price <= filters.maxPrice;
          return minOk && maxOk;
        });
      }

      setResults(filteredResults);
      setStatistics(priceStats);

    } catch (err) {
      console.error('Error searching repairers:', err);
      setError('Erreur lors de la recherche des réparateurs');
      toast({
        title: 'Erreur',
        description: 'Impossible de rechercher les réparateurs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRepairerPrices = async (repairerId: string) => {
    try {
      setLoading(true);
      const prices = await SearchIntegrationService.getRepairerPrices(repairerId);
      return prices;
    } catch (err) {
      console.error('Error getting repairer prices:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les prix du réparateur',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setStatistics(null);
    setError(null);
  };

  return {
    results,
    statistics,
    loading,
    error,
    searchRepairers,
    getRepairerPrices,
    clearResults
  };
};
