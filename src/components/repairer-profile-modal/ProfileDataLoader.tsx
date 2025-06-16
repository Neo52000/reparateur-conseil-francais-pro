
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
        console.log('📭 No profile found for ID:', id);
        return null;
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
