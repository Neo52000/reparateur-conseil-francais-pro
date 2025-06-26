
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
        // Log detailed information about each repairer
        supabaseData.forEach((repairer, index) => {
          console.log(`useRepairers - Repairer ${index + 1}:`, {
            id: repairer.id,
            name: repairer.name,
            city: repairer.city,
            services: repairer.services,
            is_verified: repairer.is_verified,
            lat: repairer.lat,
            lng: repairer.lng
          });
        });

        // Transform Supabase data to our format
        let processedData = RepairersDataTransformer.transformSupabaseData(supabaseData);

        // Apply distance filter if user location is available
        if (userLocation && filters?.distance) {
          processedData = DistanceCalculator.filterByDistance(
            processedData, 
            userLocation, 
            filters.distance
          );
        }

        console.log('useRepairers - Setting repairers from Supabase:', processedData);
        setRepairers(processedData);
      } else {
        console.log('useRepairers - No data found in Supabase');
        setRepairers([]);
      }
      
    } catch (err) {
      console.error('useRepairers - Error fetching data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des réparateurs';
      setError(errorMessage);
      setRepairers([]);
      
      // Don't show toast error if it's just no data
      if (!(err instanceof Error) || !err.message.includes('No rows')) {
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useRepairers - Effect triggered, filters:', filters);
    fetchRepairers();
  }, [filters, userLocation]);

  // Listen for repairers update events
  useEffect(() => {
    const handleRepairersUpdate = () => {
      console.log('useRepairers - Received repairersUpdated event, refetching...');
      fetchRepairers();
    };

    window.addEventListener('repairersUpdated', handleRepairersUpdate);
    
    return () => {
      window.removeEventListener('repairersUpdated', handleRepairersUpdate);
    };
  }, []);

  console.log('useRepairers - Final repairers state:', repairers);
  console.log('useRepairers - Final repairers count:', repairers.length);

  return {
    repairers,
    loading,
    error,
    refetch: fetchRepairers
  };
};
