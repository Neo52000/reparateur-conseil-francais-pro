import { useCallback, useMemo } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from './types';

/**
 * Hook optimisé pour les permissions d'authentification
 * DEPRECATED: Use useAuthRoles hook instead which reads from user_roles table
 * This hook no longer checks roles - it only checks if user is authenticated
 */
export const useOptimizedPermissions = (user: User | null, profile: Profile | null) => {
  return useMemo(() => {
    // SECURITY: Role checks moved to useAuthRoles which reads from user_roles table
    // This hook only provides basic auth status
    return {
      isAdmin: false, // Must check via useAuthRoles
      canAccessClient: !!user,
      canAccessRepairer: false, // Must check via useAuthRoles
      canAccessAdmin: false // Must check via useAuthRoles
    };
  }, [user, profile?.email]);
};

/**
 * Hook pour la création de profils temporaires optimisé
 * Note: Profiles no longer have role field
 */
export const useProfileCreation = () => {
  return useCallback((userId: string, userMetadata?: any): Profile => {
    return {
      id: userId,
      email: userMetadata?.email || '',
      first_name: userMetadata?.first_name || 'Utilisateur',
      last_name: userMetadata?.last_name || ''
      // Note: role removed - managed in user_roles table
    };
  }, []);
};

/**
 * Hook pour gérer les timeouts d'authentification
 */
export const useAuthTimeouts = () => {
  return useCallback((callback: () => void, delay: number = 100) => {
    return setTimeout(callback, delay);
  }, []);
};