
import { useState, useEffect } from 'react';
import { supabase, RepairerDB, isSupabaseConfigured } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { MOCK_REPAIRERS } from '@/constants/repairers';

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

// Fonction pour convertir les données mockées au format RepairerDB
const convertMockToRepairersDB = (mockRepairers: any[]): RepairerDB[] => {
  return mockRepairers.map((repairer, index) => ({
    id: repairer.id.toString(),
    name: repairer.name,
    address: repairer.address,
    city: repairer.address.split(',')[1]?.trim() || 'Paris',
    postal_code: '75001',
    department: '75',
    region: 'Île-de-France',
    phone: '+33123456789',
    lat: repairer.lat,
    lng: repairer.lng,
    rating: repairer.rating,
    review_count: repairer.reviewCount,
    services: repairer.services,
    specialties: repairer.services,
    price_range: repairer.averagePrice === '€' ? 'low' : repairer.averagePrice === '€€' ? 'medium' : 'high',
    response_time: repairer.responseTime,
    is_verified: true,
    is_open: true,
    source: 'manual' as const,
    scraped_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  }));
};

export const useRepairers = (filters?: SearchFilters, userLocation?: [number, number]) => {
  const [repairers, setRepairers] = useState<RepairerDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRepairers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('useRepairers - Fetching repairers...');
      console.log('useRepairers - Supabase configured:', isSupabaseConfigured());

      // Toujours essayer de récupérer les données de Supabase d'abord
      if (isSupabaseConfigured() && supabase) {
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
        console.log('useRepairers - Supabase data length:', data?.length);
        
        // Log détaillé de chaque réparateur
        if (data && data.length > 0) {
          data.forEach((repairer, index) => {
            console.log(`useRepairers - Repairer ${index + 1}:`, {
              id: repairer.id,
              name: repairer.name,
              city: repairer.city,
              services: repairer.services
            });
          });
        }

        if (data && data.length > 0) {
          // Calculer la distance si la position utilisateur est disponible
          let processedData = data;
          if (userLocation && filters?.distance) {
            processedData = data.filter(repairer => {
              const distance = calculateDistance(
                userLocation[1], userLocation[0],
                repairer.lat, repairer.lng
              );
              return distance <= (filters.distance || 50);
            });
          }

          console.log('useRepairers - Setting repairers from Supabase:', processedData);
          setRepairers(processedData);
          setLoading(false);
          return;
        }
      }

      // Si pas de données Supabase, utiliser les données mockées
      console.log('useRepairers - Using mock data');
      console.log('useRepairers - MOCK_REPAIRERS:', MOCK_REPAIRERS);
      const mockData = convertMockToRepairersDB(MOCK_REPAIRERS);
      console.log('useRepairers - Mock data converted:', mockData);
      
      // Log détaillé de chaque réparateur mocké
      mockData.forEach((repairer, index) => {
        console.log(`useRepairers - Mock Repairer ${index + 1}:`, {
          id: repairer.id,
          name: repairer.name,
          city: repairer.city,
          services: repairer.services
        });
      });
      
      setRepairers(mockData);
      
    } catch (err) {
      console.error('useRepairers - Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des réparateurs';
      setError(errorMessage);
      
      // Utiliser les données mockées en cas d'erreur
      console.log('useRepairers - Fallback to mock data due to error');
      const mockData = convertMockToRepairersDB(MOCK_REPAIRERS);
      console.log('useRepairers - Fallback mock data:', mockData);
      setRepairers(mockData);
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
  console.log('useRepairers - Final repairers state:', repairers);
  console.log('useRepairers - Final repairers count:', repairers.length);

  return {
    repairers,
    loading,
    error,
    refetch: fetchRepairers
  };
};
