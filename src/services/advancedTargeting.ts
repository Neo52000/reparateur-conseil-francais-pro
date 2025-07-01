
import { supabase } from '@/integrations/supabase/client';
import { EnhancedTargetingSegment, GeoTargetingZone, UserBehaviorEvent, PersonalizationData } from '@/types/advancedAdvertising';

export class AdvancedTargetingService {
  // Gestion des segments de ciblage
  static async createTargetingSegment(segment: Omit<EnhancedTargetingSegment, 'id' | 'created_at' | 'updated_at' | 'estimated_reach'>) {
    const { data, error } = await supabase
      .from('targeting_segments')
      .insert([segment])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getTargetingSegments(includeInactive = false) {
    let query = supabase
      .from('targeting_segments')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as EnhancedTargetingSegment[];
  }

  static async updateTargetingSegment(id: string, updates: Partial<EnhancedTargetingSegment>) {
    const { data, error } = await supabase
      .from('targeting_segments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Gestion des zones géographiques
  static async createGeoZone(zone: Omit<GeoTargetingZone, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('geo_targeting_zones')
      .insert([zone])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getGeoZones() {
    const { data, error } = await supabase
      .from('geo_targeting_zones')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data as GeoTargetingZone[];
  }

  // Tracking comportemental
  static async trackUserBehavior(event: Omit<UserBehaviorEvent, 'id' | 'created_at'>) {
    const { error } = await supabase
      .from('user_behavior_events')
      .insert([event]);

    if (error) {
      console.error('Error tracking user behavior:', error);
    }
  }

  static async getUserBehaviorProfile(userId: string, days = 30) {
    const { data, error } = await supabase
      .from('user_behavior_events')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as UserBehaviorEvent[];
  }

  // Personnalisation des messages
  static async getPersonalizationData(userId?: string, sessionId?: string): Promise<PersonalizationData> {
    if (!userId && !sessionId) {
      return {};
    }

    const personalizationData: PersonalizationData = {};

    if (userId) {
      // Récupérer les données utilisateur
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, city')
        .eq('id', userId)
        .single();

      if (profile) {
        personalizationData.user_name = profile.first_name;
        personalizationData.city = profile.city;
      }

      // Récupérer l'historique d'interactions récent
      const { data: interactions } = await supabase
        .from('user_interaction_history')
        .select('interaction_type, target_type, metadata, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (interactions) {
        personalizationData.interaction_history = interactions.map(interaction => ({
          type: interaction.interaction_type,
          target: interaction.target_type,
          timestamp: interaction.created_at
        }));
      }

      // Récupérer les recherches récentes
      const { data: behaviors } = await supabase
        .from('user_behavior_events')
        .select('event_data')
        .eq('user_id', userId)
        .eq('event_type', 'search')
        .order('created_at', { ascending: false })
        .limit(5);

      if (behaviors) {
        personalizationData.recent_searches = behaviors
          .map(b => b.event_data?.query)
          .filter(Boolean);
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
      const distance = this.calculateDistance(
        userLocation.lat, userLocation.lng,
        zone.coordinates.lat, zone.coordinates.lng
      );
      return distance <= zone.coordinates.radius;
    }
    
    // Pour les autres types, on peut implémenter des vérifications plus complexes
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
}
