
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
      return data as RepairerProfile;
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
