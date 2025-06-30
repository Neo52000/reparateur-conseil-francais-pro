
import { supabase } from '@/integrations/supabase/client';
import type { UserSignUpData } from '@/types/auth';

export const authService = {
  async signIn(email: string, password: string) {
    console.log('🔐 AuthService: Attempting sign in for:', email);
    
    try {
      // Vérifier d'abord l'état de la session actuelle
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      console.log('📊 Current session before login:', {
        hasSession: !!currentSession,
        userEmail: currentSession?.user?.email
      });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ AuthService: Sign in error:', error);
        return { error };
      }
      
      console.log('✅ AuthService: Sign in successful', {
        hasUser: !!data.user,
        hasSession: !!data.session,
        userEmail: data.user?.email,
        userId: data.user?.id
      });
      
      return { error: null, data };
    } catch (error) {
      console.error('💥 AuthService: Exception during sign in:', error);
      return { error };
    }
  },

  async signUp(email: string, password: string, userData?: UserSignUpData) {
    console.log('📝 AuthService: Attempting sign up for:', email);
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
    console.log('👋 AuthService: Signing out...');
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ AuthService: Sign out error:', error);
        
        // Traiter les erreurs de session comme des succès partiels
        if (error.message?.includes('session_not_found') || error.message?.includes('Session not found')) {
          console.log('⚠️ AuthService: Session already expired, treating as successful logout');
          return { error: null };
        }
        
        return { error };
      }
      
      console.log('✅ AuthService: Sign out successful');
      return { error: null };
    } catch (error) {
      console.error('💥 AuthService: Exception during sign out:', error);
      return { error };
    }
  },

  async getSession() {
    try {
      console.log('🔍 AuthService: Checking existing session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ AuthService: Error getting session:', error);
        return { session: null, error };
      }
      
      console.log('🔄 AuthService: Session check result:', { 
        sessionExists: !!session, 
        userEmail: session?.user?.email,
        userId: session?.user?.id,
        sessionValid: session ? 'valid' : 'null'
      });
      
      return { session, error: null };
    } catch (error) {
      console.error('💥 AuthService: Exception during session check:', error);
      return { session: null, error };
    }
  }
};
