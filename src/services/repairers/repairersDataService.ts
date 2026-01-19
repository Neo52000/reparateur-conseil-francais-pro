
import { supabase } from '@/integrations/supabase/client';
import type { SearchFilters } from '@/types/searchFilters';
import { SecureDataAccess } from '@/services/secureDataAccess';
import { fetchRepairersWithGPS } from '@/services/supabase/paginate';

export class RepairersDataService {
  /**
   * Fetch repairers from database with optional filters
   * Uses pagination to bypass 1000 row limit
   */
  static async fetchRepairers(filters?: SearchFilters) {
    try {
      console.log('🔍 RepairersDataService: Fetching ALL repairers with GPS using pagination...');
      
      // Utiliser la pagination pour récupérer TOUS les réparateurs avec GPS
      const { data, error, total } = await fetchRepairersWithGPS((progress) => {
        console.log(`📊 Map loading: ${progress.loaded}/${progress.total || '?'}`);
      });

      if (error) {
        console.error('RepairersDataService: Error fetching repairers:', error);
        throw error;
      }

      console.log(`RepairersDataService: Fetched ${data.length} repairers with GPS (total: ${total})`);

      // Apply additional filters if provided
      let filteredData = data;

      if (filters?.services && filters.services.length > 0) {
        filteredData = filteredData.filter(r => 
          r.services && filters.services!.some(s => r.services.includes(s))
        );
      }

      if (filters?.city) {
        const cityLower = filters.city.toLowerCase();
        filteredData = filteredData.filter(r => 
          r.city?.toLowerCase().includes(cityLower)
        );
      }

      if (filters?.postalCode) {
        filteredData = filteredData.filter(r => 
          r.postal_code?.startsWith(filters.postalCode!)
        );
      }

      if (filters?.minRating) {
        filteredData = filteredData.filter(r => 
          r.rating && r.rating >= filters.minRating!
        );
      }

      console.log(`RepairersDataService: After filters: ${filteredData.length} repairers`);
      return filteredData;
      
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
