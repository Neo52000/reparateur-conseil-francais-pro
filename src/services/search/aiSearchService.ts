/**
 * Service principal de recherche IA
 * Orchestre le parsing et le matching
 */

import { supabase } from '@/integrations/supabase/client';
import { AIQueryParser, type ParsedSearchIntent } from './aiQueryParser';
import { AIRepairerMatcher, type MatchedRepairer, type MatchingOptions } from './aiRepairerMatcher';

export interface AISearchResult {
  // Réparateurs trouvés
  repairers: MatchedRepairer[];
  
  // Intention parsée
  intent: ParsedSearchIntent;
  
  // Métadonnées
  totalResults: number;
  searchTime: number;
  usedFallback: boolean;
  
  // Suggestions
  suggestions?: string[];
  
  // Corrections orthographiques
  didYouMean?: string;
}

export interface AISearchOptions extends MatchingOptions {
  // Activer le logging des requêtes
  logQuery?: boolean;
  
  // Session ID pour le tracking
  sessionId?: string;
  
  // User ID si connecté
  userId?: string;
}

export class AISearchService {
  
  /**
   * Recherche principale avec IA
   */
  static async search(query: string, options: AISearchOptions = {}): Promise<AISearchResult> {
    const startTime = Date.now();
    let usedFallback = false;
    
    // Parser la requête
    const intent = AIQueryParser.parse(query);
    
    console.log('🔍 AI Search - Parsed intent:', intent);
    
    // Si la confiance est trop basse, utiliser la recherche classique
    if (intent.confidence < 0.2) {
      usedFallback = true;
      console.log('⚠️ Low confidence, using fallback search');
    }
    
    // Matcher les réparateurs
    const repairers = await AIRepairerMatcher.match(intent, options);
    
    const searchTime = Date.now() - startTime;
    
    // Logger la requête si demandé
    if (options.logQuery) {
      await this.logSearchQuery(query, intent, repairers, usedFallback, options);
    }
    
    // Générer des suggestions
    const suggestions = this.generateSuggestions(intent, repairers.length);
    
    return {
      repairers,
      intent,
      totalResults: repairers.length,
      searchTime,
      usedFallback,
      suggestions,
    };
  }
  
  /**
   * Recherche rapide (sans parsing IA complet)
   */
  static async quickSearch(
    term: string, 
    city?: string, 
    options: MatchingOptions = {}
  ): Promise<MatchedRepairer[]> {
    // Construire une intention simplifiée
    const intent: ParsedSearchIntent = {
      originalQuery: term,
      keywords: term.split(/\s+/).filter(w => w.length > 2),
      confidence: 0.5,
      location: city ? { city } : undefined,
    };
    
    return AIRepairerMatcher.match(intent, options);
  }
  
  /**
   * Recherche par coordonnées GPS
   */
  static async searchNearby(
    lat: number, 
    lng: number, 
    radiusKm: number = 10,
    filters?: {
      brand?: string;
      repairType?: string;
      minRating?: number;
    }
  ): Promise<MatchedRepairer[]> {
    const intent: ParsedSearchIntent = {
      originalQuery: `Réparateurs à proximité`,
      keywords: [],
      confidence: 0.8,
      brand: filters?.brand,
      repairType: filters?.repairType,
      criteria: {
        nearest: true,
      },
    };
    
    return AIRepairerMatcher.match(intent, {
      userLocation: { lat, lng },
      maxDistanceKm: radiusKm,
      minRating: filters?.minRating,
      maxResults: 50,
    });
  }
  
  /**
   * Suggestions de recherche basées sur l'historique et les tendances
   */
  static async getSuggestions(partialQuery: string): Promise<string[]> {
    const suggestions: string[] = [];
    const query = partialQuery.toLowerCase();
    
    // Suggestions basées sur les marques
    const popularBrands = ['iPhone', 'Samsung Galaxy', 'Huawei', 'Xiaomi', 'Google Pixel'];
    suggestions.push(...popularBrands.filter(b => b.toLowerCase().includes(query)));
    
    // Suggestions basées sur les réparations
    const popularRepairs = [
      'Écran cassé',
      'Batterie',
      'Connecteur de charge',
      'Caméra',
      'Haut-parleur',
      'Bouton power',
    ];
    suggestions.push(...popularRepairs.filter(r => r.toLowerCase().includes(query)));
    
    // Suggestions combinées
    if (query.includes('iphone')) {
      suggestions.push('iPhone écran cassé', 'iPhone batterie', 'iPhone caméra');
    }
    if (query.includes('samsung')) {
      suggestions.push('Samsung Galaxy écran', 'Samsung batterie');
    }
    
    return suggestions.slice(0, 5);
  }
  
  /**
   * Obtenir les recherches populaires
   */
  static async getPopularSearches(): Promise<string[]> {
    try {
      const { data } = await supabase
        .from('ai_search_queries')
        .select('raw_query')
        .gte('results_count', 1)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (!data) return [];
      
      // Compter les occurrences
      const counts = new Map<string, number>();
      data.forEach(row => {
        const normalized = row.raw_query.toLowerCase().trim();
        counts.set(normalized, (counts.get(normalized) || 0) + 1);
      });
      
      // Trier par popularité
      return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([query]) => query);
        
    } catch (error) {
      console.error('Error fetching popular searches:', error);
      return [];
    }
  }
  
  /**
   * Logger une requête de recherche
   */
  private static async logSearchQuery(
    query: string,
    intent: ParsedSearchIntent,
    repairers: MatchedRepairer[],
    usedFallback: boolean,
    options: AISearchOptions
  ): Promise<void> {
    try {
      await supabase.from('ai_search_queries').insert({
        raw_query: query,
        parsed_intent: intent as any,
        matched_repairers: repairers.slice(0, 10).map(r => r.id),
        results_count: repairers.length,
        fallback_used: usedFallback,
        session_id: options.sessionId,
        user_id: options.userId,
      });
    } catch (error) {
      console.error('Error logging search query:', error);
    }
  }
  
  private static generateSuggestions(intent: ParsedSearchIntent, resultsCount: number): string[] {
    const suggestions: string[] = [];
    
    if (resultsCount === 0) {
      suggestions.push('Essayez une recherche plus large');
      if (intent.location?.city) {
        suggestions.push(`Chercher dans les villes proches de ${intent.location.city}`);
      }
      if (intent.brand) {
        suggestions.push(`Voir tous les réparateurs ${intent.brand}`);
      }
    } else if (resultsCount < 5) {
      suggestions.push('Élargir la zone de recherche');
    }
    
    if (intent.brand && !intent.repairType) {
      suggestions.push(`Écran ${intent.brand}`, `Batterie ${intent.brand}`);
    }
    
    return suggestions;
  }
}

export { AIQueryParser, AIRepairerMatcher };
export type { ParsedSearchIntent, MatchedRepairer, MatchingOptions };
