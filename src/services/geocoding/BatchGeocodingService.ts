
import { supabase } from '@/integrations/supabase/client';

interface GeocodingResult {
  lat: number;
  lng: number;
  accuracy: 'precise' | 'approximate';
}

interface GeocodingProgress {
  total: number;
  processed: number;
  success: number;
  failed: number;
  percentage: number;
}

export class BatchGeocodingService {
  private static API_URL = 'https://api-adresse.data.gouv.fr/search/';
  private static BATCH_SIZE = 50;
  private static DELAY_MS = 200; // Délai entre chaque requête pour respecter les limites

  /**
   * Géocode une adresse via l'API adresse.data.gouv.fr
   */
  static async geocodeAddress(
    address: string, 
    city: string, 
    postalCode: string
  ): Promise<GeocodingResult | null> {
    try {
      const query = `${address}, ${postalCode} ${city}`;
      const params = new URLSearchParams({
        q: query,
        limit: '1',
        type: 'housenumber'
      });

      const response = await fetch(`${this.API_URL}?${params}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.features || data.features.length === 0) {
        // Essayer sans le type housenumber
        const fallbackParams = new URLSearchParams({
          q: query,
          limit: '1'
        });
        
        const fallbackResponse = await fetch(`${this.API_URL}?${fallbackParams}`);
        const fallbackData = await fallbackResponse.json();
        
        if (!fallbackData.features || fallbackData.features.length === 0) {
          return null;
        }

        const feature = fallbackData.features[0];
        return {
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0],
          accuracy: 'approximate'
        };
      }

      const feature = data.features[0];
      const score = feature.properties.score || 0;

      return {
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        accuracy: score > 0.8 ? 'precise' : 'approximate'
      };

    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * Récupère les réparateurs sans coordonnées GPS
   */
  static async getRepairersWithoutGps(): Promise<Array<{
    id: string;
    address: string;
    city: string;
    postal_code: string;
    name: string;
  }>> {
    const PAGE_SIZE = 1000;
    const allData: Array<{
      id: string;
      address: string;
      city: string;
      postal_code: string;
      name: string;
    }> = [];
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('repairers')
        .select('id, address, city, postal_code, name')
        .or('lat.is.null,lat.eq.0')
        .order('created_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (error) {
        console.error('Error fetching repairers without GPS:', error);
        throw error;
      }

      if (data && data.length > 0) {
        allData.push(...data);
        from += PAGE_SIZE;
        if (data.length < PAGE_SIZE) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    console.log(`📍 Found ${allData.length} repairers without GPS (paginated)`);
    return allData;
  }

  /**
   * Met à jour les coordonnées d'un réparateur
   */
  static async updateRepairerCoordinates(
    repairerId: string, 
    lat: number, 
    lng: number
  ): Promise<boolean> {
    const { error } = await supabase
      .from('repairers')
      .update({ lat, lng })
      .eq('id', repairerId);

    if (error) {
      console.error('Error updating coordinates:', error);
      return false;
    }

    return true;
  }

  /**
   * Lance le géocodage batch pour tous les réparateurs sans GPS
   */
  static async runBatchGeocoding(
    onProgress?: (progress: GeocodingProgress) => void,
    signal?: AbortSignal
  ): Promise<GeocodingProgress> {
    console.log('🚀 Starting batch geocoding...');
    
    const repairers = await this.getRepairersWithoutGps();
    
    const progress: GeocodingProgress = {
      total: repairers.length,
      processed: 0,
      success: 0,
      failed: 0,
      percentage: 0
    };

    console.log(`📍 Found ${repairers.length} repairers without GPS coordinates`);

    if (repairers.length === 0) {
      return progress;
    }

    for (const repairer of repairers) {
      // Vérifier si l'opération a été annulée
      if (signal?.aborted) {
        console.log('⛔ Batch geocoding aborted');
        break;
      }

      try {
        const result = await this.geocodeAddress(
          repairer.address,
          repairer.city,
          repairer.postal_code
        );

        if (result) {
          const updated = await this.updateRepairerCoordinates(
            repairer.id,
            result.lat,
            result.lng
          );

          if (updated) {
            progress.success++;
            console.log(`✅ Geocoded: ${repairer.name} (${result.accuracy})`);
          } else {
            progress.failed++;
          }
        } else {
          progress.failed++;
          console.log(`❌ Failed to geocode: ${repairer.name}`);
        }
      } catch (error) {
        progress.failed++;
        console.error(`❌ Error geocoding ${repairer.name}:`, error);
      }

      progress.processed++;
      progress.percentage = Math.round((progress.processed / progress.total) * 100);

      if (onProgress) {
        onProgress({ ...progress });
      }

      // Délai entre les requêtes
      await new Promise(resolve => setTimeout(resolve, this.DELAY_MS));
    }

    console.log('✅ Batch geocoding completed:', progress);
    return progress;
  }

  /**
   * Obtient les statistiques de géocodage
   */
  static async getGeocodingStats(): Promise<{
    total: number;
    withGps: number;
    withoutGps: number;
    percentage: number;
  }> {
    // Get total count using exact count (bypasses 1000 row limit)
    const { count: total, error: totalError } = await supabase
      .from('repairers')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      throw totalError;
    }

    // Get count of repairers WITH GPS coordinates
    const { count: withGps, error: withGpsError } = await supabase
      .from('repairers')
      .select('*', { count: 'exact', head: true })
      .not('lat', 'is', null)
      .neq('lat', 0);

    if (withGpsError) {
      throw withGpsError;
    }

    const totalCount = total || 0;
    const withGpsCount = withGps || 0;
    const withoutGps = totalCount - withGpsCount;
    const percentage = totalCount > 0 ? Math.round((withGpsCount / totalCount) * 100) : 0;

    return { total: totalCount, withGps: withGpsCount, withoutGps, percentage };
  }
}
