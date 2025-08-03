
import { ParsedRepairer } from '@/types/firecrawl';

export class FirecrawlParser {
  static parseRepairersFromCrawl(crawlData: any[]): ParsedRepairer[] {
    const repairers: ParsedRepairer[] = [];
    
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

  static parseGooglePlacesData(data: any): ParsedRepairer[] {
    const repairers: ParsedRepairer[] = [];
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
    const parts = address.split(',');
    return parts[parts.length - 1]?.trim() || 'Unknown';
  }

  private static extractPostalCodeFromAddress(address: string): string {
    const match = address.match(/\b(\d{5})\b/);
    return match ? match[1] : '00000';
  }

  static parseSupplierData(data: any): any {
    if (!data || !data.markdown) {
      return null;
    }

    const markdown = data.markdown;
    const html = data.html || '';
    
    // Extract company name from title or h1
    const titleMatch = markdown.match(/^#\s+(.+)/m) || html.match(/<title[^>]*>([^<]+)</i);
    const companyName = titleMatch ? titleMatch[1].replace(/\s*[-–|]\s*.*/g, '').trim() : '';

    // Extract description from meta description or first paragraph
    const metaDescMatch = html.match(/<meta[^>]+name=['"]description['"][^>]+content=['"]([^'"]+)/i);
    const firstParagraphMatch = markdown.match(/^(?!#)(.{50,200}\.)/m);
    const description = metaDescMatch ? metaDescMatch[1] : (firstParagraphMatch ? firstParagraphMatch[1] : '');

    // Extract contact information
    const emailMatch = markdown.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = markdown.match(/(?:\+33|0)[1-9](?:[0-9]{8})/);
    
    // Extract address from contact section or footer
    const addressPattern = /(?:adresse|address|siège)[:\s]*([^\n]+(?:\d{5}[^\n]*)?)/i;
    const addressMatch = markdown.match(addressPattern);
    const address = addressMatch ? addressMatch[1].trim() : '';

    // Extract brands/products from content
    const brandsKeywords = ['apple', 'samsung', 'huawei', 'xiaomi', 'sony', 'lg', 'oneplus', 'google', 'oppo', 'vivo'];
    const foundBrands = brandsKeywords.filter(brand => 
      markdown.toLowerCase().includes(brand.toLowerCase())
    );

    // Extract certifications
    const certificationKeywords = ['iso', 'certifié', 'agréé', 'qualifié', 'certification'];
    const hasCertifications = certificationKeywords.some(cert => 
      markdown.toLowerCase().includes(cert.toLowerCase())
    );

    return {
      name: companyName,
      description: description,
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      address: address,
      brands: foundBrands,
      certifications: hasCertifications ? ['Certifié professionnel'] : [],
      product_types: ['Smartphones', 'Tablettes'], // Default values
      is_verified: false,
      is_featured: false
    };
  }
}
