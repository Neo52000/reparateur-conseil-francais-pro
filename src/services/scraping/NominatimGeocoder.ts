
interface GeocodingResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  accuracy: 'precise' | 'approximate' | 'fallback';
}

export class NominatimGeocoder {
  private baseUrl = 'https://nominatim.openstreetmap.org/search';
  private cache = new Map<string, GeocodingResult>();

  async geocodeAddress(address: string, city: string, postalCode: string): Promise<GeocodingResult | null> {
    const fullAddress = `${address}, ${postalCode} ${city}, France`;
    const cacheKey = fullAddress.toLowerCase();
    
    // Vérifier le cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const params = new URLSearchParams({
        q: fullAddress,
        format: 'json',
        limit: '1',
        countrycodes: 'fr',
        addressdetails: '1'
      });

      const response = await fetch(`${this.baseUrl}?${params}`, {
        headers: {
          'User-Agent': 'RepairMap-Scraper/2.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const results = await response.json();
      
      if (!results || results.length === 0) {
        console.warn(`Aucun résultat de géocodage pour: ${fullAddress}`);
        return this.getFallbackCoordinates(postalCode);
      }

      const result = results[0];
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);

      if (isNaN(lat) || isNaN(lng)) {
        console.warn(`Coordonnées invalides pour: ${fullAddress}`);
        return this.getFallbackCoordinates(postalCode);
      }

      const geocodingResult: GeocodingResult = {
        lat: Math.round(lat * 1000000) / 1000000,
        lng: Math.round(lng * 1000000) / 1000000,
        formattedAddress: result.display_name,
        accuracy: this.determineAccuracy(result)
      };

      // Mettre en cache
      this.cache.set(cacheKey, geocodingResult);
      
      console.log(`✅ Géocodage réussi: ${lat}, ${lng} pour ${fullAddress}`);
      
      // Délai pour respecter les limites de l'API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return geocodingResult;

    } catch (error) {
      console.error('Erreur de géocodage:', error);
      return this.getFallbackCoordinates(postalCode);
    }
  }

  private determineAccuracy(result: any): 'precise' | 'approximate' | 'fallback' {
    const type = result.type || '';
    const osmType = result.osm_type || '';
    
    if (type.includes('house') || type.includes('building') || osmType === 'way') {
      return 'precise';
    }
    
    return 'approximate';
  }

  private getFallbackCoordinates(postalCode: string): GeocodingResult {
    const departmentCode = postalCode.substring(0, 2);
    
    const departmentCoords: Record<string, { lat: number; lng: number; name: string }> = {
      '75': { lat: 48.8566, lng: 2.3522, name: 'Paris' },
      '69': { lat: 45.7640, lng: 4.8357, name: 'Lyon' },
      '13': { lat: 43.2965, lng: 5.3698, name: 'Marseille' },
      '31': { lat: 43.6047, lng: 1.4442, name: 'Toulouse' },
      '06': { lat: 43.7102, lng: 7.2620, name: 'Nice' },
      '33': { lat: 44.8378, lng: -0.5792, name: 'Bordeaux' },
      '59': { lat: 50.6292, lng: 3.0573, name: 'Lille' },
      '67': { lat: 48.5734, lng: 7.7521, name: 'Strasbourg' },
      '44': { lat: 47.2184, lng: -1.5536, name: 'Nantes' },
      '35': { lat: 48.1173, lng: -1.6778, name: 'Rennes' }
    };
    
    const coords = departmentCoords[departmentCode] || { lat: 46.603354, lng: 1.888334, name: 'France' };
    
    return {
      lat: coords.lat + (Math.random() - 0.5) * 0.01,
      lng: coords.lng + (Math.random() - 0.5) * 0.01,
      formattedAddress: `${coords.name}, France`,
      accuracy: 'fallback'
    };
  }

  async batchGeocode(addresses: Array<{address: string, city: string, postalCode: string}>): Promise<Array<GeocodingResult | null>> {
    const results: Array<GeocodingResult | null> = [];
    
    for (const addr of addresses) {
      const result = await this.geocodeAddress(addr.address, addr.city, addr.postalCode);
      results.push(result);
    }
    
    return results;
  }
}
