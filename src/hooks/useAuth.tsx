
import { useAuthState } from './auth/authStateManager';
import { useAuthPermissions } from './auth/authPermissions';
import { useAuthActions } from './auth/useAuthActions';
import { useAuthSession } from './auth/useAuthSession';
import type { UseAuthReturn } from './auth/types';

/**
 * Hook principal d'authentification
 * 
 * Fournit une interface unifiée pour :
 * - La gestion de l'état d'authentification
 * - Les actions de connexion/déconnexion
 * - Les permissions utilisateur
 * - La gestion de session
 * 
 * @returns {UseAuthReturn} Objet contenant l'état et les méthodes d'authentification
 */
export const useAuth = (): UseAuthReturn => {
  // Gestion de l'état d'authentification
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

  // Calcul des permissions basées sur le profil
  const permissions = useAuthPermissions(profile);

  // Actions d'authentification (login, logout, etc.)
  const authActions = useAuthActions(setLoading, setProfile, clearState, session);

  // Gestion de la session et des changements d'état
  useAuthSession(loading, setLoading, updateAuthState, clearState);

  // Logging pour le debug
  console.log('🔐 Current auth state:', { 
    hasUser: !!user, 
    hasProfile: !!profile, 
    profileRole: profile?.role,
    userEmail: user?.email,
    ...permissions,
    loading 
  });

  return {
    // État de base
    user,
    session,
    profile,
    loading,
    
    // Actions
    ...authActions,
    
    // Permissions
    ...permissions
  };
};
