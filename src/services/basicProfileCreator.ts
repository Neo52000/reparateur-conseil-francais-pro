
import { supabase } from '@/integrations/supabase/client';
import { RepairerProfile } from '@/types/repairerProfile';

/**
 * Service pour créer des profils basiques à partir des données de la table repairers
 */
export class BasicProfileCreator {
  /**
   * Crée un profil basique à partir des données de la table repairers
   */
  static async createBasicProfileFromRepairer(repairerId: string): Promise<RepairerProfile | null> {
    console.log('🔧 Creating basic profile from repairer data for ID:', repairerId);
    
    try {
      const { data: repairerData, error } = await supabase
        .from('repairers')
        .select('*')
        .eq('id', repairerId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching repairer data:', error);
        return null;
      }

      if (!repairerData) {
        console.log('❌ No repairer found with ID:', repairerId);
        return null;
      }

      console.log('📋 Found repairer data:', repairerData);

      // Helper function to safely cast opening_hours
      const safeOpeningHours = (hours: any) => {
        if (!hours || typeof hours !== 'object') return undefined;
        return hours as RepairerProfile['opening_hours'];
      };

      // Créer un profil basique basé sur les données du réparateur
      const basicProfile: RepairerProfile = {
        id: repairerData.id,
        repairer_id: repairerData.id,
        business_name: repairerData.name,
        siret_number: null,
        description: null,
        address: repairerData.address || '',
        city: repairerData.city,
        postal_code: repairerData.postal_code || '',
        phone: repairerData.phone || '',
        email: repairerData.email || '',
        website: repairerData.website || null,
        facebook_url: null,
        instagram_url: null,
        linkedin_url: null,
        twitter_url: null,
        has_qualirepar_label: false,
        repair_types: repairerData.specialties || [],
        profile_image_url: null,
        geo_lat: repairerData.lat ? Number(repairerData.lat) : undefined,
        geo_lng: repairerData.lng ? Number(repairerData.lng) : undefined,
        opening_hours: safeOpeningHours(repairerData.opening_hours),
        services_offered: repairerData.services || [],
        certifications: [],
        years_experience: undefined,
        languages_spoken: [],
        payment_methods: [],
        warranty_duration: undefined,
        response_time: repairerData.response_time || undefined,
        emergency_service: false,
        home_service: false,
        pickup_service: false,
        pricing_info: repairerData.price_range ? {
          free_quote: true
        } : undefined,
        created_at: repairerData.created_at,
        updated_at: repairerData.updated_at
      };

      console.log('✅ Created basic profile:', basicProfile);
      return basicProfile;
    } catch (error) {
      console.error('❌ Error creating basic profile:', error);
      return null;
    }
  }
}
