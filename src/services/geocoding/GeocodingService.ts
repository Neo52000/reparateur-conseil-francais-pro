
interface GeocodingResult {
  lat: number;
  lng: number;
  formatted_address: string;
  accuracy: 'precise' | 'approximate';
}

export class GeocodingService {
  private static NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
  private static cache = new Map<string, GeocodingResult>();

  static async geocodeAddress(address: string, city?: string, postalCode?: string): Promise<GeocodingResult | null> {
    try {
      let query = address;
      if (city) query += `, ${city}`;
      if (postalCode) query += `, ${postalCode}`;
      query += ', France';

      // Vérifier le cache
      const cacheKey = query.toLowerCase();
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!;
      }

      console.log(`🗺️ Géocodage de: ${query}`);

      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: '1',
        countrycodes: 'fr',
        addressdetails: '1'
      });

      const response = await fetch(`${this.NOMINATIM_URL}?${params}`, {
        headers: {
          'User-Agent': 'RepairMap-Scraper/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const results = await response.json();
      
      if (!results || results.length === 0) {
        console.warn(`❌ Aucun résultat de géocodage pour: ${query}`);
        return null;
      }

      const result = results[0];
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);

      if (isNaN(lat) || isNaN(lng)) {
        console.warn(`❌ Coordonnées invalides pour: ${query}`);
        return null;
      }

      const geocodingResult: GeocodingResult = {
        lat: Math.round(lat * 1000000) / 1000000,
        lng: Math.round(lng * 1000000) / 1000000,
        formatted_address: result.display_name,
        accuracy: this.determineAccuracy(result)
      };

      // Mettre en cache
      this.cache.set(cacheKey, geocodingResult);

      console.log(`✅ Géocodage réussi: ${lat}, ${lng} pour ${query}`);
      
      // Délai pour respecter les limites de l'API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return geocodingResult;

    } catch (error) {
      console.error('Erreur de géocodage:', error);
      return null;
    }
  }

  private static determineAccuracy(result: any): 'precise' | 'approximate' {
    const type = result.type || '';
    const osm_type = result.osm_type || '';
    
    if (type.includes('house') || type.includes('building') || osm_type === 'way') {
      return 'precise';
    }
    
    return 'approximate';
  }

  static async batchGeocode(addresses: Array<{address: string, city?: string, postalCode?: string}>): Promise<Array<GeocodingResult | null>> {
    const results: Array<GeocodingResult | null> = [];
    
    for (const addr of addresses) {
      const result = await this.geocodeAddress(addr.address, addr.city, addr.postalCode);
      results.push(result);
    }
    
    return results;
  }
}
