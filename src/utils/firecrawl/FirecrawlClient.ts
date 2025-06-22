
import { CrawlResponse, ErrorResponse, CrawlResult } from '@/types/firecrawl';

export class FirecrawlClient {
  private static API_URL = 'https://api.firecrawl.dev/v0';

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_URL}/scrape`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://example.com',
          formats: ['markdown']
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error testing Firecrawl API key:', error);
      return false;
    }
  }

  static async crawlPagesJaunes(apiKey: string, searchTerm: string, location: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const searchUrl = `https://www.pagesjaunes.fr/pagesblanches/recherche?quoi=${encodeURIComponent(searchTerm)}&ou=${encodeURIComponent(location)}`;
      
      const response = await fetch(`${this.API_URL}/crawl`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: searchUrl,
          crawlOptions: {
            includes: ['**/pagesblanches/**'],
            limit: 50
          },
          pageOptions: {
            formats: ['markdown', 'html']
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as CrawlResponse;
      
      if (!result.success) {
        return { success: false, error: (result as ErrorResponse).error };
      }

      return { success: true, data: (result as CrawlResult).data };
    } catch (error) {
      console.error('Error crawling Pages Jaunes:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to crawl Pages Jaunes' 
      };
    }
  }

  static async crawlGooglePlaces(apiKey: string, searchTerm: string, location: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchTerm + ' ' + location)}`;
      
      const response = await fetch(`${this.API_URL}/scrape`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: searchUrl,
          formats: ['markdown', 'html']
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error crawling Google Places:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to crawl Google Places' 
      };
    }
  }
}
