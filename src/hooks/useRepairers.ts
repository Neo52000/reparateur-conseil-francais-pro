
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Repairer } from '@/types/repairer';
import { RepairersDataService } from '@/services/repairers/repairersDataService';
import { RepairersDataTransformer } from '@/services/repairers/repairersDataTransformer';
import { DistanceCalculator } from '@/utils/geolocation/distanceCalculator';

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

export const useRepairers = (filters?: SearchFilters, userLocation?: [number, number]) => {
  const [repairers, setRepairers] = useState<Repairer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRepairers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supabaseData = await RepairersDataService.fetchRepairers(filters);
      
      if (supabaseData && supabaseData.length > 0) {
        // Filtrer les données valides avant transformation
        const validData = supabaseData.filter(repairer => {
          // Exclure les réparateurs avec des données corrompues
          const hasValidName = repairer.name && !repairer.name.includes('�');
          const hasValidCity = repairer.city && !repairer.city.includes('�');
          const hasValidCoords = repairer.lat !== null && repairer.lng !== null && 
                                typeof repairer.lat === 'number' && typeof repairer.lng === 'number';
          
          return hasValidName && hasValidCity && hasValidCoords;
        });

        console.log(`useRepairers - Filtered ${validData.length} valid repairers from ${supabaseData.length} total`);

        // Transform valid data only
        let processedData = RepairersDataTransformer.transformSupabaseData(validData);

        // Apply distance filter if user location is available
        if (userLocation && filters?.distance && processedData.length > 0) {
          processedData = DistanceCalculator.filterByDistance(
            processedData, 
            userLocation, 
            filters.distance
          );
        }

        console.log('useRepairers - Setting valid repairers:', processedData.length);
        setRepairers(processedData);
      } else {
        console.log('useRepairers - No valid data found');
        setRepairers([]);
      }
      
    } catch (err) {
      console.error('useRepairers - Error fetching data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des réparateurs';
      setError(errorMessage);
      setRepairers([]); // Toujours assigner un tableau vide en cas d'erreur
      
      // Ne montrer le toast d'erreur que pour les vraies erreurs de connexion
      if (err instanceof Error && !err.message.includes('No rows')) {
        toast({
          title: "Problème de connexion",
          description: "Certains réparateurs peuvent ne pas s'afficher correctement.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ajouter un délai pour éviter les appels trop fréquents
    const timeoutId = setTimeout(() => {
      console.log('useRepairers - Effect triggered with filters:', filters);
      fetchRepairers();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [filters, userLocation]);

  // Listen for repairers update events avec gestion d'erreur
  useEffect(() => {
    const handleRepairersUpdate = () => {
      console.log('useRepairers - Received repairersUpdated event, refetching...');
      fetchRepairers().catch(console.error);
    };

    window.addEventListener('repairersUpdated', handleRepairersUpdate);
    
    return () => {
      window.removeEventListener('repairersUpdated', handleRepairersUpdate);
    };
  }, []);

  console.log('useRepairers - Final state:', { 
    count: repairers.length, 
    loading, 
    hasError: !!error 
  });

  return {
    repairers,
    loading,
    error,
    refetch: fetchRepairers
  };
};
