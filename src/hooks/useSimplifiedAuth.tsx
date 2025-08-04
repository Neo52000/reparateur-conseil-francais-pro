import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SimplifiedAuthProvider = ({ children }: { children: ReactNode }) => {
  console.log('🔍 SimplifiedAuthProvider - Initialisation');
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 SimplifiedAuthProvider - useEffect auth state');
    
    let mounted = true;

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔍 Auth state change:', event, !!session);
        
        if (!mounted) return;
        
        try {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Essayer de récupérer le profil de manière simple
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (mounted) {
              setProfile(profileData || null);
            }
          } else {
            if (mounted) {
              setProfile(null);
            }
          }
          
          if (mounted) {
            setLoading(false);
          }
        } catch (error) {
          console.error('🚨 Erreur lors du changement d\'état auth:', error);
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    // Vérifier la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 Session initiale:', !!session);
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    }).catch(error => {
      console.error('🚨 Erreur lors de la récupération de session:', error);
      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      console.log('🔍 SimplifiedAuthProvider - Cleanup');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔍 SimplifiedAuthProvider - SignIn attempt');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    console.log('🔍 SimplifiedAuthProvider - SignUp attempt');
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    return { error };
  };

  const signOut = async () => {
    console.log('🔍 SimplifiedAuthProvider - SignOut attempt');
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    profile,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut
  };

  console.log('🔍 SimplifiedAuthProvider - Render, loading:', loading, 'user:', !!user);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useSimplifiedAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSimplifiedAuth must be used within a SimplifiedAuthProvider');
  }
  return context;
};