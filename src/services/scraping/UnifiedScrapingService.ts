import { EnhancedPlaywrightScraper, ScrapingResult } from './EnhancedPlaywrightScraper';
import { ScrapyLikeService } from './ScrapyLikeService';
import { supabase } from '@/integrations/supabase/client';

export interface UnifiedScrapingOptions {
  searchTerm: string;
  location: string;
  sources: ('google_maps' | 'serper' | 'multi_ai')[];
  maxResults?: number;
  enableAI?: boolean;
  enableGeocoding?: boolean;
  categoryId?: string;
}

export interface ScrapingStats {
  totalFound: number;
  totalProcessed: number;
  totalInserted: number;
  sourceBreakdown: Record<string, number>;
  processingTime: number;
  errors: string[];
}

export class UnifiedScrapingService {
  private scrapyService: ScrapyLikeService;
  private stats: ScrapingStats;

  constructor() {
    this.scrapyService = new ScrapyLikeService();
    this.resetStats();
  }

  private resetStats() {
    this.stats = {
      totalFound: 0,
      totalProcessed: 0,
      totalInserted: 0,
      sourceBreakdown: {},
      processingTime: 0,
      errors: []
    };
  }

  async execute(options: UnifiedScrapingOptions): Promise<ScrapingStats> {
    const startTime = Date.now();
    this.resetStats();
    this.scrapyService.reset();

    console.log('🚀 Unified Scraping Service - Début de l\'exécution');
    console.log('📋 Options:', options);

    try {
      // Phase 1: Collecte de données depuis toutes les sources
      const allResults = await this.collectFromAllSources(options);
      this.stats.totalFound = allResults.length;

      if (allResults.length === 0) {
        console.warn('⚠️ Aucun résultat trouvé depuis les sources');
        this.stats.processingTime = Date.now() - startTime;
        return this.stats;
      }

      // Phase 2: Traitement avec pipelines Scrapy-like
      console.log('🔄 Application des pipelines de traitement...');
      const processedResults = await this.scrapyService.processItems(allResults);
      this.stats.totalProcessed = processedResults.length;

      // Phase 3: Intégration en base de données
      if (options.categoryId && processedResults.length > 0) {
        const insertedCount = await this.integrateToDatabase(processedResults, options.categoryId);
        this.stats.totalInserted = insertedCount;
      }

      this.stats.processingTime = Date.now() - startTime;
      console.log('✅ Scraping unifié terminé:', this.stats);

      return this.stats;

    } catch (error: any) {
      console.error('❌ Erreur scraping unifié:', error);
      this.stats.errors.push(error.message);
      this.stats.processingTime = Date.now() - startTime;
      throw error;
    }
  }

  private async collectFromAllSources(options: UnifiedScrapingOptions): Promise<ScrapingResult[]> {
    const allResults: ScrapingResult[] = [];
    const maxResultsPerSource = Math.ceil((options.maxResults || 50) / options.sources.length);

    for (const source of options.sources) {
      try {
        console.log(`📡 Collecte depuis: ${source}`);
        let sourceResults: ScrapingResult[] = [];

        switch (source) {
          case 'google_maps':
            sourceResults = await this.collectFromGoogleMaps(options, maxResultsPerSource);
            break;
          case 'serper':
            sourceResults = await this.collectFromSerper(options, maxResultsPerSource);
            break;
          case 'multi_ai':
            sourceResults = await this.collectFromMultiAI(options, maxResultsPerSource);
            break;
        }

        this.stats.sourceBreakdown[source] = sourceResults.length;
        allResults.push(...sourceResults);

        console.log(`✅ ${source}: ${sourceResults.length} résultats collectés`);

      } catch (error: any) {
        console.error(`❌ Erreur source ${source}:`, error);
        this.stats.errors.push(`${source}: ${error.message}`);
        this.stats.sourceBreakdown[source] = 0;
      }
    }

    return allResults;
  }

  private async collectFromGoogleMaps(options: UnifiedScrapingOptions, maxResults: number): Promise<ScrapingResult[]> {
    const scraper = new EnhancedPlaywrightScraper();
    
    try {
      await scraper.initialize();
      const results = await scraper.retryWithBackoff(
        () => scraper.scrapeGoogleMapsEnhanced(options.searchTerm, options.location),
        3,
        2000
      );
      
      return results.slice(0, maxResults);
    } finally {
      await scraper.close();
    }
  }

  private async collectFromSerper(options: UnifiedScrapingOptions, maxResults: number): Promise<ScrapingResult[]> {
    const query = `${options.searchTerm} ${options.location}`;
    
    const { data, error } = await supabase.functions.invoke('serper-search', {
      body: {
        query,
        type: 'search',
        location: options.location,
        num: maxResults
      }
    });

    if (error) throw new Error(`Serper error: ${error.message}`);

    // Convertir les résultats Serper au format ScrapingResult
    return (data.results || []).map((result: any) => ({
      name: result.title || '',
      address: this.extractAddressFromSnippet(result.snippet || ''),
      city: options.location,
      postal_code: '00000',
      website: result.link,
      description: result.snippet,
      source: 'serper' as const
    }));
  }

  private async collectFromMultiAI(options: UnifiedScrapingOptions, maxResults: number): Promise<ScrapingResult[]> {
    const { data, error } = await supabase.functions.invoke('multi-ai-pipeline', {
      body: {
        searchTerm: options.searchTerm,
        location: options.location,
        maxResults,
        testMode: false
      }
    });

    if (error) throw new Error(`Multi-AI error: ${error.message}`);

    return data.results || [];
  }

  private extractAddressFromSnippet(snippet: string): string {
    // Extraction simple d'adresse depuis un snippet
    const addressPatterns = [
      /(\d+[\w\s,.-]+(?:\d{5})?[^.!?]*)/,
      /([A-Z][a-z\s]+(?:\d+[^.!?]*)?)/
    ];

    for (const pattern of addressPatterns) {
      const match = snippet.match(pattern);
      if (match) {
        return match[1].trim().substring(0, 100);
      }
    }

    return '';
  }

  private async integrateToDatabase(results: ScrapingResult[], categoryId: string): Promise<number> {
    console.log(`💾 Intégration de ${results.length} résultats en base...`);

    let insertedCount = 0;
    const batchSize = 25;

    for (let i = 0; i < results.length; i += batchSize) {
      const batch = results.slice(i, i + batchSize);
      
      try {
        const processedBatch = batch.map(result => ({
          ...result,
          business_category_id: categoryId,
          unique_id: this.generateUniqueId(result.name),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_verified: false,
          data_quality_score: this.calculateQualityScore(result)
        }));

        const { data, error } = await supabase
          .from('repairers')
          .insert(processedBatch)
          .select('id');

        if (error) {
          console.error(`Erreur insertion lot ${i}:`, error);
          continue;
        }

        insertedCount += data?.length || 0;
        console.log(`✅ Lot ${i + 1}-${i + batchSize} inséré: ${data?.length || 0} éléments`);

      } catch (error) {
        console.error(`Erreur traitement lot ${i}:`, error);
      }

      // Pause entre les lots
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return insertedCount;
  }

  private generateUniqueId(name: string): string {
    const timestamp = Date.now();
    const nameSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8);
    const random = Math.random().toString(36).substring(2, 4);
    return `UNI_${nameSlug}_${timestamp}_${random}`;
  }

  private calculateQualityScore(result: ScrapingResult): number {
    let score = 0;
    
    if (result.name && result.name.length > 3) score += 25;
    if (result.address && result.address.length > 5) score += 20;
    if (result.phone) score += 15;
    if (result.email) score += 15;
    if (result.website) score += 15;
    if (result.description && result.description.length > 10) score += 10;
    
    return Math.min(100, score);
  }

  getLastStats(): ScrapingStats {
    return { ...this.stats };
  }

  getScrapyStats() {
    return this.scrapyService.getStats();
  }
}