
interface FirecrawlResponse {
  success: boolean;
  data?: any[];
  error?: string;
}

export class FirecrawlService {
  private static API_URL = 'https://api.firecrawl.dev/v0';

  static async crawlPagesJaunes(searchTerm: string, location: string): Promise<FirecrawlResponse> {
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return { success: false, error: 'Firecrawl API key not configured' };
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
            limit: 20
          },
          pageOptions: {
            formats: ['markdown', 'html']
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
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

  static async crawlGooglePlaces(searchTerm: string, location: string): Promise<FirecrawlResponse> {
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return { success: false, error: 'Firecrawl API key not configured' };
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
      
      // Extraction améliorée des données
      const nameMatches = markdown.match(/#{1,3}\s*([^#\n]+(?:réparation|repair|mobile|téléphone|smartphone|GSM|iPhone|Samsung)[^#\n]*)/gi);
      const addressRegex = /<[^>]*class="[^"]*address[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi;
      const phoneRegex = /(?:\+33|0)[1-9](?:[0-9]{8})/g;
      
      let addressMatches = [];
      let match;
      while ((match = addressRegex.exec(html)) !== null) {
        addressMatches.push(match[1]);
      }
      
      const phoneMatches = markdown.match(phoneRegex);
      
      if (nameMatches) {
        nameMatches.forEach((name, index) => {
          const cleanName = name.replace(/#{1,3}\s*/, '').trim();
          const address = addressMatches?.[index]?.replace(/<[^>]*>/g, '').trim();
          const phone = phoneMatches?.[index];
          
          if (cleanName && address) {
            repairers.push({
              name: cleanName,
              address: address,
              city: this.extractCityFromAddress(address),
              postal_code: this.extractPostalCodeFromAddress(address),
              phone: phone,
              description: `Réparateur de smartphones et téléphones mobiles à ${this.extractCityFromAddress(address)}`,
              category: 'Réparation mobile'
            });
          }
        });
      }
    });
    
    return repairers;
  }

  private static parseGooglePlacesData(data: any): any[] {
    const repairers: any[] = [];
    const markdown = data.markdown || '';
    
    // Parser Google Places data
    const businessBlocks = markdown.split(/\n\n+/);
    
    businessBlocks.forEach(block => {
      if (block.toLowerCase().includes('réparation') || 
          block.toLowerCase().includes('smartphone') || 
          block.toLowerCase().includes('mobile') ||
          block.toLowerCase().includes('iphone')) {
        
        const lines = block.split('\n').filter(line => line.trim());
        const name = lines[0]?.replace(/[*#]/g, '').trim();
        const addressLine = lines.find(l => l.match(/\d+.*(?:rue|avenue|boulevard|place|impasse)/i));
        
        if (name && addressLine) {
          repairers.push({
            name: name,
            address: addressLine.trim(),
            city: this.extractCityFromAddress(addressLine),
            postal_code: this.extractPostalCodeFromAddress(addressLine),
            description: `Service de réparation mobile et smartphone`,
            category: 'Réparation smartphone'
          });
        }
      }
    });
    
    return repairers;
  }

  private static extractCityFromAddress(address: string): string {
    const parts = address.split(',');
    const lastPart = parts[parts.length - 1]?.trim() || '';
    
    // Extraire la ville (après le code postal)
    const cityMatch = lastPart.match(/\d{5}\s+(.+)/);
    if (cityMatch) {
      return cityMatch[1].trim();
    }
    
    return lastPart || 'Unknown';
  }

  private static extractPostalCodeFromAddress(address: string): string {
    const match = address.match(/\b(\d{5})\b/);
    return match ? match[1] : '00000';
  }
}
