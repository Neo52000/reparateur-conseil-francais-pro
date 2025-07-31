import { MistralAIService } from './MistralAIService';
import { DeepSeekService } from './ai/DeepSeekService';
import { supabase } from '@/integrations/supabase/client';

export interface ScrapingTarget {
  city: string;
  category: string;
  source: 'google_maps' | 'pages_jaunes' | 'local_directories';
  maxResults?: number;
}

export interface ScrapedRepairer {
  name: string;
  address: string;
  city: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  google_place_id?: string;
  rating?: number;
  review_count?: number;
  description?: string;
  opening_hours?: string[];
  source: string;
  confidence_score: number;
  ai_classification: {
    is_repairer: boolean;
    confidence: number;
    specialties: string[];
    services: string[];
    quality_score: number;
  };
}

export interface ScrapingSuggestion {
  id: string;
  scraped_data: ScrapedRepairer;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
}

export class IntelligentScrapingService {
  private mistralService?: MistralAIService;
  private isInitialized = false;

  private async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Initialize AI services if API keys are available
      const { data: secrets } = await supabase.functions.invoke('get-ai-keys');
      if (secrets?.mistral) {
        this.mistralService = new MistralAIService(secrets.mistral);
      }
      this.isInitialized = true;
    } catch (error) {
      console.warn('AI services not available:', error);
      this.isInitialized = true;
    }
  }

  async scrapeRepairers(target: ScrapingTarget): Promise<ScrapedRepairer[]> {
    await this.initialize();
    
    console.log('🔍 Starting intelligent scraping for:', target);
    
    try {
      // Call the edge function for actual scraping
      const { data, error } = await supabase.functions.invoke('intelligent-scraping', {
        body: { target }
      });

      if (error) throw error;
      
      const rawData = data.results || [];
      console.log(`📊 Found ${rawData.length} potential repairers`);

      // Classify and enrich each result with AI
      const enrichedResults = await Promise.all(
        rawData.map(async (item: any) => this.classifyAndEnrich(item, target))
      );

      // Filter out low-confidence results
      const validRepairers = enrichedResults.filter(
        result => result.ai_classification.is_repairer && result.confidence_score > 0.6
      );

      console.log(`✅ Validated ${validRepairers.length} repairers with high confidence`);
      return validRepairers;

    } catch (error) {
      console.error('❌ Scraping failed:', error);
      throw error;
    }
  }

  private async classifyAndEnrich(rawData: any, target: ScrapingTarget): Promise<ScrapedRepairer> {
    let aiClassification = {
      is_repairer: false,
      confidence: 0.1,
      specialties: [] as string[],
      services: [] as string[],
      quality_score: 0
    };

    // Use AI classification if available
    if (this.mistralService && rawData.name && rawData.address) {
      try {
        const classification = await this.mistralService.classifyRepairer(
          rawData.name,
          rawData.address,
          rawData.description || rawData.category
        );
        
        aiClassification = {
          is_repairer: classification.isRepairer,
          confidence: classification.confidence,
          specialties: classification.specialties || [],
          services: classification.services || [],
          quality_score: this.calculateQualityScore(rawData, classification)
        };
      } catch (error) {
        console.warn('AI classification failed, using fallback:', error);
        aiClassification = this.fallbackClassification(rawData, target);
      }
    } else {
      // Fallback to keyword-based classification
      aiClassification = this.fallbackClassification(rawData, target);
    }

    return {
      name: rawData.name || '',
      address: rawData.address || '',
      city: rawData.city || target.city,
      postal_code: rawData.postal_code,
      phone: this.formatPhone(rawData.phone),
      email: rawData.email,
      website: rawData.website,
      google_place_id: rawData.place_id,
      rating: parseFloat(rawData.rating) || undefined,
      review_count: parseInt(rawData.review_count) || undefined,
      description: rawData.description,
      opening_hours: rawData.opening_hours,
      source: rawData.source || target.source,
      confidence_score: aiClassification.confidence,
      ai_classification: aiClassification
    };
  }

  private fallbackClassification(rawData: any, target: ScrapingTarget) {
    const repairKeywords = [
      'réparation', 'repair', 'dépannage', 'service', 'fix',
      'smartphone', 'téléphone', 'mobile', 'iphone', 'samsung',
      'écran', 'batterie', 'vitre', 'gsm', 'android'
    ];

    const text = `${rawData.name} ${rawData.description || ''} ${rawData.category || ''}`.toLowerCase();
    const keywordMatches = repairKeywords.filter(keyword => text.includes(keyword)).length;
    
    const isRepairer = keywordMatches >= 2;
    const confidence = Math.min(0.9, keywordMatches * 0.15 + 0.3);

    return {
      is_repairer: isRepairer,
      confidence: confidence,
      specialties: isRepairer ? ['Réparation smartphone'] : [],
      services: isRepairer ? ['Réparation écran', 'Réparation batterie'] : [],
      quality_score: this.calculateQualityScore(rawData, { confidence })
    };
  }

  private calculateQualityScore(rawData: any, classification: any): number {
    let score = 0;
    
    // Data completeness (40%)
    if (rawData.name) score += 10;
    if (rawData.address) score += 10;
    if (rawData.phone) score += 8;
    if (rawData.website) score += 7;
    if (rawData.description) score += 5;
    
    // Quality indicators (30%)
    if (rawData.rating && rawData.rating > 4) score += 15;
    if (rawData.review_count && rawData.review_count > 10) score += 10;
    if (rawData.opening_hours) score += 5;
    
    // AI confidence (30%)
    score += classification.confidence * 30;
    
    return Math.min(100, score);
  }

  private formatPhone(phone?: string): string | undefined {
    if (!phone) return undefined;
    
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // French phone number formatting
    if (digits.length === 10 && digits.startsWith('0')) {
      return digits.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
    
    return phone; // Return original if can't format
  }

  async saveSuggestions(repairers: ScrapedRepairer[]): Promise<ScrapingSuggestion[]> {
    const suggestions = repairers.map(repairer => ({
      scraped_data: repairer as any, // Type casting pour JSON compatibility
      status: 'pending' as const,
      confidence_score: repairer.confidence_score,
      quality_score: repairer.ai_classification.quality_score,
      source: 'intelligent_scraping',
      created_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('scraping_suggestions')
      .insert(suggestions)
      .select();

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'pending' | 'approved' | 'rejected',
      scraped_data: item.scraped_data as unknown as ScrapedRepairer
    }) as ScrapingSuggestion);
  }

  async getSuggestions(status?: 'pending' | 'approved' | 'rejected'): Promise<ScrapingSuggestion[]> {
    let query = supabase
      .from('scraping_suggestions')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'pending' | 'approved' | 'rejected',
      scraped_data: item.scraped_data as unknown as ScrapedRepairer
    }) as ScrapingSuggestion);
  }

  async approveSuggestion(id: string): Promise<void> {
    // Get the suggestion
    const { data: suggestion, error: fetchError } = await supabase
      .from('scraping_suggestions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    
    const scrapedData = suggestion.scraped_data as unknown as ScrapedRepairer;
    
    // Create repairer record
    const repairerData = {
      name: scrapedData.name,
      address: scrapedData.address,
      city: scrapedData.city,
      postal_code: scrapedData.postal_code,
      phone: scrapedData.phone,
      email: scrapedData.email,
      website: scrapedData.website,
      description: scrapedData.description,
      rating: scrapedData.rating || 0,
      services: scrapedData.ai_classification.services,
      specialties: scrapedData.ai_classification.specialties,
      data_quality_score: scrapedData.ai_classification.quality_score,
      is_verified: false,
      source: 'intelligent_scraping'
    };

    const { error: insertError } = await supabase
      .from('repairers')
      .insert(repairerData);

    if (insertError) throw insertError;

    // Update suggestion status
    const { error: updateError } = await supabase
      .from('scraping_suggestions')
      .update({ 
        status: 'approved',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) throw updateError;
  }

  async rejectSuggestion(id: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('scraping_suggestions')
      .update({ 
        status: 'rejected',
        rejection_reason: reason,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }
}