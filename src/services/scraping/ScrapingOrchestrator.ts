
import { PlaywrightScraper, ScrapingResult } from './PlaywrightScraper';
import { MistralAIService } from './MistralAIService';
import { NominatimGeocoder } from './NominatimGeocoder';

export interface ScrapingConfig {
  source: 'pages_jaunes' | 'google_maps' | 'both';
  location: string;
  searchTerm: string;
  maxResults?: number;
  testMode?: boolean;
  mistralApiKey?: string;
}

export interface ProcessedRepairer extends ScrapingResult {
  lat: number;
  lng: number;
  services: string[];
  specialties: string[];
  priceRange: 'low' | 'medium' | 'high';
  confidence: number;
  isVerified: boolean;
  accuracy: 'precise' | 'approximate' | 'fallback';
}

export class ScrapingOrchestrator {
  private scraper: PlaywrightScraper;
  private aiService: MistralAIService | null = null;
  private geocoder: NominatimGeocoder;

  constructor(mistralApiKey?: string) {
    this.scraper = new PlaywrightScraper();
    this.geocoder = new NominatimGeocoder();
    
    if (mistralApiKey) {
      this.aiService = new MistralAIService(mistralApiKey);
    }
  }

  async initialize() {
    await this.scraper.initialize();
  }

  async scrapeAndProcess(config: ScrapingConfig): Promise<ProcessedRepairer[]> {
    console.log(`🚀 Démarrage du scraping: ${config.source} pour "${config.searchTerm}" à ${config.location}`);
    
    let rawResults: ScrapingResult[] = [];

    try {
      // Phase 1: Scraping des données brutes
      if (config.source === 'pages_jaunes' || config.source === 'both') {
        const pjResults = await this.scraper.scrapePagesJaunes(config.searchTerm, config.location);
        rawResults.push(...pjResults);
      }

      if (config.source === 'google_maps' || config.source === 'both') {
        const gmResults = await this.scraper.scrapeGoogleMaps(config.searchTerm, config.location);
        rawResults.push(...gmResults);
      }

      // Déduplication basique
      rawResults = this.deduplicateResults(rawResults);
      
      if (config.maxResults) {
        rawResults = rawResults.slice(0, config.maxResults);
      }

      console.log(`📊 ${rawResults.length} résultats uniques trouvés`);

      if (rawResults.length === 0) {
        return [];
      }

      // Phase 2: Classification IA (si disponible)
      let classifications: any[] = [];
      if (this.aiService && !config.testMode) {
        console.log('🤖 Classification IA avec Mistral...');
        classifications = await this.aiService.batchClassify(
          rawResults.map(r => ({ name: r.name, address: r.address, description: r.description }))
        );
      } else {
        // Classification par mots-clés si pas d'IA
        classifications = rawResults.map(r => this.basicClassification(r));
      }

      // Phase 3: Géocodage
      console.log('🗺️ Géocodage des adresses...');
      const geocodingResults = await this.geocoder.batchGeocode(
        rawResults.map(r => ({ 
          address: r.address, 
          city: r.city, 
          postalCode: r.postal_code 
        }))
      );

      // Phase 4: Fusion des données
      const processedResults: ProcessedRepairer[] = [];
      
      for (let i = 0; i < rawResults.length; i++) {
        const raw = rawResults[i];
        const classification = classifications[i];
        const geocoding = geocodingResults[i];

        // Filtrer seulement les vrais réparateurs
        if (classification.isRepairer && classification.confidence > 0.5 && geocoding) {
          processedResults.push({
            ...raw,
            lat: geocoding.lat,
            lng: geocoding.lng,
            services: classification.services || [],
            specialties: classification.specialties || [],
            priceRange: classification.priceRange || 'medium',
            confidence: classification.confidence,
            isVerified: false,
            accuracy: geocoding.accuracy
          });
        }
      }

      console.log(`✅ ${processedResults.length} réparateurs validés sur ${rawResults.length} analysés`);
      
      return processedResults;

    } catch (error) {
      console.error('❌ Erreur dans le processus de scraping:', error);
      throw error;
    }
  }

  private deduplicateResults(results: ScrapingResult[]): ScrapingResult[] {
    const seen = new Set<string>();
    return results.filter(result => {
      const key = `${result.name.toLowerCase()}-${result.postal_code}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private basicClassification(result: ScrapingResult) {
    const text = (result.name + ' ' + (result.description || '')).toLowerCase();
    const repairKeywords = ['réparation', 'réparer', 'téléphone', 'smartphone', 'mobile', 'iphone', 'samsung', 'écran', 'batterie'];
    const excludeKeywords = ['vente', 'boutique', 'magasin', 'opérateur', 'orange', 'sfr', 'bouygues'];
    
    const hasRepairKeywords = repairKeywords.some(keyword => text.includes(keyword));
    const hasExcludeKeywords = excludeKeywords.some(keyword => text.includes(keyword));
    
    const isRepairer = hasRepairKeywords && !hasExcludeKeywords;
    
    return {
      isRepairer,
      confidence: isRepairer ? 0.7 : 0.3,
      services: isRepairer ? ['Réparation générale'] : [],
      specialties: isRepairer ? ['Tout mobile'] : [],
      priceRange: 'medium' as const
    };
  }

  async close() {
    await this.scraper.close();
  }
}
