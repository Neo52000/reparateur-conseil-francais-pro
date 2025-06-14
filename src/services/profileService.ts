
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/types/auth';

export const profileService = {
  async fetchProfile(userId: string): Promise<Profile | null> {
    try {
      console.log('🔍 Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('❌ Error fetching profile:', error);
        return null;
      }
      
      console.log('✅ Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('💥 Exception fetching profile:', error);
      return null;
    }
  }
};
