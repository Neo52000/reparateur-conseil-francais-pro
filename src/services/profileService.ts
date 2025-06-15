
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/types/auth';

export const profileService = {
  async fetchProfile(userId: string): Promise<Profile | null> {
    console.log('🔍 Fetching profile for user:', userId);
    
    try {
      // Vérifier d'abord la session Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('📋 Session check before profile fetch:', { 
        hasSession: !!sessionData.session, 
        sessionError: sessionError?.message 
      });

      if (sessionError) {
        console.error('❌ Session error before profile fetch:', sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }

      if (!sessionData.session) {
        console.error('❌ No active session for profile fetch');
        throw new Error('No active session');
      }

      console.log('🔎 Executing profile query for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('📊 Raw profile query result:', { data, error });

      if (error) {
        console.error('❌ Error fetching profile:', error);
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      if (!data) {
        console.log('⚠️ No profile found for user:', userId);
        return null;
      }

      console.log('✅ Profile fetched successfully:', data);
      return data as Profile;
    } catch (error) {
      console.error('💥 Exception in fetchProfile:', error);
      throw error;
    }
  },

  async createProfile(userId: string, userData: any): Promise<Profile> {
    console.log('📝 Creating profile for user:', userId, userData);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role || 'user'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating profile:', error);
        throw error;
      }

      console.log('✅ Profile created successfully:', data);
      return data as Profile;
    } catch (error) {
      console.error('💥 Exception in createProfile:', error);
      throw error;
    }
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    console.log('🔄 Updating profile for user:', userId, updates);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating profile:', error);
        throw error;
      }

      console.log('✅ Profile updated successfully:', data);
      return data as Profile;
    } catch (error) {
      console.error('💥 Exception in updateProfile:', error);
      throw error;
    }
  }
};
