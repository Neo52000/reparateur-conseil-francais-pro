
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RepairerProfile } from '@/types/repairerProfile';
import { RepairerProfileMapper } from '@/services/repairerProfileMapper';

/**
 * Hook pour charger les données d'un profil réparateur
 * Gère le cache et le rafraîchissement des données
 */
export const useProfileData = (repairerId: string, isOpen: boolean) => {
  const [profile, setProfile] = useState<RepairerProfile | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Crée un profil basique à partir des données de la table repairers
   */
  const createBasicProfileFromRepairer = async (repairerId: string): Promise<RepairerProfile | null> => {
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
        opening_hours: repairerData.opening_hours || undefined,
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
  };

  /**
   * Charge les données du profil depuis Supabase
   */
  const fetchProfile = async (id: string): Promise<RepairerProfile | null> => {
    console.log('🔄 Fetching profile data for ID:', id);
    
    if (id.startsWith('mock-')) {
      console.log('🎭 Loading mock profile');
      const { getMockProfile } = await import('@/services/mockRepairerProfiles');
      return getMockProfile(id);
    }

    try {
      // Essayer d'abord de chercher par ID dans repairer_profiles
      let { data: profileData, error } = await supabase
        .from('repairer_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      // Si pas trouvé par ID, essayer par user_id
      if (!profileData && !error) {
        console.log('🔍 Profile not found by ID, trying by user_id...');
        const result = await supabase
          .from('repairer_profiles')
          .select('*')
          .eq('user_id', id)
          .maybeSingle();
        
        profileData = result.data;
        error = result.error;
      }

      if (error) {
        console.error('❌ Error fetching profile:', error);
        throw error;
      }

      if (!profileData) {
        console.log('📭 No profile found in repairer_profiles, trying to create from repairers table...');
        // Essayer de créer un profil basique à partir de la table repairers
        return await createBasicProfileFromRepairer(id);
      }

      console.log('📥 Raw profile data from Supabase:', profileData);
      
      // Mapper les données vers l'interface RepairerProfile
      const mappedProfile = RepairerProfileMapper.mapDatabaseToProfile(profileData);
      
      console.log('✅ Mapped profile data:', mappedProfile);
      return mappedProfile;

    } catch (error: any) {
      console.error('❌ Error in fetchProfile:', error);
      throw error;
    }
  };

  /**
   * Rafraîchit les données du profil actuel
   */
  const refreshProfile = async () => {
    if (!repairerId) return;
    
    try {
      setLoading(true);
      const freshProfile = await fetchProfile(repairerId);
      setProfile(freshProfile);
    } catch (error) {
      console.error('❌ Error refreshing profile:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Charge les données au montage et quand les paramètres changent
   */
  useEffect(() => {
    if (!isOpen || !repairerId) {
      setProfile(null);
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        const profileData = await fetchProfile(repairerId);
        setProfile(profileData);
      } catch (error) {
        console.error('❌ Error loading profile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [repairerId, isOpen]);

  return {
    profile,
    loading,
    fetchProfile,
    refreshProfile
  };
};
