
import { supabase } from '@/integrations/supabase/client';
import { EnhancedTargetingSegment, GeoTargetingZone, UserBehaviorEvent, PersonalizationData } from '@/types/advancedAdvertising';

export class AdvancedTargetingService {
  // Gestion des segments de ciblage - Maintenant avec vraies données Supabase
  static async createTargetingSegment(segment: Omit<EnhancedTargetingSegment, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('advanced_targeting_segments')
        .insert([{
          name: segment.name,
          description: segment.description,
          criteria: segment.criteria,
          estimated_reach: segment.estimated_reach || 0,
          is_active: segment.is_active
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating targeting segment:', error);
      throw error;
    }
  }

  static async getTargetingSegments(includeInactive = false) {
    try {
      let query = supabase
        .from('advanced_targeting_segments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching targeting segments:', error);
      return [];
    }
  }

  static async updateTargetingSegment(id: string, updates: Partial<EnhancedTargetingSegment>) {
    try {
      const { data, error } = await supabase
        .from('advanced_targeting_segments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating targeting segment:', error);
      throw error;
    }
  }

  // Gestion des zones géographiques - Maintenant avec vraies données Supabase
  static async createGeoZone(zone: Omit<GeoTargetingZone, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('geo_targeting_zones')
        .insert([zone])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating geo zone:', error);
      throw error;
    }
  }

  static async getGeoZones() {
    try {
      const { data, error } = await supabase
        .from('geo_targeting_zones')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching geo zones:', error);
      return [];
    }
  }

  // Tracking comportemental - Maintenant avec vraies données Supabase
  static async trackUserBehavior(event: Omit<UserBehaviorEvent, 'id' | 'created_at'>) {
    try {
      const { error } = await supabase
        .from('user_behavior_events')
        .insert([event]);

      if (error) {
        console.error('Error tracking user behavior:', error);
      }
    } catch (error) {
      console.error('Error tracking user behavior:', error);
    }
  }

  static async getUserBehaviorProfile(userId: string, days = 30) {
    try {
      const { data, error } = await supabase
        .from('user_behavior_events')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user behavior profile:', error);
      return [];
    }
  }

  // Personnalisation des messages - Maintenant avec vraies données Supabase
  static async getPersonalizationData(userId?: string, sessionId?: string): Promise<PersonalizationData> {
    if (!userId && !sessionId) {
      return {};
    }

    const personalizationData: PersonalizationData = {};

    if (userId) {
      try {
        // Récupérer les données utilisateur basiques
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, email')
          .eq('id', userId)
          .single();

        if (profile) {
          personalizationData.user_name = profile.first_name;
        }

        // Récupérer les événements comportementaux récents
        const { data: behaviors } = await supabase
          .from('user_behavior_events')
          .select('event_type, event_data, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (behaviors) {
          personalizationData.interaction_history = behaviors.map(event => {
            const eventData = event.event_data as Record<string, any> | null;
            const target = eventData && typeof eventData === 'object' ? eventData.target : 'unknown';
            
            return {
              type: event.event_type,
              target: typeof target === 'string' ? target : 'unknown',
              timestamp: event.created_at
            };
          });
        }

        // Récupérer l'historique des interactions
        const { data: interactions } = await supabase
          .from('user_interaction_history')
          .select('interaction_type, target_type, target_id, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (interactions) {
          const interactionHistory = interactions.map(interaction => ({
            type: interaction.interaction_type,
            target: interaction.target_id || 'unknown',
            timestamp: interaction.created_at
          }));

          personalizationData.interaction_history = [
            ...(personalizationData.interaction_history || []),
            ...interactionHistory
          ];
        }
      } catch (error) {
        console.error('Error fetching personalization data:', error);
      }
    }

    return personalizationData;
  }

  // Scoring et matching des segments
  static calculateSegmentMatch(userProfile: any, segmentCriteria: EnhancedTargetingSegment['criteria']): number {
    let score = 0;
    let totalCriteria = 0;

    // Vérification des types d'utilisateur
    if (segmentCriteria.user_types && userProfile.user_type) {
      totalCriteria++;
      if (segmentCriteria.user_types.includes(userProfile.user_type)) {
        score += 30;
      }
    }

    // Vérification géographique
    if (segmentCriteria.cities && userProfile.city) {
      totalCriteria++;
      if (segmentCriteria.cities.some(city => 
        city.toLowerCase().includes(userProfile.city.toLowerCase()) ||
        userProfile.city.toLowerCase().includes(city.toLowerCase())
      )) {
        score += 25;
      }
    }

    // Vérification démographique
    if (segmentCriteria.demographic_filters) {
      const demo = segmentCriteria.demographic_filters;
      if (demo.age_range && userProfile.age_range) {
        totalCriteria++;
        if (demo.age_range === userProfile.age_range) {
          score += 20;
        }
      }
      if (demo.gender && userProfile.gender) {
        totalCriteria++;
        if (demo.gender === userProfile.gender) {
          score += 15;
        }
      }
    }

    // Vérification comportementale
    if (segmentCriteria.behavior_patterns && userProfile.behavior_patterns) {
      totalCriteria++;
      const matches = segmentCriteria.behavior_patterns.filter(pattern =>
        userProfile.behavior_patterns.includes(pattern)
      );
      if (matches.length > 0) {
        score += (matches.length / segmentCriteria.behavior_patterns.length) * 20;
      }
    }

    // Retourner le score normalisé
    return totalCriteria > 0 ? Math.round(score / totalCriteria * 4) : 0;
  }

  // Géofencing
  static isWithinGeoZone(userLocation: {lat: number, lng: number}, zone: GeoTargetingZone): boolean {
    if (zone.type === 'radius' && zone.coordinates) {
      const coords = zone.coordinates as any;
      if (coords.lat && coords.lng && coords.radius) {
        const distance = this.calculateDistance(
          userLocation.lat, userLocation.lng,
          coords.lat, coords.lng
        );
        return distance <= coords.radius;
      }
    }
    
    return false;
  }

  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Fonctions utilitaires pour l'analytics
  static async getCampaignPerformanceMetrics(campaignId: string, days = 30) {
    try {
      const { data, error } = await supabase
        .from('campaign_performance_metrics')
        .select('*')
        .eq('campaign_id', campaignId)
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching campaign performance metrics:', error);
      return [];
    }
  }

  static async trackUserInteraction(userId: string, interactionType: string, targetType: string, targetId: string, metadata: Record<string, any> = {}) {
    try {
      const { error } = await supabase
        .from('user_interaction_history')
        .insert([{
          user_id: userId,
          interaction_type: interactionType,
          target_type: targetType,
          target_id: targetId,
          metadata
        }]);

      if (error) {
        console.error('Error tracking user interaction:', error);
      }
    } catch (error) {
      console.error('Error tracking user interaction:', error);
    }
  }
}
