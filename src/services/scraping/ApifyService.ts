import { supabase } from '@/integrations/supabase/client';

export interface ApifyActor {
  id: string;
  name: string;
  description: string;
  category: 'google_maps' | 'pages_jaunes' | 'yelp' | 'custom';
  estimatedCost: number; // en centimes
  fields: string[];
}

export interface ApifyScrapingOptions {
  actorId: string;
  searchTerm: string;
  location: string;
  maxResults: number;
  includeReviews?: boolean;
  includePhotos?: boolean;
  customFields?: Record<string, any>;
}

export interface ApifyJobResult {
  id: string;
  status: 'running' | 'succeeded' | 'failed';
  data: any[];
  usage: {
    computeUnits: number;
    datasetWrites: number;
    proxyUsage: number;
  };
  error?: string;
}

export class ApifyService {
  private static readonly POPULAR_ACTORS: ApifyActor[] = [
    {
      id: 'compass/google-maps-scraper',
      name: 'Google Maps Scraper',
      description: 'Scrape Google Maps pour récupérer adresses, téléphones, horaires et avis',
      category: 'google_maps',
      estimatedCost: 5, // 0.05€ par 100 résultats
      fields: ['name', 'address', 'phone', 'website', 'rating', 'reviews', 'hours']
    },
    {
      id: 'drobnikj/pages-jaunes-scraper',
      name: 'Pages Jaunes Scraper',
      description: 'Scrape Pages Jaunes pour les données françaises',
      category: 'pages_jaunes',
      estimatedCost: 3,
      fields: ['name', 'address', 'phone', 'website', 'category', 'description']
    },
    {
      id: 'compass/yelp-scraper',
      name: 'Yelp Scraper',
      description: 'Scrape Yelp pour avis et informations commerciales',
      category: 'yelp',
      estimatedCost: 7,
      fields: ['name', 'address', 'phone', 'website', 'rating', 'reviews', 'photos']
    }
  ];

  static getAvailableActors(): ApifyActor[] {
    return this.POPULAR_ACTORS;
  }

  static async startScrapingJob(options: ApifyScrapingOptions): Promise<string> {
    console.log('🚀 Démarrage du job Apify:', options);

    const { data, error } = await supabase.functions.invoke('apify-scraping', {
      body: {
        action: 'start',
        actorId: options.actorId,
        input: {
          searchTerm: options.searchTerm,
          location: options.location,
          maxResults: options.maxResults,
          includeReviews: options.includeReviews,
          includePhotos: options.includePhotos,
          ...options.customFields
        }
      }
    });

    if (error) {
      console.error('❌ Erreur démarrage job Apify:', error);
      throw new Error(`Erreur Apify: ${error.message}`);
    }

    console.log('✅ Job Apify démarré:', data.jobId);
    return data.jobId;
  }

  static async getJobStatus(jobId: string): Promise<ApifyJobResult> {
    const { data, error } = await supabase.functions.invoke('apify-scraping', {
      body: {
        action: 'status',
        jobId
      }
    });

    if (error) {
      throw new Error(`Erreur statut job: ${error.message}`);
    }

    return data;
  }

  static async getJobResults(jobId: string): Promise<any[]> {
    const { data, error } = await supabase.functions.invoke('apify-scraping', {
      body: {
        action: 'results',
        jobId
      }
    });

    if (error) {
      throw new Error(`Erreur récupération résultats: ${error.message}`);
    }

    return data.results || [];
  }

  static estimateCost(actorId: string, maxResults: number): number {
    const actor = this.POPULAR_ACTORS.find(a => a.id === actorId);
    if (!actor) return 0;

    const batches = Math.ceil(maxResults / 100);
    return batches * actor.estimatedCost;
  }

  static transformApifyDataToScrapingResult(apifyData: any[], source: string): any[] {
    return apifyData.map(item => ({
      name: item.name || item.title || '',
      address: item.address || item.location?.address || '',
      city: this.extractCity(item.address || item.location?.address || ''),
      postal_code: this.extractPostalCode(item.address || item.location?.address || ''),
      phone: item.phone || item.phoneNumber || '',
      email: item.email || '',
      website: item.website || item.url || '',
      description: item.description || item.about || '',
      rating: item.rating || item.stars || 0,
      reviews_count: item.reviewsCount || item.totalReviews || 0,
      lat: item.latitude || item.location?.lat || null,
      lng: item.longitude || item.location?.lng || null,
      source: `apify_${source}`,
      apify_data: item,
      data_quality_score: this.calculateQualityScore(item)
    }));
  }

  private static extractCity(address: string): string {
    if (!address) return '';
    
    // Extraction simple pour les adresses françaises
    const parts = address.split(',');
    if (parts.length >= 2) {
      return parts[parts.length - 2].trim();
    }
    
    return '';
  }

  private static extractPostalCode(address: string): string {
    if (!address) return '';
    
    const postalMatch = address.match(/\b(\d{5})\b/);
    return postalMatch ? postalMatch[1] : '';
  }

  private static calculateQualityScore(item: any): number {
    let score = 0;
    
    if (item.name) score += 20;
    if (item.address) score += 20;
    if (item.phone) score += 15;
    if (item.email) score += 10;
    if (item.website) score += 10;
    if (item.rating && item.rating > 0) score += 10;
    if (item.latitude && item.longitude) score += 15;
    
    return Math.min(100, score);
  }
}