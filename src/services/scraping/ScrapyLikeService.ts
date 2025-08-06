interface ScrapingPipeline {
  process(item: any): Promise<any>;
}

interface ScrapingMiddleware {
  processRequest?(request: any): Promise<any>;
  processResponse?(response: any): Promise<any>;
}

export class DataCleaningPipeline implements ScrapingPipeline {
  async process(item: any): Promise<any> {
    // Nettoyage et normalisation des données
    return {
      ...item,
      name: this.cleanText(item.name),
      address: this.cleanAddress(item.address),
      phone: this.cleanPhone(item.phone),
      email: this.cleanEmail(item.email),
      website: this.cleanWebsite(item.website)
    };
  }

  private cleanText(text: string): string {
    if (!text) return '';
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-\.,]/g, '')
      .substring(0, 200);
  }

  private cleanAddress(address: string): string {
    if (!address) return '';
    return address
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/,\s*,/g, ',')
      .substring(0, 300);
  }

  private cleanPhone(phone: string): string {
    if (!phone) return '';
    const cleaned = phone.replace(/[^\d\+]/g, '');
    if (cleaned.match(/^(\+33|0)[1-9]\d{8}$/)) {
      return cleaned;
    }
    return '';
  }

  private cleanEmail(email: string): string {
    if (!email) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.toLowerCase()) ? email.toLowerCase() : '';
  }

  private cleanWebsite(website: string): string {
    if (!website) return '';
    try {
      const url = new URL(website);
      return url.toString();
    } catch {
      if (website.includes('.') && !website.includes(' ')) {
        return `https://${website}`;
      }
      return '';
    }
  }
}

export class DuplicateFilterPipeline implements ScrapingPipeline {
  private seenItems = new Set<string>();

  async process(item: any): Promise<any | null> {
    const fingerprint = this.generateFingerprint(item);
    
    if (this.seenItems.has(fingerprint)) {
      console.log(`Duplicate détecté: ${item.name}`);
      return null; // Filtrer le doublon
    }
    
    this.seenItems.add(fingerprint);
    return item;
  }

  private generateFingerprint(item: any): string {
    const name = item.name?.toLowerCase().replace(/\s/g, '') || '';
    const address = item.address?.toLowerCase().replace(/\s/g, '') || '';
    const phone = item.phone?.replace(/[^\d]/g, '') || '';
    
    return `${name}:${address}:${phone}`;
  }

  reset() {
    this.seenItems.clear();
  }
}

export class EnrichmentPipeline implements ScrapingPipeline {
  async process(item: any): Promise<any> {
    // Enrichissement avec géocodage et catégorisation
    let enriched = { ...item };
    
    // Géocodage si pas de coordonnées
    if (!enriched.lat || !enriched.lng) {
      enriched = await this.geocode(enriched);
    }
    
    // Détection automatique de la catégorie
    if (!enriched.category) {
      enriched.category = this.detectCategory(enriched);
    }
    
    // Score de qualité
    enriched.quality_score = this.calculateQualityScore(enriched);
    
    return enriched;
  }

  private async geocode(item: any): Promise<any> {
    if (!item.address) return item;
    
    try {
      const fullAddress = `${item.address}, ${item.city || ''}, ${item.postal_code || ''}, France`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`
      );
      
      const data = await response.json();
      if (data && data[0]) {
        return {
          ...item,
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          geocoded: true
        };
      }
    } catch (error) {
      console.warn('Erreur géocodage:', error);
    }
    
    return item;
  }

  private detectCategory(item: any): string {
    const text = `${item.name} ${item.description || ''}`.toLowerCase();
    
    if (text.includes('smartphone') || text.includes('téléphone') || text.includes('mobile')) {
      return 'smartphone_repair';
    }
    if (text.includes('ordinateur') || text.includes('pc') || text.includes('laptop')) {
      return 'computer_repair';
    }
    if (text.includes('électroménager') || text.includes('lave')) {
      return 'appliance_repair';
    }
    
    return 'general_repair';
  }

  private calculateQualityScore(item: any): number {
    let score = 0;
    
    if (item.name && item.name.length > 3) score += 20;
    if (item.address && item.address.length > 10) score += 20;
    if (item.phone && item.phone.length >= 10) score += 15;
    if (item.email) score += 15;
    if (item.website) score += 10;
    if (item.lat && item.lng) score += 15;
    if (item.description && item.description.length > 20) score += 5;
    
    return Math.min(100, score);
  }
}

export class RateLimitMiddleware implements ScrapingMiddleware {
  private lastRequest = 0;
  private minDelay: number;

  constructor(requestsPerSecond: number = 2) {
    this.minDelay = 1000 / requestsPerSecond;
  }

  async processRequest(request: any): Promise<any> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    
    if (timeSinceLastRequest < this.minDelay) {
      const delayNeeded = this.minDelay - timeSinceLastRequest;
      console.log(`Rate limiting: attente ${delayNeeded}ms`);
      await new Promise(resolve => setTimeout(resolve, delayNeeded));
    }
    
    this.lastRequest = Date.now();
    return request;
  }
}

export class ScrapyLikeService {
  private pipelines: ScrapingPipeline[] = [];
  private middlewares: ScrapingMiddleware[] = [];
  private stats = {
    itemsProcessed: 0,
    itemsFiltered: 0,
    itemsEnriched: 0,
    errors: 0
  };

  constructor() {
    // Pipelines par défaut
    this.addPipeline(new DataCleaningPipeline());
    this.addPipeline(new DuplicateFilterPipeline());
    this.addPipeline(new EnrichmentPipeline());
    
    // Middlewares par défaut
    this.addMiddleware(new RateLimitMiddleware(1)); // 1 req/sec
  }

  addPipeline(pipeline: ScrapingPipeline) {
    this.pipelines.push(pipeline);
  }

  addMiddleware(middleware: ScrapingMiddleware) {
    this.middlewares.push(middleware);
  }

  async processItems(items: any[]): Promise<any[]> {
    console.log(`🔄 Traitement de ${items.length} éléments via pipelines Scrapy-like`);
    
    const processedItems: any[] = [];
    this.stats = { itemsProcessed: 0, itemsFiltered: 0, itemsEnriched: 0, errors: 0 };
    
    for (const item of items) {
      try {
        // Appliquer les middlewares de requête
        let processedItem = item;
        for (const middleware of this.middlewares) {
          if (middleware.processRequest) {
            processedItem = await middleware.processRequest(processedItem);
          }
        }
        
        // Appliquer les pipelines
        for (const pipeline of this.pipelines) {
          if (processedItem) { // Vérifier si l'item n'a pas été filtré
            processedItem = await pipeline.process(processedItem);
          }
        }
        
        if (processedItem) {
          processedItems.push(processedItem);
          this.stats.itemsEnriched++;
        } else {
          this.stats.itemsFiltered++;
        }
        
        this.stats.itemsProcessed++;
        
        // Log de progression
        if (this.stats.itemsProcessed % 10 === 0) {
          console.log(`📊 Progression: ${this.stats.itemsProcessed}/${items.length} traités`);
        }
        
      } catch (error) {
        console.error(`Erreur traitement item:`, error);
        this.stats.errors++;
      }
    }
    
    console.log(`✅ Pipelines terminés:`, this.stats);
    return processedItems;
  }

  getStats() {
    return { ...this.stats };
  }

  reset() {
    this.stats = { itemsProcessed: 0, itemsFiltered: 0, itemsEnriched: 0, errors: 0 };
    
    // Reset duplicate filter
    const duplicateFilter = this.pipelines.find(p => p instanceof DuplicateFilterPipeline) as DuplicateFilterPipeline;
    if (duplicateFilter) {
      duplicateFilter.reset();
    }
  }
}