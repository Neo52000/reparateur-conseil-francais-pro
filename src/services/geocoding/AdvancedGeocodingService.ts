import { supabase } from '@/integrations/supabase/client';

export interface GeocodingResult {
  lat: number;
  lng: number;
  formatted_address: string;
  accuracy: 'precise' | 'approximate' | 'city' | 'fallback';
  confidence: number;
  source: 'nominatim' | 'mapbox' | 'google' | 'cache' | 'fallback';
  components: {
    house_number?: string;
    road?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
}

export interface GeocodingCache {
  query: string;
  result: GeocodingResult;
  timestamp: Date;
  hit_count: number;
}

export class AdvancedGeocodingService {
  private static cache = new Map<string, GeocodingCache>();
  private static readonly CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 jours
  private static readonly MAX_CACHE_SIZE = 10000;

  /**
   * Géocodage intelligent avec plusieurs fallbacks
   */
  static async geocodeAddress(
    address: string, 
    city?: string, 
    postalCode?: string,
    options: {
      useCache?: boolean;
      highAccuracy?: boolean;
      saveToHistory?: boolean;
    } = {}
  ): Promise<GeocodingResult | null> {
    const { useCache = true, highAccuracy = false, saveToHistory = true } = options;
    
    // Construire la requête normalisée
    const query = this.normalizeQuery(address, city, postalCode);
    const cacheKey = this.getCacheKey(query);

    // Vérifier le cache d'abord
    if (useCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        cached.hit_count++;
        return cached.result;
      }
    }

    try {
      let result: GeocodingResult | null = null;

      // 1. Tentative avec Nominatim (gratuit)
      result = await this.geocodeWithNominatim(query, highAccuracy);
      
      // 2. Si échec et haute précision demandée, fallback vers services payants
      if (!result && highAccuracy) {
        result = await this.geocodeWithPremiumServices(query);
      }

      // 3. Fallback sur coordonnées départementales
      if (!result && postalCode) {
        result = this.getFallbackCoordinates(postalCode, city);
      }

      // Mise en cache et historique
      if (result) {
        if (useCache) {
          this.addToCache(cacheKey, result);
        }
        
        if (saveToHistory) {
          await this.saveToHistory(query, result);
        }
      }

      return result;
    } catch (error) {
      console.error('Erreur géocodage avancé:', error);
      
      // Fallback d'urgence
      if (postalCode) {
        return this.getFallbackCoordinates(postalCode, city);
      }
      
      return null;
    }
  }

  /**
   * Géocodage avec Nominatim
   */
  private static async geocodeWithNominatim(
    query: string, 
    highAccuracy: boolean = false
  ): Promise<GeocodingResult | null> {
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: highAccuracy ? '5' : '1',
        countrycodes: 'fr',
        addressdetails: '1',
        extratags: '1',
        namedetails: '1'
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          headers: {
            'User-Agent': 'RepairMap-Advanced/1.0',
            'Accept-Language': 'fr,en;q=0.8'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Nominatim error: ${response.status}`);
      }

      const results = await response.json();
      
      if (!results || results.length === 0) {
        return null;
      }

      // Sélectionner le meilleur résultat
      const bestResult = this.selectBestNominatimResult(results, highAccuracy);
      return this.parseNominatimResult(bestResult);
      
    } catch (error) {
      console.error('Erreur Nominatim:', error);
      return null;
    }
  }

  /**
   * Géocodage avec services premium (Mapbox, Google, etc.)
   */
  private static async geocodeWithPremiumServices(
    query: string
  ): Promise<GeocodingResult | null> {
    // Cette méthode pourrait être étendue pour utiliser des services payants
    // comme Mapbox ou Google Geocoding API si disponibles
    
    // Pour l'instant, on retourne null pour forcer le fallback
    return null;
  }

  /**
   * Sélectionner le meilleur résultat Nominatim
   */
  private static selectBestNominatimResult(results: any[], highAccuracy: boolean): any {
    if (results.length === 1) {
      return results[0];
    }

    // Scoring des résultats
    const scored = results.map(result => {
      let score = 0;
      
      // Précision géographique
      const type = result.type || '';
      if (type.includes('house') || type.includes('building')) score += 10;
      else if (type.includes('road') || type.includes('street')) score += 7;
      else if (type.includes('city') || type.includes('town')) score += 5;
      else score += 2;
      
      // Détails d'adresse disponibles
      if (result.address?.house_number) score += 3;
      if (result.address?.road) score += 2;
      if (result.address?.postcode) score += 1;
      
      // Importance/classification
      const importance = parseFloat(result.importance || '0');
      score += importance * 5;

      return { result, score };
    });

    // Trier par score décroissant
    scored.sort((a, b) => b.score - a.score);
    
    return scored[0].result;
  }

  /**
   * Parser le résultat Nominatim
   */
  private static parseNominatimResult(result: any): GeocodingResult {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    // Déterminer la précision
    let accuracy: GeocodingResult['accuracy'] = 'approximate';
    let confidence = 0.5;
    
    const type = result.type || '';
    const osm_type = result.osm_type || '';
    
    if (type.includes('house') || type.includes('building')) {
      accuracy = 'precise';
      confidence = 0.9;
    } else if (type.includes('road') || type.includes('street')) {
      accuracy = 'approximate';
      confidence = 0.7;
    } else if (type.includes('city') || type.includes('town')) {
      accuracy = 'city';
      confidence = 0.6;
    }

    // Extraire les composants d'adresse
    const components: GeocodingResult['components'] = {};
    if (result.address) {
      components.house_number = result.address.house_number;
      components.road = result.address.road || result.address.street;
      components.city = result.address.city || result.address.town || result.address.village;
      components.postcode = result.address.postcode;
      components.country = result.address.country;
    }

    return {
      lat: Math.round(lat * 1000000) / 1000000,
      lng: Math.round(lng * 1000000) / 1000000,
      formatted_address: result.display_name,
      accuracy,
      confidence,
      source: 'nominatim',
      components
    };
  }

  /**
   * Coordonnées de fallback améliorées
   */
  private static getFallbackCoordinates(
    postalCode: string, 
    city?: string
  ): GeocodingResult {
    const departmentCode = postalCode.substring(0, 2);
    
    // Base de données étendue des coordonnées départementales
    const departmentData: Record<string, { 
      lat: number; 
      lng: number; 
      name: string;
      mainCities: string[];
    }> = {
      '01': { lat: 46.2044, lng: 5.2253, name: 'Ain', mainCities: ['Bourg-en-Bresse'] },
      '02': { lat: 49.5666, lng: 3.6280, name: 'Aisne', mainCities: ['Laon', 'Saint-Quentin'] },
      '03': { lat: 46.5653, lng: 3.3365, name: 'Allier', mainCities: ['Moulins', 'Montluçon'] },
      '06': { lat: 43.7102, lng: 7.2620, name: 'Alpes-Maritimes', mainCities: ['Nice', 'Cannes', 'Antibes'] },
      '13': { lat: 43.2965, lng: 5.3698, name: 'Bouches-du-Rhône', mainCities: ['Marseille', 'Aix-en-Provence'] },
      '31': { lat: 43.6047, lng: 1.4442, name: 'Haute-Garonne', mainCities: ['Toulouse'] },
      '33': { lat: 44.8378, lng: -0.5792, name: 'Gironde', mainCities: ['Bordeaux'] },
      '35': { lat: 48.1173, lng: -1.6778, name: 'Ille-et-Vilaine', mainCities: ['Rennes'] },
      '44': { lat: 47.2184, lng: -1.5536, name: 'Loire-Atlantique', mainCities: ['Nantes'] },
      '59': { lat: 50.6292, lng: 3.0573, name: 'Nord', mainCities: ['Lille'] },
      '67': { lat: 48.5734, lng: 7.7521, name: 'Bas-Rhin', mainCities: ['Strasbourg'] },
      '69': { lat: 45.7640, lng: 4.8357, name: 'Rhône', mainCities: ['Lyon'] },
      '75': { lat: 48.8566, lng: 2.3522, name: 'Paris', mainCities: ['Paris'] }
    };

    const defaultCoords = { lat: 46.603354, lng: 1.888334, name: 'France', mainCities: [] };
    const deptData = departmentData[departmentCode] || defaultCoords;

    // Ajouter une variation aléatoire minime pour éviter les doublons exacts
    const latVariation = (Math.random() - 0.5) * 0.01; // ±0.005 degré (~500m)
    const lngVariation = (Math.random() - 0.5) * 0.01;

    return {
      lat: Math.round((deptData.lat + latVariation) * 1000000) / 1000000,
      lng: Math.round((deptData.lng + lngVariation) * 1000000) / 1000000,
      formatted_address: city ? `${city}, ${deptData.name}, France` : `${deptData.name}, France`,
      accuracy: 'fallback',
      confidence: 0.3,
      source: 'fallback',
      components: {
        city: city || deptData.mainCities[0],
        postcode: postalCode,
        country: 'France'
      }
    };
  }

  /**
   * Normaliser la requête de géocodage
   */
  private static normalizeQuery(address: string, city?: string, postalCode?: string): string {
    let query = address.trim();
    if (city) query += `, ${city.trim()}`;
    if (postalCode) query += `, ${postalCode.trim()}`;
    query += ', France';
    
    return query
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Gestion du cache
   */
  private static getCacheKey(query: string): string {
    return btoa(query).replace(/[^a-zA-Z0-9]/g, '');
  }

  private static getFromCache(key: string): GeocodingCache | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Vérifier l'expiration
    const age = Date.now() - cached.timestamp.getTime();
    if (age > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached;
  }

  private static addToCache(key: string, result: GeocodingResult): void {
    // Limiter la taille du cache
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      // Supprimer les entrées les plus anciennes
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime());
      
      // Supprimer 20% des entrées les plus anciennes
      const toDelete = Math.floor(this.MAX_CACHE_SIZE * 0.2);
      for (let i = 0; i < toDelete; i++) {
        this.cache.delete(entries[i][0]);
      }
    }

    this.cache.set(key, {
      query: key,
      result,
      timestamp: new Date(),
      hit_count: 1
    });
  }

  /**
   * Sauvegarder dans l'historique
   */
  private static async saveToHistory(query: string, result: GeocodingResult): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      await supabase.from('geocoding_history').insert({
        original_address: query,
        latitude: result.lat,
        longitude: result.lng,
        accuracy: result.accuracy,
        geocoding_service: result.source,
        normalized_address: result.formatted_address,
        success: true,
        response_data: result.components
      });
    } catch (error) {
      console.error('Erreur sauvegarde historique géocodage:', error);
    }
  }

  /**
   * Géocodage en lot avec optimisations
   */
  static async batchGeocode(
    addresses: Array<{
      address: string;
      city?: string;
      postal_code?: string;
      id?: string;
    }>,
    options: {
      batchSize?: number;
      delayMs?: number;
      onProgress?: (completed: number, total: number) => void;
    } = {}
  ): Promise<Array<{ input: typeof addresses[0]; result: GeocodingResult | null }>> {
    const { batchSize = 10, delayMs = 1000, onProgress } = options;
    const results: Array<{ input: typeof addresses[0]; result: GeocodingResult | null }> = [];

    // Traitement par batch pour éviter la surcharge
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (addr) => {
        const result = await this.geocodeAddress(
          addr.address,
          addr.city,
          addr.postal_code,
          { highAccuracy: false }
        );
        
        return { input: addr, result };
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Callback de progression
      if (onProgress) {
        onProgress(results.length, addresses.length);
      }

      // Délai entre les batches
      if (i + batchSize < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }

  /**
   * Statistiques du cache
   */
  static getCacheStats(): {
    size: number;
    hitRate: number;
    oldestEntry: Date | null;
  } {
    if (this.cache.size === 0) {
      return { size: 0, hitRate: 0, oldestEntry: null };
    }

    const entries = Array.from(this.cache.values());
    const totalHits = entries.reduce((sum, entry) => sum + entry.hit_count, 0);
    const totalRequests = entries.reduce((sum, entry) => sum + Math.max(1, entry.hit_count), 0);
    const hitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;

    const oldestEntry = entries.reduce((oldest, entry) => 
      !oldest || entry.timestamp < oldest ? entry.timestamp : oldest, 
      null as Date | null
    );

    return {
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      oldestEntry
    };
  }
}