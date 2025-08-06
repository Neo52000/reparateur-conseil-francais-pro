import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';

export const useProfileRefresh = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  
  const refreshProfile = useCallback(async (user: User | null) => {
    if (!user?.id) {
      setProfile(null);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (!error && data) {
        setProfile(data);
      } else {
        console.warn('Profile not found or error:', error);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setProfile(null);
    }
  }, []);

  return {
    profile,
    refreshProfile,
    setProfile
  };
};