import { supabase } from '@/integrations/supabase/client';

interface RepairerProfile {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  rating: number;
  specialties: string[];
  pricing: Record<string, { min: number; max: number }>;
  availability: {
    sameDay: boolean;
    nextDay: boolean;
    withinWeek: boolean;
  };
  distance?: number;
  estimatedTravelTime?: string;
}

interface UserPreferences {
  maxDistance: number; // en km
  prioritizePrice: boolean;
  prioritizeRating: boolean;
  prioritizeSpeed: boolean;
  urgencyLevel: 'low' | 'medium' | 'high';
}

interface RecommendationCriteria {
  problemType: string;
  deviceBrand?: string;
  userLocation: [number, number];
  userPreferences: UserPreferences;
  budget?: { min: number; max: number };
}

export class RepairRecommendationEngine {
  
  async findOptimalRepairers(criteria: RecommendationCriteria): Promise<{
    recommendations: RepairerProfile[];
    reasoning: string[];
    alternatives: RepairerProfile[];
  }> {
    try {
      // Récupérer tous les réparateurs actifs
      const { data: allRepairers, error } = await supabase
        .from('repairers')
        .select('id, name, address, lat, lng, phone, rating, specialties, pricing_data, services_offered, opening_hours, is_verified')
        .eq('is_active', true)
        .not('lat', 'is', null)
        .not('lng', 'is', null);

      if (error) throw error;

      // Calculer la distance et filtrer par proximité
      const repairersWithDistance = this.calculateDistances(
        allRepairers || [], 
        criteria.userLocation
      ).filter(repairer => 
        repairer.distance! <= criteria.userPreferences.maxDistance
      );

      // Scorer et classer les réparateurs
      const scoredRepairers = this.scoreRepairers(repairersWithDistance, criteria);

      // Sélectionner les meilleures recommandations
      const recommendations = scoredRepairers.slice(0, 3);
      const alternatives = scoredRepairers.slice(3, 6);

      // Générer le raisonnement
      const reasoning = this.generateReasoning(criteria, recommendations);

      return {
        recommendations,
        reasoning,
        alternatives
      };

    } catch (error) {
      console.error('Erreur recommandation réparateurs:', error);
      return {
        recommendations: [],
        reasoning: ['Erreur lors de la recherche de réparateurs'],
        alternatives: []
      };
    }
  }

  private calculateDistances(
    repairers: any[], 
    userLocation: [number, number]
  ): RepairerProfile[] {
    return repairers.map(repairer => {
      const distance = this.haversineDistance(
        userLocation[0], userLocation[1],
        repairer.lat, repairer.lng
      );

      const estimatedTravelTime = this.estimateTravelTime(distance);

      return {
        id: repairer.id,
        name: repairer.name,
        address: repairer.address,
        lat: repairer.lat,
        lng: repairer.lng,
        phone: repairer.phone,
        rating: repairer.rating || 4.0,
        specialties: repairer.services_offered || [],
        pricing: repairer.pricing_data || {},
        availability: this.parseAvailability(repairer.opening_hours),
        distance,
        estimatedTravelTime
      };
    });
  }

  private scoreRepairers(
    repairers: RepairerProfile[], 
    criteria: RecommendationCriteria
  ): (RepairerProfile & { score: number })[] {
    return repairers
      .map(repairer => ({
        ...repairer,
        score: this.calculateRepairerScore(repairer, criteria)
      }))
      .sort((a, b) => b.score - a.score);
  }

  private calculateRepairerScore(
    repairer: RepairerProfile, 
    criteria: RecommendationCriteria
  ): number {
    let score = 0;
    const weights = this.getWeights(criteria.userPreferences);

    // Score de distance (plus proche = meilleur)
    const distanceScore = Math.max(0, 1 - (repairer.distance! / criteria.userPreferences.maxDistance));
    score += distanceScore * weights.distance;

    // Score de rating
    const ratingScore = repairer.rating / 5;
    score += ratingScore * weights.rating;

    // Score de spécialisation
    const specializationScore = this.getSpecializationScore(repairer, criteria.problemType, criteria.deviceBrand);
    score += specializationScore * weights.specialization;

    // Score de prix (si budget défini)
    if (criteria.budget) {
      const priceScore = this.getPriceScore(repairer, criteria);
      score += priceScore * weights.price;
    }

    // Score de disponibilité selon l'urgence
    const availabilityScore = this.getAvailabilityScore(repairer, criteria.userPreferences.urgencyLevel);
    score += availabilityScore * weights.availability;

    return score;
  }

  private getWeights(preferences: UserPreferences) {
    const baseWeights = {
      distance: 0.25,
      rating: 0.20,
      specialization: 0.20,
      price: 0.15,
      availability: 0.20
    };

    // Ajuster selon les préférences utilisateur
    if (preferences.prioritizePrice) {
      baseWeights.price *= 1.5;
      baseWeights.rating *= 0.8;
    }

    if (preferences.prioritizeRating) {
      baseWeights.rating *= 1.5;
      baseWeights.price *= 0.8;
    }

    if (preferences.prioritizeSpeed) {
      baseWeights.availability *= 1.5;
      baseWeights.distance *= 1.3;
      baseWeights.price *= 0.7;
    }

    if (preferences.urgencyLevel === 'high') {
      baseWeights.availability *= 1.8;
      baseWeights.distance *= 1.4;
    }

    return baseWeights;
  }

  private getSpecializationScore(
    repairer: RepairerProfile, 
    problemType: string, 
    deviceBrand?: string
  ): number {
    let score = 0.5; // Score de base

    // Vérifier les spécialités pour le type de problème
    const problemSpecialties = {
      'écran cassé': ['écran', 'vitre', 'affichage'],
      'batterie': ['batterie', 'autonomie', 'charge'],
      'eau': ['oxydation', 'eau', 'liquide'],
      'carte mère': ['carte mère', 'composants']
    };

    const relevantKeywords = problemSpecialties[problemType as keyof typeof problemSpecialties] || [];
    
    for (const specialty of repairer.specialties) {
      if (relevantKeywords.some(keyword => 
        specialty.toLowerCase().includes(keyword.toLowerCase())
      )) {
        score += 0.3;
      }
    }

    // Bonus pour la marque spécifique
    if (deviceBrand && repairer.specialties.some(s => 
      s.toLowerCase().includes(deviceBrand.toLowerCase())
    )) {
      score += 0.2;
    }

    return Math.min(score, 1);
  }

  private getPriceScore(repairer: RepairerProfile, criteria: RecommendationCriteria): number {
    if (!criteria.budget || !repairer.pricing[criteria.problemType]) {
      return 0.5; // Score neutre si pas d'info prix
    }

    const repairerPrice = repairer.pricing[criteria.problemType];
    const userBudget = criteria.budget;

    // Vérifier si le prix est dans le budget
    if (repairerPrice.min <= userBudget.max && repairerPrice.max >= userBudget.min) {
      // Plus le prix est bas dans la fourchette, meilleur le score
      const avgPrice = (repairerPrice.min + repairerPrice.max) / 2;
      const avgBudget = (userBudget.min + userBudget.max) / 2;
      
      return Math.max(0, 1 - (avgPrice / avgBudget));
    }

    return 0; // Hors budget
  }

  private getAvailabilityScore(repairer: RepairerProfile, urgency: string): number {
    switch (urgency) {
      case 'high':
        return repairer.availability.sameDay ? 1 : 
               repairer.availability.nextDay ? 0.7 : 0.3;
      case 'medium':
        return repairer.availability.nextDay ? 1 :
               repairer.availability.withinWeek ? 0.8 : 0.5;
      case 'low':
        return repairer.availability.withinWeek ? 1 : 0.7;
      default:
        return 0.5;
    }
  }

  private generateReasoning(
    criteria: RecommendationCriteria, 
    recommendations: RepairerProfile[]
  ): string[] {
    const reasoning: string[] = [];

    if (recommendations.length === 0) {
      return ['Aucun réparateur trouvé dans votre zone de recherche'];
    }

    const topRepairer = recommendations[0];

    // Distance
    reasoning.push(
      `🚗 ${topRepairer.name} est à ${topRepairer.distance?.toFixed(1)}km de vous (${topRepairer.estimatedTravelTime})`
    );

    // Rating
    if (topRepairer.rating >= 4.5) {
      reasoning.push(`⭐ Excellente réputation avec ${topRepairer.rating}/5 étoiles`);
    } else if (topRepairer.rating >= 4.0) {
      reasoning.push(`⭐ Bonne réputation avec ${topRepairer.rating}/5 étoiles`);
    }

    // Spécialisation
    const hasSpecialty = topRepairer.specialties.some(s => 
      s.toLowerCase().includes(criteria.problemType.toLowerCase())
    );
    if (hasSpecialty) {
      reasoning.push(`🔧 Spécialisé dans ce type de réparation`);
    }

    // Urgence
    if (criteria.userPreferences.urgencyLevel === 'high' && topRepairer.availability.sameDay) {
      reasoning.push(`⚡ Intervention possible le jour même`);
    }

    return reasoning;
  }

  private parseAvailability(openingHours: any): {
    sameDay: boolean;
    nextDay: boolean;
    withinWeek: boolean;
  } {
    // Simuler la disponibilité basée sur les horaires
    // En réalité, cela devrait être connecté à un système de réservation
    return {
      sameDay: Math.random() > 0.7, // 30% de chance de dispo jour même
      nextDay: Math.random() > 0.3, // 70% de chance de dispo lendemain
      withinWeek: true // Toujours disponible dans la semaine
    };
  }

  private estimateTravelTime(distance: number): string {
    const avgSpeedKmh = 25; // Vitesse moyenne en ville
    const timeHours = distance / avgSpeedKmh;
    const timeMinutes = Math.round(timeHours * 60);
    
    if (timeMinutes < 60) {
      return `${timeMinutes} min`;
    } else {
      const hours = Math.floor(timeMinutes / 60);
      const minutes = timeMinutes % 60;
      return `${hours}h${minutes > 0 ? minutes.toString().padStart(2, '0') : ''}`;
    }
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const repairRecommendationEngine = new RepairRecommendationEngine();