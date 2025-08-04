
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from './auth/types';
import { useLocalStorage } from './useLocalStorage';
import { useAuthStore } from '@/stores/authStore';

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
  // Synchronisation avec Zustand store
  const authStore = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Cache local pour les profils avec localStorage
  const [cachedProfiles, setCachedProfiles] = useLocalStorage<Record<string, Profile>>('auth_profiles_cache', {});

  // Fonction optimisée pour charger le profil avec cache
  const fetchProfile = useCallback(async (userId: string, userMetadata?: any) => {
    try {
      // Vérifier d'abord le cache local
      const cachedProfile = cachedProfiles[userId];
      if (cachedProfile) {
        console.log('🎯 Profil trouvé en cache pour:', userId);
        return cachedProfile;
      }

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
        // Mise en cache du profil
        setCachedProfiles(prev => ({ ...prev, [userId]: data }));
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
  }, [cachedProfiles, setCachedProfiles]);

  // Calcul des permissions optimisé avec fallback pour admin@repairhub.fr
  const permissions = useMemo(() => {
    const isAdminEmail = profile?.email === 'admin@repairhub.fr' || profile?.email === 'reine.elie@gmail.com';
    const hasAdminRole = profile?.role === 'admin';
    const isAdmin = isAdminEmail || hasAdminRole;
    
    console.log('🔐 Auth permissions calculated:', {
      userEmail: profile?.email,
      userRole: profile?.role,
      isAdminEmail,
      hasAdminRole,
      isAdmin,
      hasUser: !!user
    });
    
    return {
      isAdmin,
      canAccessClient: !!user,
      canAccessRepairer: profile?.role === 'repairer' || isAdmin,
      canAccessAdmin: isAdmin
    };
  }, [user, profile]);

  // Effet pour gérer l'authentification
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const handleAuthChange = async (event: any, session: Session | null) => {
      console.log('🔄 AuthProvider: Auth state changed', { event, hasSession: !!session, userEmail: session?.user?.email });
      
      if (!mounted) {
        console.log('⚠️ AuthProvider: Component unmounted, skipping');
        return;
      }

      if (session?.user) {
        console.log('👤 AuthProvider: User found, setting state');
        setUser(session.user);
        setSession(session);
        
        // Synchroniser avec Zustand
        authStore.setAuth(session, null);
        
        try {
          const profileData = await fetchProfile(session.user.id, session.user.user_metadata);
          if (mounted) {
            setProfile(profileData);
            authStore.setProfile(profileData);
            console.log('📝 AuthProvider: Profile set:', profileData);
          }
        } catch (error) {
          console.error('❌ AuthProvider: Profile fetch error:', error);
          // Créer un profil fallback
          const fallbackProfile = {
            id: session.user.id,
            email: session.user.email || '',
            first_name: session.user.user_metadata?.first_name || 'Utilisateur',
            last_name: session.user.user_metadata?.last_name || '',
            role: session.user.user_metadata?.role || 'user'
          };
          if (mounted) {
            setProfile(fallbackProfile);
          }
        }
      } else {
        console.log('❌ AuthProvider: No session, clearing state');
        setUser(null);
        setSession(null);
        setProfile(null);
        authStore.clearAuth();
      }
      
      // Arrêter le loading
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
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
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
      // Mettre à jour le cache
      setCachedProfiles(prev => ({ ...prev, [user.id]: profileData }));
    }
  }, [user?.id, user?.user_metadata, fetchProfile, setCachedProfiles]);

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
