
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/hooks/auth/types';

export const profileService = {
  async fetchProfile(userId: string): Promise<Profile | null> {
    console.log('🔍 ProfileService: Fetching profile for user:', userId);
    
    try {
      // Augmenter le timeout et ajouter une requête plus robuste
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ ProfileService: Error fetching profile:', error);
        // Si l'erreur est "not found", on retourne null au lieu de lancer une erreur
        if (error.code === 'PGRST116') {
          console.log('ℹ️ ProfileService: Profile not found, will create one');
          return null;
        }
        throw error;
      }

      console.log('✅ ProfileService: Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('💥 ProfileService: Exception during fetch:', error);
      return null;
    }
  },

  async createProfile(userId: string, userData: Partial<Profile>): Promise<Profile> {
    console.log('📝 ProfileService: Creating profile for user:', userId, userData);
    
    try {
      const profileData = {
        id: userId,
        email: userData.email!,
        first_name: userData.first_name || 'Utilisateur',
        last_name: userData.last_name || '',
        role: userData.role || 'user'
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('❌ ProfileService: Error creating profile:', error);
        throw error;
      }

      console.log('✅ ProfileService: Profile created successfully:', data);
      return data;
    } catch (error) {
      console.error('💥 ProfileService: Exception during create:', error);
      throw error;
    }
  },

  async upsertProfile(userId: string, userData: Partial<Profile>): Promise<Profile> {
    console.log('🔄 ProfileService: Upserting profile for user:', userId);
    
    try {
      const profileData = {
        id: userId,
        email: userData.email!,
        first_name: userData.first_name || 'Utilisateur',
        last_name: userData.last_name || '',
        role: userData.role || 'user'
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('❌ ProfileService: Error upserting profile:', error);
        throw error;
      }

      console.log('✅ ProfileService: Profile upserted successfully:', data);
      return data;
    } catch (error) {
      console.error('💥 ProfileService: Exception during upsert:', error);
      throw error;
    }
  }
};
