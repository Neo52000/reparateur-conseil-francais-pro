
import { Profile } from './types';

/**
 * DEPRECATED: Do not use client-side role checks for authorization
 * Use useAuthRoles hook instead which fetches from server-side user_roles table
 * 
 * This hook is kept for backward compatibility but should not be used for security decisions
 */
export const useAuthPermissions = (profile: Profile | null) => {
  console.warn('⚠️ useAuthPermissions is deprecated - use useAuthRoles for secure role checking');
  
  // Return minimal permissions - real checks must be done server-side
  return {
    isAdmin: false, // Always verify server-side
    canAccessClient: !!profile,
    canAccessRepairer: false, // Always verify server-side
    canAccessAdmin: false // Always verify server-side
  };
};
