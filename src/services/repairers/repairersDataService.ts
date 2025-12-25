
import { supabase } from '@/integrations/supabase/client';
import type { SearchFilters } from '@/types/searchFilters';
import { SecureDataAccess } from '@/services/secureDataAccess';

export class RepairersDataService {
  /**
   * Fetch repairers from database with optional filters
   * Uses secure views for public access, full table for admins
   */
  static async fetchRepairers(filters?: SearchFilters) {
    try {
      console.log('🔍 RepairersDataService: Fetching repairers with filters:', filters);
      
      // Utiliser l'accès sécurisé automatique
      const table = await SecureDataAccess.getRepairersTable();
      
      let query = (supabase as any).from(table).select('*');

      // Apply filters if provided
      if (filters?.services && filters.services.length > 0) {
        query = query.overlaps('services', filters.services);
      }

      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }

      if (filters?.postalCode) {
        query = query.ilike('postal_code', `${filters.postalCode}%`);
      }

      if (filters?.priceRange) {
        const [minPrice, maxPrice] = filters.priceRange;
        query = query.gte('min_price', minPrice).lte('max_price', maxPrice);
      }

      if (filters?.minRating) {
        query = query.gte('rating', filters.minRating);
      }

      // Order by rating and review count for better results
      // Filtrer uniquement les réparateurs avec coordonnées GPS pour la carte
      query = query
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        .order('rating', { ascending: false, nullsFirst: false })
        .order('review_count', { ascending: false, nullsFirst: false })
        .limit(3000); // Augmenter la limite pour afficher tous les réparateurs géolocalisés

      const { data, error } = await query;

      if (error) {
        console.error('RepairersDataService: Error fetching repairers:', error);
        throw error;
      }

      console.log(`RepairersDataService: Fetched ${data?.length || 0} repairers from database`);
      console.log('Sample repairer data:', data?.[0]);

      return data || [];
      
    } catch (error) {
      console.error('RepairersDataService: Failed to fetch repairers:', error);
      throw error;
    }
  }

  /**
   * Get total count of repairers in database
   */
  static async getTotalCount(): Promise<number> {
    try {
      const table = await SecureDataAccess.getRepairersTable();
      
      const { count, error } = await (supabase as any).from(table).select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('RepairersDataService: Error getting total count:', error);
      return 0;
    }
  }

  /**
   * Get repairers stats for debugging
   */
  static async getStats() {
    try {
      const table = await SecureDataAccess.getRepairersTable();
      
      const supabaseAny = supabase as any;
      const [totalResult, verifiedResult, withProperCoordsResult] = await Promise.all([
        supabaseAny.from(table).select('*', { count: 'exact', head: true }),
        supabaseAny.from(table).select('*', { count: 'exact', head: true }).eq('is_verified', true),
        supabaseAny.from(table).select('*', { count: 'exact', head: true })
          .not('lat', 'is', null)
          .not('lng', 'is', null)
      ]);

      return {
        total: totalResult.count || 0,
        verified: verifiedResult.count || 0,
        withCoordinates: withProperCoordsResult.count || 0
      };
    } catch (error) {
      console.error('RepairersDataService: Error getting stats:', error);
      return { total: 0, verified: 0, withCoordinates: 0 };
    }
  }
}
