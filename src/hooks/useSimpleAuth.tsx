import * as React from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Types simplifiés
interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
}

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

export const SimpleAuthProvider = ({ children }: { children: React.ReactNode }) => {
  // États simplifiés sans complex hooks
  const [authState, setAuthState] = React.useState({
    user: null as User | null,
    session: null as Session | null,
    profile: null as Profile | null,
    loading: true
  });

  // Fonction utilitaire pour créer un profil temporaire
  const createTempProfile = (session: Session): Profile => ({
    id: session.user.id,
    email: session.user.email!,
    first_name: session.user.user_metadata?.first_name || 'Utilisateur',
    last_name: session.user.user_metadata?.last_name || '',
    role: session.user.user_metadata?.role || 'client'
  });

  // Propriétés calculées
  const isAdmin = authState.profile?.email === 'admin@repairhub.fr' || authState.profile?.role === 'admin';
  const canAccessClient = !!authState.user;
  const canAccessRepairer = authState.profile?.role === 'repairer' || isAdmin;
  const canAccessAdmin = isAdmin;

  // Actions d'authentification simplifiées
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };
      
      const profile = data.session ? createTempProfile(data.session) : null;
      setAuthState({
        user: data.session?.user || null,
        session: data.session,
        profile,
        loading: false
      });
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signInAdmin = signIn; // Même logique pour l'admin

  const signUp = async (email: string, password: string, userData: any = {}) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setAuthState({
        user: null,
        session: null,
        profile: null,
        loading: false
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const refreshProfile = async () => {
    // Fonction vide pour la compatibilité
  };

  // Écouter les changements d'authentification
  React.useEffect(() => {
    // Vérifier la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      const profile = session ? createTempProfile(session) : null;
      setAuthState({
        user: session?.user || null,
        session,
        profile,
        loading: false
      });
    });

    // Écouter les changements
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const profile = session ? createTempProfile(session) : null;
      setAuthState({
        user: session?.user || null,
        session,
        profile,
        loading: false
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const contextValue: AuthContextType = {
    user: authState.user,
    session: authState.session,
    profile: authState.profile,
    loading: authState.loading,
    isAdmin,
    canAccessClient,
    canAccessRepairer,
    canAccessAdmin,
    signIn,
    signInAdmin,
    signUp,
    signOut,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SimpleAuthProvider');
  }
  return context;
};