
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RepairerProfile } from '@/types/repairerProfile';

export const useProfileData = (repairerId: string, isOpen: boolean) => {
  const [profile, setProfile] = useState<RepairerProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async (id: string) => {
    if (!id) return null;
    
    setLoading(true);
    try {
      console.log('🔄 ProfileDataLoader - Fetching profile for ID:', id);
      
      const { data, error } = await supabase
        .from('repairer_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('❌ ProfileDataLoader - Error fetching profile:', error);
        return null;
      }

      if (!data) {
        console.log('⚠️ ProfileDataLoader - No profile found for ID:', id);
        return null;
      }

      console.log('✅ ProfileDataLoader - Profile loaded successfully');
      
      // Map the database data to RepairerProfile format
      const mappedProfile: RepairerProfile = {
        id: data.id,
        repairer_id: data.user_id, // Map user_id to repairer_id
        business_name: data.business_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postal_code: data.postal_code,
        website: data.website,
        description: data.description,
        repair_types: data.repair_types || [],
        services_offered: data.services_offered || [],
        certifications: data.certifications || [],
        years_experience: data.years_experience || 0,
        emergency_service: data.emergency_service || false,
        home_service: data.home_service || false,
        pickup_service: data.pickup_service || false,
        opening_hours: data.opening_hours || {},
        response_time: data.response_time,
        warranty_duration: data.warranty_duration,
        payment_methods: data.payment_methods || [],
        languages_spoken: data.languages_spoken || [],
        pricing_info: data.pricing_info || {},
        profile_image_url: data.profile_image_url,
        shop_photos: data.shop_photos || [],
        facebook_url: data.facebook_url,
        instagram_url: data.instagram_url,
        twitter_url: data.twitter_url,
        linkedin_url: data.linkedin_url,
        whatsapp_url: data.whatsapp_url,
        telegram_url: data.telegram_url,
        tiktok_url: data.tiktok_url,
        siret_number: data.siret_number,
        has_qualirepar_label: data.has_qualirepar_label || false,
        other_services: data.other_services,
        created_at: data.created_at,
        updated_at: data.updated_at
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
