import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * SECURE Hook for fetching user roles from server-side user_roles table
 * NEVER trust client-side storage for role checks
 */
export const useAuthRoles = (userId: string | undefined) => {
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canAccessRepairer, setCanAccessRepairer] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!userId) {
        setRoles([]);
        setIsAdmin(false);
        setCanAccessRepairer(false);
        setLoading(false);
        return;
      }

      try {
        // Fetch roles from server-side user_roles table
        const { data, error } = await supabase
          .from('user_roles')
          .select('role, is_active')
          .eq('user_id', userId)
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching user roles:', error);
          setRoles([]);
          setIsAdmin(false);
          setCanAccessRepairer(false);
        } else {
          const userRoles = data?.map(r => r.role) || [];
          setRoles(userRoles);
          setIsAdmin(userRoles.includes('admin'));
          setCanAccessRepairer(userRoles.includes('repairer') || userRoles.includes('admin'));
        }
      } catch (error) {
        console.error('Error in role fetch:', error);
        setRoles([]);
        setIsAdmin(false);
        setCanAccessRepairer(false);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [userId]);

  return {
    roles,
    loading,
    isAdmin,
    canAccessRepairer,
    canAccessClient: !!userId, // Any authenticated user is a client
    canAccessAdmin: isAdmin
  };
};
