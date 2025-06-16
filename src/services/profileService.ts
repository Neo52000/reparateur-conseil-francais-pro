
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
        throw error;
      }

      if (!data) {
        console.warn('⚠️ No profile found for user:', userId);
        return null;
      }

      console.log('✅ Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('💥 Exception in fetchProfile:', error);
      return null;
    }
  },

  async createProfile(userId: string, userData: any): Promise<Profile | null> {
    try {
      console.log('📝 Creating profile for user:', userId, userData);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          ...userData
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating profile:', error);
        throw error;
      }

      console.log('✅ Profile created successfully:', data);
      return data;
    } catch (error) {
      console.error('💥 Exception in createProfile:', error);
      return null;
    }
  }
};
