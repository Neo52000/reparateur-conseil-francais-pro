
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { SearchFilters } from '@/hooks/useRepairers';

type SupabaseRepairer = Database['public']['Tables']['repairers']['Row'];

export class RepairersDataService {
  static async fetchRepairers(filters?: SearchFilters): Promise<SupabaseRepairer[]> {
    console.log('RepairersDataService - Fetching from Supabase...');
    console.log('RepairersDataService - Applied filters:', filters);

    let query = supabase
      .from('repairers')
      .select('*')
      .order('rating', { ascending: false });

    // Apply filters only if they are valid
    if (filters?.city && filters.city.trim() !== '') {
      console.log('RepairersDataService - Applying city filter:', filters.city);
      query = query.ilike('city', `%${filters.city.trim()}%`);
    }

    if (filters?.postalCode && filters.postalCode.trim() !== '') {
      console.log('RepairersDataService - Applying postal code filter:', filters.postalCode);
      query = query.like('postal_code', `${filters.postalCode.trim()}%`);
    }

    if (filters?.services && Array.isArray(filters.services) && filters.services.length > 0) {
      const validServices = filters.services.filter(service => 
        service && typeof service === 'string' && service.trim() !== ''
      );
      if (validServices.length > 0) {
        console.log('RepairersDataService - Applying services filter:', validServices);
        query = query.overlaps('services', validServices);
      }
    }

    if (filters?.minRating && typeof filters.minRating === 'number') {
      query = query.gte('rating', filters.minRating);
    }

    if (filters?.priceRange && filters.priceRange.trim() !== '') {
      query = query.eq('price_range', filters.priceRange);
    }

    // Limit results for performance
    query = query.limit(200);

    const { data, error } = await query;

    if (error) {
      console.error('RepairersDataService - Supabase error:', error);
      throw error;
    }

    console.log('RepairersDataService - Data received:', data?.length || 0, 'items');
    return data || [];
  }
}
