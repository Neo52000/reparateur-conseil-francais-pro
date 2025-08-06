
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Repairer } from '@/types/repairer';
import type { SearchFilters } from '@/types/searchFilters';
import { RepairersDataService } from '@/services/repairers/repairersDataService';
import { RepairersDataTransformer } from '@/services/repairers/repairersDataTransformer';
import { DistanceCalculator } from '@/utils/geolocation/distanceCalculator';

export const useRepairers = (filters?: SearchFilters, userLocation?: [number, number]) => {
  const [repairers, setRepairers] = useState<Repairer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRepairers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('useRepairers - Starting fetch with filters:', filters);
      
      // Get database stats for debugging
      const stats = await RepairersDataService.getStats();
      console.log('useRepairers - Database stats:', stats);
      
      const supabaseData = await RepairersDataService.fetchRepairers(filters);
      console.log('useRepairers - Raw data from service:', supabaseData?.length);
      
      if (supabaseData && supabaseData.length > 0) {
        // Show a sample of the data for debugging
        console.log('useRepairers - Sample repairer:', supabaseData[0]);
        
        // Filter out repairers with corrupted data
        const validData = supabaseData.filter(repairer => {
          const hasValidName = repairer.name && !repairer.name.includes('�');
          const hasValidCity = repairer.city && !repairer.city.includes('�');
          
          if (!hasValidName || !hasValidCity) {
            console.log('useRepairers - Filtering out corrupted repairer:', repairer.name);
            return false;
          }
          
          return true;
        });

        console.log(`useRepairers - Valid repairers after filtering: ${validData.length}/${supabaseData.length}`);

        // Transform data
        let processedData = RepairersDataTransformer.transformSupabaseData(validData);
        console.log('useRepairers - Transformed data count:', processedData.length);

        // Apply distance filter if user location is available
        if (userLocation && filters?.distance && processedData.length > 0) {
          const beforeDistance = processedData.length;
          processedData = DistanceCalculator.filterByDistance(
            processedData, 
            userLocation, 
            filters.distance
          );
          console.log(`useRepairers - After distance filter: ${processedData.length}/${beforeDistance}`);
        }

        setRepairers(processedData);
        
        // Show success toast with count
        if (processedData.length > 0) {
          toast({
            title: "Réparateurs chargés",
            description: `${processedData.length} réparateur${processedData.length > 1 ? 's' : ''} trouvé${processedData.length > 1 ? 's' : ''}`,
          });
        }
      } else {
        console.log('useRepairers - No data returned from service');
        setRepairers([]);
        
        // Check if this is due to no verified repairers
        const stats = await RepairersDataService.getStats();
        if (stats.total > 0 && stats.verified === 0) {
          toast({
            title: "Aucun réparateur vérifié",
            description: `${stats.total} réparateur(s) en base mais aucun vérifié. Activez la vérification depuis l'admin.`,
            variant: "destructive"
          });
        }
      }
      
    } catch (err) {
      console.error('useRepairers - Error fetching data:', err);
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
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('useRepairers - Effect triggered, fetching repairers...');
      fetchRepairers();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [filters, userLocation]);

  // Listen for repairers update events
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

  console.log('useRepairers - Current state:', { 
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
