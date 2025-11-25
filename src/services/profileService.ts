
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/hooks/auth/types';

export const profileService = {
  async fetchProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Si l'erreur est "not found", on retourne null
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('ProfileService fetch error:', error);
      return null;
    }
  },

  async createProfile(userId: string, userData: Partial<Profile>): Promise<Profile> {
    try {
      const profileData = {
        id: userId,
        email: userData.email!,
        first_name: userData.first_name || 'Utilisateur',
        last_name: userData.last_name || ''
        // Note: role removed - managed in user_roles table
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('ProfileService create error:', error);
      throw error;
    }
  },

  async upsertProfile(userId: string, userData: Partial<Profile>): Promise<Profile> {
    try {
      const profileData = {
        id: userId,
        email: userData.email!,
        first_name: userData.first_name || 'Utilisateur',
        last_name: userData.last_name || ''
        // Note: role removed - managed in user_roles table
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('ProfileService upsert error:', error);
      throw error;
    }
  }
};
