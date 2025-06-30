
import { useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { authService } from '@/services/authService';
import { useAuthState } from './auth/authStateManager';
import { useAuthPermissions } from './auth/authPermissions';
import { fetchOrCreateProfile } from './auth/authHelpers';
import type { UserSignUpData, UseAuthReturn } from './auth/types';

export const useAuth = (): UseAuthReturn => {
  const {
    user,
    session,
    profile,
    loading,
    setLoading,
    setProfile,
    clearState,
    updateAuthState
  } = useAuthState();

  const permissions = useAuthPermissions(profile);

  useEffect(() => {
    console.log('🔧 Setting up auth listener');
    let mounted = true;
    
    const handleAuthChange = async (event: string, session: Session | null) => {
      console.log('🔄 Auth state changed:', { event, userEmail: session?.user?.email, sessionExists: !!session });
      
      if (!mounted) {
        console.log('⚠️ Component unmounted, skipping auth state change');
        return;
      }
      
      if (session?.user) {
        try {
          console.log('👤 User session found, fetching profile...');
          
          // Timeout réduit et fallback plus rapide
          const profilePromise = fetchOrCreateProfile(session);
          const timeoutPromise = new Promise<null>((resolve) => {
            setTimeout(() => {
              console.log('⏰ Profile fetch timeout, using session data only');
              resolve(null);
            }, 3000); // Réduit à 3 secondes
          });
          
          const profileData = await Promise.race([profilePromise, timeoutPromise]);
          
          if (mounted) {
            // Si pas de profil, créer un profil temporaire basé sur la session
            const finalProfile = profileData || {
              id: session.user.id,
              email: session.user.email!,
              first_name: session.user.user_metadata?.first_name || 'Utilisateur',
              last_name: session.user.user_metadata?.last_name || '',
              role: session.user.email === 'demo@demo.fr' ? 'repairer' : 
                    session.user.email === 'reine.elie@gmail.com' ? 'admin' : 'user'
            };
            
            updateAuthState(session, finalProfile);
            console.log('📝 Auth state updated with profile:', finalProfile);
          }
        } catch (error) {
          console.error('💥 Error handling auth change:', error);
          if (mounted) {
            // En cas d'erreur, utiliser un profil de base
            const fallbackProfile = {
              id: session.user.id,
              email: session.user.email!,
              first_name: 'Utilisateur',
              last_name: '',
              role: session.user.email === 'demo@demo.fr' ? 'repairer' : 
                    session.user.email === 'reine.elie@gmail.com' ? 'admin' : 'user'
            };
            updateAuthState(session, fallbackProfile);
          }
        }
      } else {
        console.log('❌ No user session, clearing state');
        if (mounted) {
          clearState();
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Check existing session
    const checkSession = async () => {
      try {
        console.log('🔍 Checking existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        if (mounted) {
          await handleAuthChange('INITIAL_SESSION', session);
        }
      } catch (error) {
        console.error('💥 Exception during session check:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    // Timeout de sécurité réduit
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.log('⏰ Auth check timeout, forcing loading to false');
        setLoading(false);
      }
    }, 5000); // Réduit à 5 secondes

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  // Fonction pour forcer la récupération du profil
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

  // Nouvelle fonction de connexion spécifique pour les admins
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

  const signUp = async (email: string, password: string, userData?: UserSignUpData) => {
    return await authService.signUp(email, password, userData);
  };

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
          return { error: null }; // Traiter comme un succès car l'utilisateur n'est déjà plus connecté
        }
        
        // Pour d'autres erreurs, on considère quand même la déconnexion comme réussie localement
        console.log('⚠️ Supabase logout failed but local state cleared');
        return { error: null };
      }
      
      console.log('✅ Sign out completed successfully');
      return { error: null };
      
    } catch (error) {
      console.error('💥 Exception during sign out:', error);
      // Même en cas d'exception, l'état local est déjà nettoyé
      return { error: null };
    }
  };

  console.log('🔐 Current auth state:', { 
    hasUser: !!user, 
    hasProfile: !!profile, 
    profileRole: profile?.role,
    userEmail: user?.email,
    ...permissions,
    loading 
  });

  return {
    user,
    session,
    profile,
    loading,
    signIn,
    signInAdmin,
    signUp,
    signOut,
    refreshProfile,
    ...permissions
  };
};
