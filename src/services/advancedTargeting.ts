
import { supabase } from '@/integrations/supabase/client';
import { EnhancedTargetingSegment, GeoTargetingZone, UserBehaviorEvent, PersonalizationData } from '@/types/advancedAdvertising';

export class AdvancedTargetingService {
  // Gestion des segments de ciblage - Version simplifiée utilisant les tables existantes
  static async createTargetingSegment(segment: Omit<EnhancedTargetingSegment, 'id' | 'created_at' | 'updated_at' | 'estimated_reach'>) {
    // Pour l'instant, on utilise une approche simplifiée
    console.log('Creating targeting segment:', segment);
    return { id: Date.now().toString(), ...segment, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), estimated_reach: 1000 };
  }

  static async getTargetingSegments(includeInactive = false) {
    // Simulation de données pour l'instant
    const mockSegments: EnhancedTargetingSegment[] = [
      {
        id: '1',
        name: 'Clients Premium Paris',
        description: 'Clients premium basés à Paris',
        criteria: {
          cities: ['Paris'],
          user_types: ['client'],
          subscription_tiers: ['premium']
        },
        estimated_reach: 2500,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Réparateurs Lyon',
        description: 'Réparateurs actifs à Lyon',
        criteria: {
          cities: ['Lyon'],
          user_types: ['repairer']
        },
        estimated_reach: 150,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    return includeInactive ? mockSegments : mockSegments.filter(s => s.is_active);
  }

  static async updateTargetingSegment(id: string, updates: Partial<EnhancedTargetingSegment>) {
    console.log('Updating targeting segment:', id, updates);
    return { id, ...updates, updated_at: new Date().toISOString() };
  }

  // Gestion des zones géographiques - Version simplifiée
  static async createGeoZone(zone: Omit<GeoTargetingZone, 'id' | 'created_at'>) {
    console.log('Creating geo zone:', zone);
    return { id: Date.now().toString(), ...zone, created_at: new Date().toISOString() };
  }

  static async getGeoZones() {
    // Simulation de données
    const mockZones: GeoTargetingZone[] = [
      {
        id: '1',
        name: 'Centre-ville Paris',
        type: 'radius',
        coordinates: {
          lat: 48.8566,
          lng: 2.3522,
          radius: 5
        },
        metadata: {},
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Lyon Métropole',
        type: 'city',
        metadata: { city: 'Lyon' },
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];

    return mockZones;
  }

  // Tracking comportemental - Version simplifiée
  static async trackUserBehavior(event: Omit<UserBehaviorEvent, 'id' | 'created_at'>) {
    try {
      // Pour l'instant, on log simplement les événements
      console.log('Tracking user behavior:', event);
      
      // On pourrait utiliser la table analytics_events existante
      const { error } = await supabase
        .from('analytics_events')
        .insert([{
          user_id: event.user_id,
          event_type: event.event_type,
          event_data: event.event_data
        }]);

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
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transformer les données analytics en format UserBehaviorEvent
      return (data || []).map(event => ({
        id: event.id,
        user_id: event.user_id,
        session_id: null,
        event_type: event.event_type,
        event_data: event.event_data || {},
        page_url: null,
        referrer: null,
        user_agent: null,
        ip_address: null,
        created_at: event.created_at
      })) as UserBehaviorEvent[];
    } catch (error) {
      console.error('Error fetching user behavior profile:', error);
      return [];
    }
  }

  // Personnalisation des messages - Version simplifiée
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

        // Récupérer les événements récents depuis analytics_events
        const { data: analytics } = await supabase
          .from('analytics_events')
          .select('event_type, event_data, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (analytics) {
          personalizationData.interaction_history = analytics.map(event => ({
            type: event.event_type,
            target: event.event_data?.target || 'unknown',
            timestamp: event.created_at
          }));
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
