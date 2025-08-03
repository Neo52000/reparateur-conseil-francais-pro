
import { FirecrawlApiService } from './services/FirecrawlApiService';
import { FirecrawlUrlBuilder } from './services/FirecrawlUrlBuilder';

export class FirecrawlClient {
  static async testApiKey(apiKey: string): Promise<boolean> {
    return FirecrawlApiService.testConnection(apiKey);
  }

  static async crawlPagesJaunes(apiKey: string, searchTerm: string, location: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    const searchUrl = FirecrawlUrlBuilder.buildPagesJaunesUrl(searchTerm, location);
    const crawlOptions = FirecrawlUrlBuilder.buildCrawlOptions(['**/pagesblanches/**'], 50);
    
    return FirecrawlApiService.makeRequest('/crawl', apiKey, {
      url: searchUrl,
      ...crawlOptions
    });
  }

  static async crawlGooglePlaces(apiKey: string, searchTerm: string, location: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    const searchUrl = FirecrawlUrlBuilder.buildGooglePlacesUrl(searchTerm, location);
    const scrapeOptions = FirecrawlUrlBuilder.buildScrapeOptions();
    
    return FirecrawlApiService.makeRequest('/scrape', apiKey, {
      url: searchUrl,
      ...scrapeOptions
    });
  }

  static async crawlSupplierWebsite(apiKey: string, url: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const scrapeOptions = FirecrawlUrlBuilder.buildScrapeOptions();
    
    return FirecrawlApiService.makeRequest('/scrape', apiKey, {
      url: url,
      ...scrapeOptions
    });
  }
}
