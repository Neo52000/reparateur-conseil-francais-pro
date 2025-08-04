import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/hooks/auth/types';

/**
 * Hook pour synchroniser l'état d'authentification avec Zustand
 * Utilisé séparément pour éviter les conflits React
 */
export const useAuthSync = (
  user: User | null, 
  session: Session | null, 
  profile: Profile | null,
  loading: boolean
) => {
  const authStore = useAuthStore();

  useEffect(() => {
    // Synchroniser avec Zustand quand l'état change
    if (session && profile) {
      authStore.setAuth(session, profile);
    } else if (!session) {
      authStore.clearAuth();
    }
  }, [session, profile, authStore]);

  useEffect(() => {
    authStore.setLoading(loading);
  }, [loading, authStore]);

  // Retourner les permissions calculées par Zustand
  return {
    isAdmin: authStore.isAdmin,
    canAccessClient: authStore.canAccessClient,
    canAccessRepairer: authStore.canAccessRepairer,
    canAccessAdmin: authStore.canAccessAdmin
  };
};