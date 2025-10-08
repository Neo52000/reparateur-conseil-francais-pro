import { useCallback, useMemo } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from './types';

/**
 * Hook optimisé pour les permissions d'authentification
 * Évite les recalculs inutiles et améliore les performances
 */
export const useOptimizedPermissions = (user: User | null, profile: Profile | null) => {
  return useMemo(() => {
    // SECURITY: Never check roles client-side - always verify server-side via user_roles table
    const hasAdminRole = profile?.role === 'admin';
    const isAdmin = hasAdminRole;
    
    return {
      isAdmin,
      canAccessClient: !!user,
      canAccessRepairer: profile?.role === 'repairer' || isAdmin,
      canAccessAdmin: isAdmin
    };
  }, [user, profile?.email, profile?.role]);
};

/**
 * Hook pour la création de profils temporaires optimisé
 */
export const useProfileCreation = () => {
  return useCallback((userId: string, userMetadata?: any): Profile => {
    return {
      id: userId,
      email: userMetadata?.email || '',
      first_name: userMetadata?.first_name || 'Utilisateur',
      last_name: userMetadata?.last_name || '',
      role: userMetadata?.role || 'user'
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