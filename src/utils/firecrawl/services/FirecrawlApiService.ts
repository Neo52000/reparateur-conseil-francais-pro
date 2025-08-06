
import { CrawlResponse, ErrorResponse } from '@/types/firecrawl';

export class FirecrawlApiService {
  private static API_URL = 'https://api.firecrawl.dev/v0';

  static async makeRequest(
    endpoint: string, 
    apiKey: string, 
    body: any
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
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
      console.error('Firecrawl API request error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'API request failed' 
      };
    }
  }

  static async testConnection(apiKey: string): Promise<boolean> {
    try {
      const result = await this.makeRequest('/scrape', apiKey, {
        url: 'https://example.com',
        formats: ['markdown']
      });
      return result.success;
    } catch (error) {
      console.error('Error testing Firecrawl API key:', error);
      return false;
    }
  }
}
