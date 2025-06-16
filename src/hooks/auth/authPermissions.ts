
import { Profile } from './types';

export const useAuthPermissions = (profile: Profile | null) => {
  const isAdmin = profile?.role === 'admin';
  const canAccessClient = profile?.role === 'client' || profile?.role === 'user' || profile?.role === 'admin';
  const canAccessRepairer = profile?.role === 'repairer' || profile?.role === 'admin';
  const canAccessAdmin = profile?.role === 'admin';

  return {
    isAdmin,
    canAccessClient,
    canAccessRepairer,
    canAccessAdmin
  };
};
