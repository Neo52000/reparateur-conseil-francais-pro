
import { useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { fetchOrCreateProfile } from './authHelpers';

/**
 * Hook pour gérer la session d'authentification et les changements d'état
 */
export const useAuthSession = (
  loading: boolean,
  setLoading: (loading: boolean) => void,
  updateAuthState: (session: Session | null, profile: any) => void,
  clearState: () => void
) => {
  useEffect(() => {
    console.log('🔧 Setting up auth listener');
    let mounted = true;
    
    /**
     * Gestionnaire des changements d'état d'authentification
     */
    const handleAuthChange = async (event: string, session: Session | null) => {
      console.log('🔄 Auth state changed:', { event, userEmail: session?.user?.email, sessionExists: !!session });
      
      if (!mounted) {
        console.log('⚠️ Component unmounted, skipping auth state change');
        return;
      }
      
      if (session?.user) {
        await handleUserSession(session, mounted, updateAuthState);
      } else {
        console.log('❌ No user session, clearing state');
        if (mounted) {
          clearState();
        }
      }
    };

    // Configuration du listener d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Vérification de la session existante
    checkExistingSession(handleAuthChange, mounted, setLoading);

    // Timeout de sécurité
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.log('⏰ Auth check timeout, forcing loading to false');
        setLoading(false);
      }
    }, 5000);

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);
};

/**
 * Gestion d'une session utilisateur active
 */
const handleUserSession = async (
  session: Session, 
  mounted: boolean, 
  updateAuthState: (session: Session | null, profile: any) => void
) => {
  try {
    console.log('👤 User session found, fetching profile...');
    
    const profilePromise = fetchOrCreateProfile(session);
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.log('⏰ Profile fetch timeout, using session data only');
        resolve(null);
      }, 3000);
    });
    
    const profileData = await Promise.race([profilePromise, timeoutPromise]);
    
    if (mounted) {
      const finalProfile = profileData || createFallbackProfile(session);
      updateAuthState(session, finalProfile);
      console.log('📝 Auth state updated with profile:', finalProfile);
    }
  } catch (error) {
    console.error('💥 Error handling auth change:', error);
    if (mounted) {
      const fallbackProfile = createFallbackProfile(session);
      updateAuthState(session, fallbackProfile);
    }
  }
};

/**
 * Création d'un profil de fallback basé sur la session
 */
const createFallbackProfile = (session: Session) => ({
  id: session.user.id,
  email: session.user.email!,
  first_name: session.user.user_metadata?.first_name || 'Utilisateur',
  last_name: session.user.user_metadata?.last_name || '',
  role: session.user.user_metadata?.role || 'user'
});

/**
 * Vérification de la session existante au démarrage
 */
const checkExistingSession = async (
  handleAuthChange: (event: string, session: Session | null) => void,
  mounted: boolean,
  setLoading: (loading: boolean) => void
) => {
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
