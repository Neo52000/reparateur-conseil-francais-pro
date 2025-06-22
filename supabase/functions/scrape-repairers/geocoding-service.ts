
interface GeocodingResult {
  lat: number;
  lng: number;
  formatted_address: string;
  accuracy: 'precise' | 'approximate';
}

export class GeocodingService {
  private static NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

  static async geocodeAddress(address: string, city?: string, postalCode?: string): Promise<GeocodingResult | null> {
    try {
      let query = address;
      if (city) query += `, ${city}`;
      if (postalCode) query += `, ${postalCode}`;
      query += ', France';

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

      console.log(`✅ Géocodage réussi: ${lat}, ${lng} pour ${query}`);

      return {
        lat: Math.round(lat * 1000000) / 1000000,
        lng: Math.round(lng * 1000000) / 1000000,
        formatted_address: result.display_name,
        accuracy: this.determineAccuracy(result)
      };

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

  static getFallbackCoordinates(postalCode: string): { lat: number; lng: number } {
    const departmentCode = postalCode.substring(0, 2);
    
    const departmentCoords: Record<string, { lat: number; lng: number }> = {
      '75': { lat: 48.8566, lng: 2.3522 }, // Paris
      '69': { lat: 45.7640, lng: 4.8357 }, // Lyon
      '13': { lat: 43.2965, lng: 5.3698 }, // Marseille
      '31': { lat: 43.6047, lng: 1.4442 }, // Toulouse
      '06': { lat: 43.7102, lng: 7.2620 }, // Nice
      '33': { lat: 44.8378, lng: -0.5792 }, // Bordeaux
      '59': { lat: 50.6292, lng: 3.0573 }, // Lille
      '67': { lat: 48.5734, lng: 7.7521 }, // Strasbourg
      '44': { lat: 47.2184, lng: -1.5536 }, // Nantes
      '35': { lat: 48.1173, lng: -1.6778 }  // Rennes
    };
    
    return departmentCoords[departmentCode] || { lat: 46.603354, lng: 1.888334 };
  }
}
