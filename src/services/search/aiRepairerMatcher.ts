/**
 * Service de matching intelligent des réparateurs
 * Score multi-critères basé sur l'intention de recherche
 */

import { supabase } from '@/integrations/supabase/client';
import type { ParsedSearchIntent } from './aiQueryParser';

export interface MatchedRepairer {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email?: string;
  rating: number;
  reviewCount: number;
  lat: number;
  lng: number;
  isVerified: boolean;
  repairerLevel: number;
  specialties: string[];
  services: string[];
  
  // Scores de matching
  matchScore: number;
  relevanceScore: number;
  distanceScore: number;
  ratingScore: number;
  levelScore: number;
  
  // Distance en km (si localisation fournie)
  distance?: number;
  
  // Raisons du match
  matchReasons: string[];
}

export interface MatchingOptions {
  maxResults?: number;
  userLocation?: { lat: number; lng: number };
  maxDistanceKm?: number;
  minRating?: number;
  onlyVerified?: boolean;
  onlyClaimed?: boolean;
}

// Poids des différents critères
const WEIGHTS = {
  relevance: 0.35,    // Correspondance marque/modèle/réparation
  distance: 0.25,     // Proximité
  rating: 0.20,       // Note moyenne
  level: 0.15,        // Niveau réparateur
  availability: 0.05, // Disponibilité
};

export class AIRepairerMatcher {
  
  /**
   * Trouve les réparateurs correspondant le mieux à l'intention
   */
  static async match(
    intent: ParsedSearchIntent, 
    options: MatchingOptions = {}
  ): Promise<MatchedRepairer[]> {
    const {
      maxResults = 20,
      userLocation,
      maxDistanceKm = 50,
      minRating = 0,
      onlyVerified = false,
      onlyClaimed = false,
    } = options;
    
    try {
      // Récupérer les réparateurs de base
      let query = supabase
        .from('repairers')
        .select(`
          id,
          name,
          address,
          city,
          phone,
          email,
          rating,
          lat,
          lng,
          is_verified,
          specialties,
          services,
          opening_hours
        `)
        .not('lat', 'is', null)
        .not('lng', 'is', null);
      
      // Filtres de base
      if (minRating > 0) {
        query = query.gte('rating', minRating);
      }
      
      if (onlyVerified) {
        query = query.eq('is_verified', true);
      }
      
      // Filtre par ville si spécifié
      if (intent.location?.city) {
        query = query.ilike('city', `%${intent.location.city}%`);
      }
      
      // Filtre par code postal
      if (intent.location?.postalCode) {
        query = query.ilike('address', `%${intent.location.postalCode}%`);
      }
      
      const { data: repairers, error } = await query.limit(500);
      
      if (error) {
        console.error('Error fetching repairers:', error);
        return [];
      }
      
      if (!repairers || repairers.length === 0) {
        return [];
      }
      
      // Récupérer les niveaux des réparateurs depuis repairer_profiles
      const repairerIds = repairers.map(r => r.id);
      const { data: profiles } = await supabase
        .from('repairer_profiles')
        .select('id, repairer_level')
        .in('id', repairerIds);
      
      const levelMap = new Map(profiles?.map(p => [p.id, p.repairer_level || 0]) || []);
      
      // Scorer chaque réparateur
      const scoredRepairers = repairers.map(repairer => {
        const scores = this.calculateScores(repairer, intent, userLocation, levelMap.get(repairer.id) || 0);
        const matchReasons = this.getMatchReasons(repairer, intent, scores);
        
        // Calculer la distance si position utilisateur disponible
        let distance: number | undefined;
        if (userLocation && repairer.lat && repairer.lng) {
          distance = this.calculateDistance(
            userLocation.lat, userLocation.lng,
            repairer.lat, repairer.lng
          );
        }
        
        return {
          id: repairer.id,
          name: repairer.name,
          address: repairer.address || '',
          city: repairer.city || '',
          phone: repairer.phone || '',
          email: repairer.email || undefined,
          rating: repairer.rating || 0,
          reviewCount: 0, // À récupérer depuis les avis
          lat: repairer.lat,
          lng: repairer.lng,
          isVerified: repairer.is_verified || false,
          repairerLevel: levelMap.get(repairer.id) || 0,
          specialties: repairer.specialties || [],
          services: repairer.services || [],
          
          matchScore: scores.total,
          relevanceScore: scores.relevance,
          distanceScore: scores.distance,
          ratingScore: scores.rating,
          levelScore: scores.level,
          
          distance,
          matchReasons,
        } as MatchedRepairer;
      });
      
      // Filtrer par distance maximale
      let filtered = scoredRepairers;
      if (userLocation) {
        filtered = scoredRepairers.filter(r => 
          r.distance === undefined || r.distance <= maxDistanceKm
        );
      }
      
      // Filtrer par niveau si demandé (seulement fiches revendiquées)
      if (onlyClaimed) {
        filtered = filtered.filter(r => r.repairerLevel >= 1);
      }
      
      // Trier par score de match décroissant
      filtered.sort((a, b) => b.matchScore - a.matchScore);
      
      // Retourner les meilleurs résultats
      return filtered.slice(0, maxResults);
      
    } catch (error) {
      console.error('Error matching repairers:', error);
      return [];
    }
  }
  
  private static calculateScores(
    repairer: any, 
    intent: ParsedSearchIntent,
    userLocation?: { lat: number; lng: number },
    repairerLevel: number = 0
  ): { total: number; relevance: number; distance: number; rating: number; level: number } {
    
    // Score de pertinence (marque, modèle, type de réparation)
    let relevanceScore = 0;
    const specialties = (repairer.specialties || []).map((s: string) => s.toLowerCase());
    const services = (repairer.services || []).map((s: string) => s.toLowerCase());
    const allTerms = [...specialties, ...services];
    
    if (intent.brand) {
      if (allTerms.some(t => t.includes(intent.brand!.toLowerCase()))) {
        relevanceScore += 0.4;
      }
    }
    
    if (intent.model) {
      if (allTerms.some(t => t.includes(intent.model!.toLowerCase()))) {
        relevanceScore += 0.3;
      }
    }
    
    if (intent.repairType) {
      if (allTerms.some(t => t.includes(intent.repairType!.toLowerCase()))) {
        relevanceScore += 0.3;
      }
    }
    
    // Bonus si au moins un terme de la recherche correspond
    if (intent.keywords.length > 0) {
      const matchedKeywords = intent.keywords.filter(kw => 
        allTerms.some(t => t.includes(kw))
      );
      relevanceScore += (matchedKeywords.length / intent.keywords.length) * 0.2;
    }
    
    // Score minimum de pertinence pour tous
    relevanceScore = Math.max(relevanceScore, 0.2);
    relevanceScore = Math.min(relevanceScore, 1);
    
    // Score de distance
    let distanceScore = 1;
    if (userLocation && repairer.lat && repairer.lng) {
      const distance = this.calculateDistance(
        userLocation.lat, userLocation.lng,
        repairer.lat, repairer.lng
      );
      // Score décroissant avec la distance (1 à 0km, 0 à 50km+)
      distanceScore = Math.max(0, 1 - (distance / 50));
    }
    
    // Score de notation (0-5 -> 0-1)
    const ratingScore = (repairer.rating || 0) / 5;
    
    // Score de niveau (0-3 -> 0-1)
    const levelScore = repairerLevel / 3;
    
    // Score total pondéré
    const total = 
      relevanceScore * WEIGHTS.relevance +
      distanceScore * WEIGHTS.distance +
      ratingScore * WEIGHTS.rating +
      levelScore * WEIGHTS.level;
    
    return {
      total: Math.min(total, 1),
      relevance: relevanceScore,
      distance: distanceScore,
      rating: ratingScore,
      level: levelScore,
    };
  }
  
  private static getMatchReasons(
    repairer: any, 
    intent: ParsedSearchIntent,
    scores: { relevance: number; distance: number; rating: number; level: number }
  ): string[] {
    const reasons: string[] = [];
    
    if (scores.relevance > 0.5) {
      if (intent.brand) reasons.push(`Spécialiste ${intent.brand}`);
      if (intent.repairType) reasons.push(`Expert ${intent.repairType}`);
    }
    
    if (scores.rating >= 0.8) {
      reasons.push(`Excellentes notes (${repairer.rating}/5)`);
    } else if (scores.rating >= 0.6) {
      reasons.push(`Bien noté (${repairer.rating}/5)`);
    }
    
    if (scores.distance >= 0.8) {
      reasons.push('Très proche de vous');
    } else if (scores.distance >= 0.5) {
      reasons.push('À proximité');
    }
    
    if (repairer.is_verified) {
      reasons.push('Réparateur vérifié');
    }
    
    return reasons;
  }
  
  /**
   * Calcule la distance entre deux points (formule de Haversine)
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  private static toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
