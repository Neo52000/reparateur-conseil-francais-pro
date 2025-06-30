
import { supabase } from '@/integrations/supabase/client';
import type { UserSignUpData } from '@/types/auth';

export const authService = {
  async signIn(email: string, password: string) {
    console.log('🔐 Attempting sign in for:', email);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Sign in error:', error);
      } else {
        console.log('✅ Sign in successful');
      }
      
      return { error };
    } catch (error) {
      console.error('💥 Exception during sign in:', error);
      return { error };
    }
  },

  async signUp(email: string, password: string, userData?: UserSignUpData) {
    console.log('📝 Attempting sign up for:', email);
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData
      }
    });
    return { error };
  },

  async signOut() {
    console.log('👋 Signing out...');
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        
        // Traiter les erreurs de session comme des succès partiels
        if (error.message?.includes('session_not_found') || error.message?.includes('Session not found')) {
          console.log('⚠️ Session already expired, treating as successful logout');
          return { error: null };
        }
        
        return { error };
      }
      
      console.log('✅ Sign out successful');
      return { error: null };
    } catch (error) {
      console.error('💥 Exception during sign out:', error);
      return { error };
    }
  },

  async getSession() {
    try {
      console.log('🔍 Checking existing session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error getting session:', error);
        return { session: null, error };
      }
      
      console.log('🔄 Initial session check:', { sessionExists: !!session, userEmail: session?.user?.email });
      return { session, error: null };
    } catch (error) {
      console.error('💥 Exception during session check:', error);
      return { session: null, error };
    }
  }
};
