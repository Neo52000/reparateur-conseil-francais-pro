
interface ErrorResponse {
  success: false;
  error: string;
}

interface CrawlResult {
  success: true;
  data: {
    markdown: string;
    html: string;
    metadata: {
      title: string;
      description?: string;
    };
  }[];
}

type CrawlResponse = CrawlResult | ErrorResponse;

export class FirecrawlService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  private static API_URL = 'https://api.firecrawl.dev/v0';

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    console.log('Firecrawl API key saved successfully');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

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

  static async crawlPagesJaunes(searchTerm: string, location: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'Firecrawl API key not found' };
    }

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
        return { success: false, error: result.error };
      }

      const parsedData = this.parseRepairersFromCrawl(result.data);
      return { success: true, data: parsedData };
    } catch (error) {
      console.error('Error crawling Pages Jaunes:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to crawl Pages Jaunes' 
      };
    }
  }

  static async crawlGooglePlaces(searchTerm: string, location: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'Firecrawl API key not found' };
    }

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

      const parsedData = this.parseGooglePlacesData(result.data);
      return { success: true, data: parsedData };
    } catch (error) {
      console.error('Error crawling Google Places:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to crawl Google Places' 
      };
    }
  }

  private static parseRepairersFromCrawl(crawlData: any[]): any[] {
    const repairers: any[] = [];
    
    crawlData.forEach(page => {
      const markdown = page.markdown || '';
      const html = page.html || '';
      
      // Extraction des données avec regex et parsing du contenu
      const nameMatches = markdown.match(/#{1,3}\s*([^#\n]+(?:réparation|repair|mobile|téléphone|smartphone|GSM)[^#\n]*)/gi);
      const addressMatches = html.match(/<[^>]*class="[^"]*address[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi);
      const phoneMatches = markdown.match(/(\+33|0)[0-9\s\.\-]{8,}/g);
      
      if (nameMatches) {
        nameMatches.forEach((name, index) => {
          const cleanName = name.replace(/#{1,3}\s*/, '').trim();
          const address = addressMatches?.[index]?.replace(/<[^>]*>/g, '').trim();
          const phone = phoneMatches?.[index]?.replace(/\s/g, '');
          
          if (cleanName && address) {
            repairers.push({
              name: cleanName,
              address: address,
              city: this.extractCityFromAddress(address),
              postal_code: this.extractPostalCodeFromAddress(address),
              phone: phone,
              description: `Réparateur de smartphones et téléphones mobiles`,
              category: 'Réparation mobile'
            });
          }
        });
      }
    });
    
    return repairers;
  }

  private static parseGooglePlacesData(data: any): any[] {
    // Parser les données Google Places (structure différente)
    const repairers: any[] = [];
    const markdown = data.markdown || '';
    
    // Logique de parsing spécifique à Google Places
    const businessBlocks = markdown.split(/\n\n+/);
    
    businessBlocks.forEach(block => {
      if (block.includes('réparation') || block.includes('smartphone') || block.includes('mobile')) {
        const lines = block.split('\n');
        const name = lines[0]?.replace(/[*#]/g, '').trim();
        const addressLine = lines.find(l => l.match(/\d+.*rue|avenue|boulevard/i));
        
        if (name && addressLine) {
          repairers.push({
            name: name,
            address: addressLine.trim(),
            city: this.extractCityFromAddress(addressLine),
            postal_code: this.extractPostalCodeFromAddress(addressLine),
            description: 'Service de réparation mobile',
            category: 'Réparation smartphone'
          });
        }
      }
    });
    
    return repairers;
  }

  private static extractCityFromAddress(address: string): string {
    // Extraction de la ville depuis l'adresse
    const parts = address.split(',');
    return parts[parts.length - 1]?.trim() || 'Unknown';
  }

  private static extractPostalCodeFromAddress(address: string): string {
    // Extraction du code postal (5 chiffres)
    const match = address.match(/\b(\d{5})\b/);
    return match ? match[1] : '00000';
  }
}
