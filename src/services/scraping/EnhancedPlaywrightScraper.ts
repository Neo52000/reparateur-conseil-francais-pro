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
  source: 'pages_jaunes' | 'google_maps' | 'enhanced';
}

export class EnhancedPlaywrightScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  ];

  async initialize() {
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    await this.createNewPage();
  }

  private async createNewPage() {
    if (this.page) await this.page.close();
    
    const randomUserAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    
    this.page = await this.browser!.newPage({
      userAgent: randomUserAgent,
      viewport: { width: 1366, height: 768 }
    });
    
    // Anti-détection avancée
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    });

    // Masquer les signaux d'automation
    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      delete (window as any).cdc_adoQpoasnfa76pfcZLmcfl_Array;
      delete (window as any).cdc_adoQpoasnfa76pfcZLmcfl_Promise;
      delete (window as any).cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
    });
  }

  async scrapeGoogleMapsEnhanced(searchTerm: string, location: string): Promise<ScrapingResult[]> {
    if (!this.page) throw new Error('Scraper not initialized');

    const query = `${searchTerm} ${location}`;
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    
    try {
      await this.page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await this.randomDelay(2000, 4000);

      // Attendre que la liste des résultats soit chargée
      await this.page.waitForSelector('[role="main"]', { timeout: 10000 });
      
      // Scroll intelligent pour charger plus de résultats
      await this.smartScroll();
      
      const results = await this.page.evaluate(() => {
        const items: any[] = [];
        
        // Sélecteurs mis à jour basés sur l'analyse GitHub
        const selectors = [
          'div[data-result-index]',
          '.Nv2PK',
          '[data-value="Nom"]',
          'div[jsaction*="mouseover"]'
        ];
        
        let listings: NodeListOf<Element> | null = null;
        
        for (const selector of selectors) {
          listings = document.querySelectorAll(selector);
          if (listings.length > 0) break;
        }
        
        if (!listings) return items;
        
        listings.forEach((listing, index) => {
          try {
            // Méthodes d'extraction robustes
            const name = this.extractText(listing, [
              '[data-value="Nom"]',
              '.qBF1Pd',
              '.fontHeadlineSmall',
              'h3',
              'a[data-value="Nom"]'
            ]);
            
            const address = this.extractText(listing, [
              '[data-value="Adresse"]',
              '.W4Efsd .W4Efsd:nth-child(2)',
              '.rogA2c',
              '.W4Efsd span[jsan]'
            ]);
            
            const phone = this.extractText(listing, [
              '[data-value="Numéro de téléphone"]',
              '.W4Efsd span[data-value="Numéro de téléphone"]',
              'span[data-value*="phone"]'
            ]);
            
            const website = this.extractAttribute(listing, [
              '[data-value="Site Web"]',
              'a[data-value="Site Web"]'
            ], 'href');
            
            const rating = this.extractText(listing, [
              '.MW4etd',
              'span[role="img"]',
              '.fontBodySmall .fontBodySmall'
            ]);

            if (name && (address || phone)) {
              // Extraction améliorée de la ville et code postal
              let city = '';
              let postal_code = '';
              
              if (address) {
                const addressParts = address.split(',');
                const lastPart = addressParts[addressParts.length - 1]?.trim() || '';
                const postalMatch = address.match(/(\d{5})\s+([^,]+)/);
                
                if (postalMatch) {
                  postal_code = postalMatch[1];
                  city = postalMatch[2].trim();
                } else {
                  city = lastPart;
                }
                
                // Rebuild address without city
                const cleanAddress = addressParts.slice(0, -1).join(',').trim();
              }

              items.push({
                name: name.trim(),
                address: address ? address.split(',').slice(0, -1).join(',').trim() : '',
                city,
                postal_code: postal_code || '00000',
                phone: phone?.replace(/\s/g, ''),
                website: website?.startsWith('http') ? website : null,
                rating: rating ? parseFloat(rating.replace(',', '.')) : null,
                source: 'enhanced'
              });
            }
          } catch (error) {
            console.warn(`Erreur extraction élément ${index}:`, error);
          }
        });
        
        return items;
      });

      console.log(`Google Maps Enhanced: ${results.length} résultats trouvés pour ${query}`);
      return results;
    } catch (error) {
      console.error('Erreur scraping Google Maps Enhanced:', error);
      
      // Retry avec nouvelle page si erreur
      await this.createNewPage();
      return [];
    }
  }

  private async smartScroll() {
    if (!this.page) return;
    
    try {
      const scrollContainer = await this.page.$('[role="main"]');
      if (!scrollContainer) return;
      
      // Scroll progressif pour simuler un comportement humain
      for (let i = 0; i < 5; i++) {
        await this.page.evaluate((container) => {
          if (container) {
            container.scrollTop += 800;
          }
        }, scrollContainer);
        
        await this.randomDelay(800, 1500);
        
        // Vérifier si de nouveaux éléments sont chargés
        const currentCount = await this.page.$$eval('[data-result-index]', els => els.length);
        if (i > 0 && currentCount < 5) break; // Arrêter si pas assez de nouveaux résultats
      }
    } catch (error) {
      console.warn('Erreur smart scroll:', error);
    }
  }

  private async randomDelay(min: number, max: number) {
    const delay = Math.random() * (max - min) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private extractText(element: Element, selectors: string[]): string {
    for (const selector of selectors) {
      try {
        const found = element.querySelector(selector);
        if (found?.textContent?.trim()) {
          return found.textContent.trim();
        }
      } catch (e) {
        continue;
      }
    }
    return '';
  }

  private extractAttribute(element: Element, selectors: string[], attribute: string): string | null {
    for (const selector of selectors) {
      try {
        const found = element.querySelector(selector);
        if (found?.getAttribute(attribute)) {
          return found.getAttribute(attribute);
        }
      } catch (e) {
        continue;
      }
    }
    return null;
  }

  async retryWithBackoff<T>(
    operation: () => Promise<T>, 
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        console.warn(`Tentative ${attempt} échouée, retry dans ${Math.round(delay)}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Créer une nouvelle page pour le retry
        await this.createNewPage();
      }
    }
    throw new Error('Max retries exceeded');
  }

  async close() {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
  }
}