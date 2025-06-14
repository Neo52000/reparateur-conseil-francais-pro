
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
}

interface UserSignUpData {
  first_name?: string;
  last_name?: string;
  role?: string;
  phone?: string;
  business_name?: string;
  address?: string;
  website?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      console.log('Profile fetched:', data);
      return data;
    } catch (error) {
      console.error('Exception fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('🔧 Setting up auth listener');
    let mounted = true;
    
    // Fonction pour gérer les changements d'état d'auth
    const handleAuthChange = async (event: string, session: Session | null) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email);
      
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        if (mounted) {
          setProfile(profileData);
        }
      } else {
        if (mounted) {
          setProfile(null);
        }
      }
      
      if (mounted) {
        setLoading(false);
      }
    };

    // Configurer l'écouteur d'état d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Vérifier la session existante
    const checkSession = async () => {
      try {
        console.log('🔍 Checking existing session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (mounted) {
          await handleAuthChange('INITIAL_SESSION', session);
        }
      } catch (error) {
        console.error('Exception during session check:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, userData?: UserSignUpData) => {
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
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const isAdmin = profile?.role === 'admin';

  console.log('🔐 Auth state:', { user: !!user, profile, loading, isAdmin });

  return {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin
  };
};
