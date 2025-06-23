
import { chromium, Browser, Page } from 'playwright';

export interface ScrapingResult {
  name: string;
  address: string;
  city: string;
  postal_code: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  category?: string;
  source: 'pages_jaunes' | 'google_maps';
}

export class PlaywrightScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Configuration anti-détection
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8'
    });
  }

  async scrapePagesJaunes(searchTerm: string, location: string): Promise<ScrapingResult[]> {
    if (!this.page) throw new Error('Scraper not initialized');

    const url = `https://www.pagesjaunes.fr/pagesblanches/recherche?quoi=${encodeURIComponent(searchTerm)}&ou=${encodeURIComponent(location)}`;
    
    try {
      await this.page.goto(url, { waitUntil: 'networkidle' });
      await this.page.waitForTimeout(2000);

      const results = await this.page.evaluate(() => {
        const items: any[] = [];
        const listings = document.querySelectorAll('[data-pj-list-item]');
        
        listings.forEach(listing => {
          const nameElement = listing.querySelector('h3 a, .denomination-links a');
          const addressElement = listing.querySelector('.adresse');
          const phoneElement = listing.querySelector('.coord-numero');
          
          if (nameElement && addressElement) {
            const name = nameElement.textContent?.trim() || '';
            const address = addressElement.textContent?.trim() || '';
            const phone = phoneElement?.textContent?.trim();
            
            // Extraction de la ville et code postal depuis l'adresse
            const addressParts = address.split(',');
            const lastPart = addressParts[addressParts.length - 1]?.trim() || '';
            const postalMatch = lastPart.match(/(\d{5})\s+(.+)/);
            
            items.push({
              name,
              address: addressParts.slice(0, -1).join(',').trim(),
              city: postalMatch ? postalMatch[2] : lastPart,
              postal_code: postalMatch ? postalMatch[1] : '00000',
              phone,
              source: 'pages_jaunes'
            });
          }
        });
        
        return items;
      });

      console.log(`Pages Jaunes: ${results.length} résultats trouvés pour ${searchTerm} à ${location}`);
      return results;
    } catch (error) {
      console.error('Erreur scraping Pages Jaunes:', error);
      return [];
    }
  }

  async scrapeGoogleMaps(searchTerm: string, location: string): Promise<ScrapingResult[]> {
    if (!this.page) throw new Error('Scraper not initialized');

    const query = `${searchTerm} ${location}`;
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    
    try {
      await this.page.goto(url, { waitUntil: 'networkidle' });
      await this.page.waitForTimeout(3000);

      // Scroll pour charger plus de résultats
      await this.page.evaluate(() => {
        const scrollContainer = document.querySelector('[role="main"]');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      });
      
      await this.page.waitForTimeout(2000);

      const results = await this.page.evaluate(() => {
        const items: any[] = [];
        const listings = document.querySelectorAll('[data-result-index]');
        
        listings.forEach(listing => {
          const nameElement = listing.querySelector('[data-value="Nom"]');
          const addressElement = listing.querySelector('[data-value="Adresse"]');
          const phoneElement = listing.querySelector('[data-value="Numéro de téléphone"]');
          const websiteElement = listing.querySelector('[data-value="Site Web"]');
          
          if (nameElement) {
            const name = nameElement.textContent?.trim() || '';
            const address = addressElement?.textContent?.trim() || '';
            const phone = phoneElement?.textContent?.trim();
            const website = websiteElement?.getAttribute('href');
            
            // Extraction de la ville depuis l'adresse Google Maps
            const addressParts = address.split(',');
            const cityPart = addressParts[addressParts.length - 2]?.trim() || '';
            const postalMatch = address.match(/(\d{5})/);
            
            items.push({
              name,
              address: addressParts.slice(0, -2).join(',').trim(),
              city: cityPart,
              postal_code: postalMatch ? postalMatch[1] : '00000',
              phone,
              website,
              source: 'google_maps'
            });
          }
        });
        
        return items;
      });

      console.log(`Google Maps: ${results.length} résultats trouvés pour ${query}`);
      return results;
    } catch (error) {
      console.error('Erreur scraping Google Maps:', error);
      return [];
    }
  }

  async close() {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
  }
}
