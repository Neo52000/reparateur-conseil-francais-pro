
import { Profile } from './types';

/**
 * Hook pour calculer les permissions basées sur le profil utilisateur
 */
export const useAuthPermissions = (profile: Profile | null) => {
  console.log('🔍 useAuthPermissions - Calculating permissions for profile:', {
    hasProfile: !!profile,
    profileRole: profile?.role,
    profileEmail: profile?.email
  });

  // Vérification spécifique pour le compte admin
  const isAdminEmail = profile?.email === 'reine.elie@gmail.com';
  const hasAdminRole = profile?.role === 'admin';
  
  console.log('🔍 useAuthPermissions - Admin checks:', {
    isAdminEmail,
    hasAdminRole,
    profileEmail: profile?.email
  });

  const isAdmin = isAdminEmail || hasAdminRole;
  const canAccessClient = !!profile && (profile.role === 'user' || profile.role === 'admin');
  const canAccessRepairer = !!profile && (profile.role === 'repairer' || profile.role === 'admin');
  const canAccessAdmin = isAdmin;

  console.log('🔍 useAuthPermissions - Final permissions:', {
    isAdmin,
    canAccessClient,
    canAccessRepairer,
    canAccessAdmin
  });

  return {
    isAdmin,
    canAccessClient,
    canAccessRepairer,
    canAccessAdmin
  };
};
