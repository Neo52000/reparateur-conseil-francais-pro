
import { useState, useEffect } from 'react';
import { RepairerProfile } from '@/types/repairerProfile';
import { ProfileDataRepository } from '@/services/profileDataRepository';
import { BasicProfileCreator } from '@/services/basicProfileCreator';

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
    try {
      // Essayer de récupérer le profil depuis repairer_profiles
      const profileData = await ProfileDataRepository.fetchProfile(id);
      
      if (profileData) {
        return profileData;
      }

      // Si pas trouvé, essayer de créer un profil basique
      return await BasicProfileCreator.createBasicProfileFromRepairer(id);
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
