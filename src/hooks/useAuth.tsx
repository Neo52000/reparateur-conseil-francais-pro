
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { profileService } from '@/services/profileService';
import type { Profile } from './auth/types';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Calcul des permissions de façon optimisée
  const permissions = React.useMemo(() => {
    const isAdminEmail = profile?.email === 'admin@repairhub.fr';
    const hasAdminRole = profile?.role === 'admin';
    const isAdmin = isAdminEmail || hasAdminRole;
    
    return {
      isAdmin,
      canAccessClient: !!user,
      canAccessRepairer: profile?.role === 'repairer' || isAdmin,
      canAccessAdmin: isAdmin
    };
  }, [user, profile]);

  // Fonction pour charger le profil
  const loadProfile = useCallback(async (userId: string) => {
    try {
      const profileData = await profileService.fetchProfile(userId);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
      // Créer un profil temporaire
      setProfile({
        id: userId,
        email: user?.email || '',
        first_name: user?.user_metadata?.first_name || 'Utilisateur',
        last_name: user?.user_metadata?.last_name || '',
        role: 'user'
      });
    }
  }, [user]);

  // Effet pour gérer l'authentification
  useEffect(() => {
    let mounted = true;

    const handleAuthChange = async (event: any, session: Session | null) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        setSession(session);
        await loadProfile(session.user.id);
      } else {
        setUser(null);
        setSession(null);
        setProfile(null);
      }
      
      if (mounted) {
        setLoading(false);
      }
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
      subscription.unsubscribe();
    };
  }, [loadProfile]);

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
      await loadProfile(user.id);
    }
  }, [user?.id, loadProfile]);

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
