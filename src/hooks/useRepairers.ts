
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

      // Si Supabase n'est pas configuré, utiliser les données mockées
      if (!isSupabaseConfigured() || !supabase) {
        console.log('Supabase not configured, using mock data');
        const mockData = convertMockToRepairersDB(MOCK_REPAIRERS);
        setRepairers(mockData);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('repairers')
        .select('*')
        .eq('is_verified', true)
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

      if (fetchError) throw fetchError;

      // Calculer la distance si la position utilisateur est disponible
      let processedData = data || [];
      if (userLocation && filters?.distance) {
        processedData = processedData.filter(repairer => {
          const distance = calculateDistance(
            userLocation[1], userLocation[0],
            repairer.lat, repairer.lng
          );
          return distance <= (filters.distance || 50);
        });
      }

      setRepairers(processedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des réparateurs';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Utiliser les données mockées en cas d'erreur
      const mockData = convertMockToRepairersDB(MOCK_REPAIRERS);
      setRepairers(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  return {
    repairers,
    loading,
    error,
    refetch: fetchRepairers
  };
};
