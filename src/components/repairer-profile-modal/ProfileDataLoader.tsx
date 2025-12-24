
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RepairerProfile } from '@/types/repairerProfile';

export const useProfileData = (repairerId: string, isOpen: boolean) => {
  const [profile, setProfile] = useState<RepairerProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper function to safely parse opening hours (moved to top level)
  const safeParseOpeningHours = (value: any): RepairerProfile['opening_hours'] => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'object' && value !== null) {
      // Vérifier que l'objet a la bonne structure
      return value as RepairerProfile['opening_hours'];
    }
    return undefined;
  };

  const fetchProfile = async (id: string) => {
    if (!id) return null;
    
    setLoading(true);
    try {
      console.log('🔄 ProfileDataLoader - Fetching profile for ID:', id);
      
      // Essayer d'abord dans repairer_profiles par user_id
      let { data: profileData, error } = await supabase
        .from('repairer_profiles')
        .select('*')
        .eq('user_id', id)
        .maybeSingle();

      // Si pas trouvé par user_id, essayer par id
      if (!profileData && !error) {
        console.log('🔍 ProfileDataLoader - Not found by user_id, trying by id...');
        const result = await supabase
          .from('repairer_profiles')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        profileData = result.data;
        error = result.error;
      }

      // Si toujours pas trouvé dans repairer_profiles, chercher dans repairers
      if (!profileData && !error) {
        console.log('🔍 ProfileDataLoader - Not found in profiles, checking repairers table...');
        const { data: repairerData, error: repairerError } = await supabase
          .from('repairers')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (repairerError) {
          console.error('❌ ProfileDataLoader - Error fetching from repairers:', repairerError);
          return null;
        }

        if (repairerData) {
          console.log('✅ ProfileDataLoader - Found in repairers table, creating minimal profile');
          // Un profil venant de la table repairers (sans repairer_profiles associé) est NON revendiqué
          const isClaimed = false;
          
          const mappedProfile: RepairerProfile = {
            id: repairerData.id,
            repairer_id: repairerData.id,
            business_name: repairerData.name,
            email: repairerData.email || '',
            phone: repairerData.phone || '',
            address: repairerData.address || '',
            city: repairerData.city || '',
            postal_code: repairerData.postal_code || '',
            website: repairerData.website,
            description: null, // Non revendiqué = pas de description
            repair_types: repairerData.specialties || [],
            services_offered: repairerData.services || [],
            certifications: [],
            years_experience: 0,
            emergency_service: false,
            home_service: false,
            pickup_service: false,
            opening_hours: safeParseOpeningHours(repairerData.opening_hours),
            response_time: repairerData.response_time,
            warranty_duration: null,
            payment_methods: [],
            languages_spoken: [],
            pricing_info: {},
            profile_image_url: null,
            shop_photos: [],
            facebook_url: null,
            instagram_url: null,
            twitter_url: null,
            linkedin_url: null,
            whatsapp_url: null,
            telegram_url: null,
            tiktok_url: null,
            siret_number: repairerData.siret,
            has_qualirepar_label: false,
            other_services: null,
            is_claimed: isClaimed,
            created_at: repairerData.created_at,
            updated_at: repairerData.updated_at
          };
          
          return mappedProfile;
        }
      }

      if (error) {
        console.error('❌ ProfileDataLoader - Error fetching profile:', error);
        return null;
      }

      if (!profileData) {
        console.log('⚠️ ProfileDataLoader - No profile found for ID:', id);
        return null;
      }

      console.log('✅ ProfileDataLoader - Profile loaded successfully from repairer_profiles');
      
      // Helper function to safely parse JSON objects
      const safeParseJson = (value: any, fallback: any) => {
        if (value === null || value === undefined) return fallback;
        if (typeof value === 'object' && value !== null) return value;
        return fallback;
      };

      // Map the database data to RepairerProfile format
      // Un profil dans repairer_profiles avec user_id est REVENDIQUÉ
      const isClaimed = !!profileData.user_id;
      
      const mappedProfile: RepairerProfile = {
        id: profileData.id,
        repairer_id: profileData.user_id,
        business_name: profileData.business_name,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        postal_code: profileData.postal_code,
        website: profileData.website,
        description: profileData.description,
        repair_types: profileData.repair_types || [],
        services_offered: profileData.services_offered || [],
        certifications: profileData.certifications || [],
        years_experience: profileData.years_experience || 0,
        emergency_service: profileData.emergency_service || false,
        home_service: profileData.home_service || false,
        pickup_service: profileData.pickup_service || false,
        opening_hours: safeParseOpeningHours(profileData.opening_hours),
        response_time: profileData.response_time,
        warranty_duration: profileData.warranty_duration,
        payment_methods: profileData.payment_methods || [],
        languages_spoken: profileData.languages_spoken || [],
        pricing_info: safeParseJson(profileData.pricing_info, {}),
        profile_image_url: profileData.profile_image_url,
        shop_photos: profileData.shop_photos || [],
        facebook_url: profileData.facebook_url,
        instagram_url: profileData.instagram_url,
        twitter_url: profileData.twitter_url,
        linkedin_url: profileData.linkedin_url,
        whatsapp_url: profileData.whatsapp_url,
        telegram_url: profileData.telegram_url,
        tiktok_url: profileData.tiktok_url,
        siret_number: profileData.siret_number,
        has_qualirepar_label: profileData.has_qualirepar_label || false,
        other_services: profileData.other_services,
        is_claimed: isClaimed,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at
      };
      
      return mappedProfile;
    } catch (error) {
      console.error('❌ ProfileDataLoader - Exception during profile fetch:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!repairerId) return;
    
    const profileData = await fetchProfile(repairerId);
    setProfile(profileData);
  };

  useEffect(() => {
    if (isOpen && repairerId) {
      refreshProfile();
    } else if (!isOpen) {
      setProfile(null);
    }
  }, [repairerId, isOpen]);

  return {
    profile,
    loading,
    fetchProfile,
    refreshProfile
  };
};
