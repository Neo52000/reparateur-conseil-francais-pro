
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode, FC } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from './auth/types';
import { useAuthRoles } from './auth/useAuthRoles';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  canAccessClient: boolean;
  canAccessRepairer: boolean;
  canAccessAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInAdmin: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  console.log('🔐 AuthProvider: Initializing...');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction optimisée pour charger le profil avec cache
  const fetchProfile = useCallback(async (userId: string, userMetadata?: any) => {
    try {
      console.log('🔄 Chargement du profil depuis la base pour:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        throw error;
      }

      if (data) {
        return data;
      }

      // Créer un profil temporaire si non trouvé
      const tempProfile = {
        id: userId,
        email: userMetadata?.email || '',
        first_name: userMetadata?.first_name || 'Utilisateur',
        last_name: userMetadata?.last_name || '',
        role: userMetadata?.role || 'user'
      };
      
      return tempProfile;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return {
        id: userId,
        email: userMetadata?.email || '',
        first_name: userMetadata?.first_name || 'Utilisateur',
        last_name: userMetadata?.last_name || '',
        role: 'user'
      };
    }
  }, []); // Pas de dépendances pour éviter les boucles

  // SECURITY: Use server-side roles from user_roles table via useAuthRoles hook
  const { roles, loading: rolesLoading, isAdmin, canAccessRepairer, canAccessClient, canAccessAdmin } = useAuthRoles(user?.id);

  // Calcul des permissions optimisé
  const permissions = useMemo(() => {
    return {
      isAdmin,
      canAccessClient,
      canAccessRepairer,
      canAccessAdmin
    };
  }, [isAdmin, canAccessClient, canAccessRepairer, canAccessAdmin]);

  // Effet pour gérer l'authentification
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const handleAuthChange = async (event: any, session: Session | null) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        setSession(session);
        
        // Différer le chargement du profil pour éviter les boucles
        setTimeout(async () => {
          if (mounted) {
            const profileData = await fetchProfile(session.user.id, session.user.user_metadata);
            if (mounted) {
              setProfile(profileData);
            }
          }
        }, 0);
      } else {
        setUser(null);
        setSession(null);
        setProfile(null);
      }
      
      // Timeout de sécurité pour le loading
      timeoutId = setTimeout(() => {
        if (mounted) {
          setLoading(false);
        }
      }, 100);
    };

    // Écouter les changements d'état
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Obtenir la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        handleAuthChange('initial', session);
      }
    });

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []); // Pas de dépendances pour éviter les boucles

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setLoading(false);
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      setLoading(false);
      return { error };
    }
  }, []);

  const signInAdmin = useCallback(async (email: string, password: string) => {
    const result = await signIn(email, password);
    // Vérifier les permissions admin après connexion
    return result;
  }, [signIn]);

  const signUp = useCallback(async (email: string, password: string, userData?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) {
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setUser(null);
      setSession(null);
      setProfile(null);
      await supabase.auth.signOut();
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      const profileData = await fetchProfile(user.id, user.user_metadata);
      setProfile(profileData);
    }
  }, [user?.id, user?.user_metadata, fetchProfile]);

  const value = {
    user,
    session,
    profile,
    loading,
    ...permissions,
    signIn,
    signInAdmin,
    signUp,
    signOut,
    refreshProfile
  };

  console.log('🔐 AuthProvider: Rendering with value:', { 
    hasUser: !!user, 
    hasProfile: !!profile, 
    loading, 
    permissions 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
