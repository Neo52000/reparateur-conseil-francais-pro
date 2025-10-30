
import { supabase } from '@/integrations/supabase/client';
import { FirecrawlParser } from './firecrawl/FirecrawlParser';
import { FirecrawlUrlBuilder } from './firecrawl/services/FirecrawlUrlBuilder';

export class FirecrawlService {
  /**
   * SECURITY: No longer stores API keys client-side
   * API key is stored as a Supabase secret and used server-side
   */
  static saveApiKey(_apiKey: string): void {
    console.warn('API key storage is now handled server-side via Edge Functions');
  }

  static getApiKey(): string | null {
    console.warn('API keys are no longer accessible client-side for security');
    return null;
  }

  static async testApiKey(_apiKey: string): Promise<boolean> {
    console.warn('API key testing is handled server-side');
    return true;
  }

  private static async callFirecrawlProxy(operation: string, url: string, options: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('modern-scraping', {
        body: { operation, url, options }
      });

      if (error) {
        console.error('Firecrawl proxy error:', error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error calling Firecrawl proxy:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to Firecrawl service' 
      };
    }
  }

  static async crawlPagesJaunes(searchTerm: string, location: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    const searchUrl = FirecrawlUrlBuilder.buildPagesJaunesUrl(searchTerm, location);
    const crawlOptions = FirecrawlUrlBuilder.buildCrawlOptions(['**/pagesblanches/**'], 50);

    const result = await this.callFirecrawlProxy('crawl', searchUrl, crawlOptions);
    
    if (result.success && result.data) {
      const parsedData = FirecrawlParser.parseRepairersFromCrawl(result.data);
      return { success: true, data: parsedData };
    }

    return result;
  }

  static async crawlGooglePlaces(searchTerm: string, location: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    const searchUrl = FirecrawlUrlBuilder.buildGooglePlacesUrl(searchTerm, location);
    const scrapeOptions = FirecrawlUrlBuilder.buildScrapeOptions();

    const result = await this.callFirecrawlProxy('scrape', searchUrl, scrapeOptions);
    
    if (result.success && result.data) {
      const parsedData = FirecrawlParser.parseGooglePlacesData(result.data);
      return { success: true, data: parsedData };
    }

    return result;
  }
}
