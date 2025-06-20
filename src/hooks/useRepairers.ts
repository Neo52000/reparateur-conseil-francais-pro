
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import type { Repairer } from '@/types/repairer';

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

// Utiliser le type généré par Supabase
type SupabaseRepairer = Database['public']['Tables']['repairers']['Row'];

export const useRepairers = (filters?: SearchFilters, userLocation?: [number, number]) => {
  const [repairers, setRepairers] = useState<Repairer[]>([]);
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

        // Convertir les données Supabase vers notre format avec validation du price_range
        const processedData: Repairer[] = data.map((repairer: SupabaseRepairer): Repairer => ({
          id: repairer.id,
          name: repairer.name,
          business_name: repairer.name, // Mapper name vers business_name pour compatibilité
          address: repairer.address,
          city: repairer.city,
          postal_code: repairer.postal_code,
          department: repairer.department || '',
          region: repairer.region || '',
          phone: repairer.phone || undefined,
          website: repairer.website || undefined,
          email: repairer.email || undefined,
          lat: Number(repairer.lat) || 0,
          lng: Number(repairer.lng) || 0,
          rating: repairer.rating || undefined,
          review_count: repairer.review_count || undefined,
          services: repairer.services || [],
          specialties: repairer.specialties || [],
          price_range: (repairer.price_range === 'low' || repairer.price_range === 'medium' || repairer.price_range === 'high') 
            ? repairer.price_range 
            : 'medium',
          response_time: repairer.response_time || undefined,
          opening_hours: repairer.opening_hours ? 
            (typeof repairer.opening_hours === 'object' ? repairer.opening_hours as Record<string, string> : null) : 
            null,
          is_verified: repairer.is_verified || false,
          is_open: repairer.is_open || undefined,
          has_qualirepar_label: false, // Valeur par défaut
          source: repairer.source as 'pages_jaunes' | 'google_places' | 'manual',
          scraped_at: repairer.scraped_at,
          updated_at: repairer.updated_at,
          created_at: repairer.created_at
        }));

        // Calculer la distance si la position utilisateur est disponible
        let filteredData = processedData;
        if (userLocation && filters?.distance) {
          filteredData = processedData.filter(repairer => {
            if (!repairer.lat || !repairer.lng) return false;
            const distance = calculateDistance(
              userLocation[1], userLocation[0],
              Number(repairer.lat), Number(repairer.lng)
            );
            return distance <= (filters.distance || 50);
          });
        }

        console.log('useRepairers - Setting real repairers from Supabase:', filteredData);
        setRepairers(filteredData);
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
