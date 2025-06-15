
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export interface RepairerDB {
  id: string;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  department: string;
  region: string;
  phone?: string;
  website?: string;
  email?: string;
  lat: number;
  lng: number;
  rating?: number;
  review_count?: number;
  services: string[];
  specialties: string[];
  price_range: 'low' | 'medium' | 'high';
  response_time?: string;
  opening_hours?: Record<string, string>;
  is_verified: boolean;
  is_open?: boolean;
  source: 'pages_jaunes' | 'google_places' | 'manual';
  scraped_at: string;
  updated_at: string;
  created_at: string;
}

export const useRepairers = (filters?: SearchFilters, userLocation?: [number, number]) => {
  const [repairers, setRepairers] = useState<RepairerDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRepairers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('useRepairers - Fetching from Supabase...');

      let query = supabase
        .from('repairers')
        .select('*')
        .order('rating', { ascending: false });

      // Appliquer les filtres
      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }

      if (filters?.postalCode) {
        query = query.like('postal_code', `${filters.postalCode}%`);
      }

      if (filters?.services && filters.services.length > 0) {
        query = query.overlaps('services', filters.services);
      }

      if (filters?.minRating) {
        query = query.gte('rating', filters.minRating);
      }

      if (filters?.priceRange) {
        query = query.eq('price_range', filters.priceRange);
      }

      // Limiter les résultats pour les performances
      query = query.limit(100);

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('useRepairers - Supabase error:', fetchError);
        throw fetchError;
      }

      console.log('useRepairers - Supabase data received:', data);
      console.log('useRepairers - Supabase data length:', data?.length || 0);
      
      if (data && data.length > 0) {
        // Log détaillé de chaque réparateur
        data.forEach((repairer, index) => {
          console.log(`useRepairers - Real Repairer ${index + 1}:`, {
            id: repairer.id,
            name: repairer.name,
            city: repairer.city,
            services: repairer.services
          });
        });

        // Calculer la distance si la position utilisateur est disponible
        let processedData = data;
        if (userLocation && filters?.distance) {
          processedData = data.filter(repairer => {
            if (!repairer.lat || !repairer.lng) return false;
            const distance = calculateDistance(
              userLocation[1], userLocation[0],
              repairer.lat, repairer.lng
            );
            return distance <= (filters.distance || 50);
          });
        }

        console.log('useRepairers - Setting real repairers from Supabase:', processedData);
        setRepairers(processedData);
      } else {
        console.log('useRepairers - No data found in Supabase');
        setRepairers([]);
      }
      
    } catch (err) {
      console.error('useRepairers - Error fetching real data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des réparateurs';
      setError(errorMessage);
      setRepairers([]);
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useRepairers - Effect triggered, filters:', filters);
    fetchRepairers();
  }, [filters, userLocation]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Log final avant le retour
  console.log('useRepairers - Final real repairers state:', repairers);
  console.log('useRepairers - Final real repairers count:', repairers.length);

  return {
    repairers,
    loading,
    error,
    refetch: fetchRepairers
  };
};
