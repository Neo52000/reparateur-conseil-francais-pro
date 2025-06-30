
import { Session } from '@supabase/supabase-js';
import { authService } from '@/services/authService';
import { fetchOrCreateProfile } from './authHelpers';
import type { UserSignUpData } from './types';

/**
 * Hook pour gérer les actions d'authentification (login, logout, signup)
 */
export const useAuthActions = (
  setLoading: (loading: boolean) => void,
  setProfile: (profile: any) => void,
  clearState: () => void,
  session: Session | null
) => {
  /**
   * Connexion standard (avec redirection pour les non-admins)
   */
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    console.log('🔑 Starting sign in process for:', email);
    
    const result = await authService.signIn(email, password);
    
    if (result.error) {
      console.error('❌ Sign in failed:', result.error);
      setLoading(false);
    }
    
    return result;
  };

  /**
   * Connexion admin (sans redirection automatique)
   */
  const signInAdmin = async (email: string, password: string) => {
    setLoading(true);
    console.log('🔑 Starting admin sign in process for:', email);
    
    const result = await authService.signIn(email, password);
    
    if (result.error) {
      console.error('❌ Admin sign in failed:', result.error);
      setLoading(false);
    } else {
      console.log('✅ Admin sign in successful, staying on admin page');
    }
    
    return result;
  };

  /**
   * Inscription d'un nouvel utilisateur
   */
  const signUp = async (email: string, password: string, userData?: UserSignUpData) => {
    return await authService.signUp(email, password, userData);
  };

  /**
   * Déconnexion avec gestion des erreurs robuste
   */
  const signOut = async () => {
    console.log('👋 Starting sign out process');
    
    try {
      // Toujours nettoyer l'état local d'abord
      clearState();
      
      // Tentative de déconnexion Supabase
      const result = await authService.signOut();
      
      if (result.error) {
        console.error('❌ Supabase sign out failed:', result.error);
        
        // Gestion spécifique de l'erreur de session manquante
        if (result.error.message?.includes('session_not_found') || result.error.message?.includes('Session not found')) {
          console.log('⚠️ Session already expired, continuing with local cleanup');
          return { error: null };
        }
        
        // Pour d'autres erreurs, on considère quand même la déconnexion comme réussie localement
        console.log('⚠️ Supabase logout failed but local state cleared');
        return { error: null };
      }
      
      console.log('✅ Sign out completed successfully');
      return { error: null };
      
    } catch (error) {
      console.error('💥 Exception during sign out:', error);
      return { error: null };
    }
  };

  /**
   * Rafraîchissement manuel du profil utilisateur
   */
  const refreshProfile = async () => {
    if (session?.user) {
      console.log('🔄 Manually refreshing profile...');
      setLoading(true);
      try {
        const profileData = await fetchOrCreateProfile(session);
        setProfile(profileData);
        console.log('✅ Profile refreshed:', profileData);
      } catch (error) {
        console.error('❌ Error refreshing profile:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    signIn,
    signInAdmin,
    signUp,
    signOut,
    refreshProfile
  };
};
