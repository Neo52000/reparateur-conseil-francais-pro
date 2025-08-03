
import { FirecrawlClient } from './firecrawl/FirecrawlClient';
import { FirecrawlParser } from './firecrawl/FirecrawlParser';
import { FirecrawlStorage } from './firecrawl/FirecrawlStorage';

export class FirecrawlService {
  static saveApiKey = FirecrawlStorage.saveApiKey;
  static getApiKey = FirecrawlStorage.getApiKey;
  static testApiKey = FirecrawlClient.testApiKey;

  static async crawlPagesJaunes(searchTerm: string, location: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    const apiKey = FirecrawlStorage.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'Firecrawl API key not found' };
    }

    const result = await FirecrawlClient.crawlPagesJaunes(apiKey, searchTerm, location);
    
    if (result.success && result.data) {
      const parsedData = FirecrawlParser.parseRepairersFromCrawl(result.data);
      return { success: true, data: parsedData };
    }

    return result;
  }

  static async crawlGooglePlaces(searchTerm: string, location: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    const apiKey = FirecrawlStorage.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'Firecrawl API key not found' };
    }

    const result = await FirecrawlClient.crawlGooglePlaces(apiKey, searchTerm, location);
    
    if (result.success && result.data) {
      const parsedData = FirecrawlParser.parseGooglePlacesData(result.data);
      return { success: true, data: parsedData };
    }

    return result;
  }

  static async crawlSupplierWebsite(url: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const apiKey = FirecrawlStorage.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'Firecrawl API key not found' };
    }

    const result = await FirecrawlClient.crawlSupplierWebsite(apiKey, url);
    
    if (result.success && result.data) {
      const parsedData = FirecrawlParser.parseSupplierData(result.data);
      return { success: true, data: parsedData };
    }

    return result;
  }
}
