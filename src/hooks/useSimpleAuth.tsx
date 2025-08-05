import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour créer un profil temporaire
  const createTemporaryProfile = useCallback((session: Session): Profile => {
    return {
      id: session.user.id,
      email: session.user.email!,
      first_name: session.user.user_metadata?.first_name || 'Utilisateur',
      last_name: session.user.user_metadata?.last_name || '',
      role: session.user.user_metadata?.role || 'user'
    };
  }, []);

  // Fonction pour récupérer le profil
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('No profile found, will use session data');
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, []);

  // Calcul des permissions
  const permissions = useMemo(() => {
    const isAdminEmail = profile?.email === 'admin@repairhub.fr' || profile?.email === 'reine.elie@gmail.com';
    const hasAdminRole = profile?.role === 'admin';
    const isAdmin = isAdminEmail || hasAdminRole;
    
    return {
      isAdmin,
      canAccessClient: !!user,
      canAccessRepairer: profile?.role === 'repairer' || isAdmin,
      canAccessAdmin: isAdmin
    };
  }, [user, profile]);

  // Gestion des changements d'authentification
  useEffect(() => {
    let mounted = true;

    const handleAuthChange = async (event: string, session: Session | null) => {
      console.log('🔄 Auth state changed:', { event, userEmail: session?.user?.email });
      
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        setSession(session);
        
        // Essayer de récupérer le profil
        const profileData = await fetchProfile(session.user.id);
        const finalProfile = profileData || createTemporaryProfile(session);
        
        if (mounted) {
          setProfile(finalProfile);
          console.log('📝 Profile set:', finalProfile);
        }
      } else {
        setUser(null);
        setSession(null);
        setProfile(null);
      }
      
      if (mounted) {
        setLoading(false);
      }
    };

    // Configurer le listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Vérifier la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        handleAuthChange('INITIAL_SESSION', session);
      }
    });

    // Timeout de sécurité
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
      }
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [fetchProfile, createTemporaryProfile, loading]);

  // Actions d'authentification
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  }, []);

  const signInAdmin = useCallback(async (email: string, password: string) => {
    return signIn(email, password);
  }, [signIn]);

  const signUp = useCallback(async (email: string, password: string, userData?: any) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      if (profileData) {
        setProfile(profileData);
      }
    }
  }, [user, fetchProfile]);

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SimpleAuthProvider');
  }
  return context;
};
