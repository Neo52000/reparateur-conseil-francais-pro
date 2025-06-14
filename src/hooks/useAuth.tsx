
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
      console.log('🔍 Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('❌ Error fetching profile:', error);
        return null;
      }
      
      console.log('✅ Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('💥 Exception fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('🔧 Setting up auth listener');
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const handleAuthChange = async (event: string, session: Session | null) => {
      console.log('🔄 Auth state changed:', { event, userEmail: session?.user?.email, sessionExists: !!session });
      
      if (!mounted) {
        console.log('⚠️ Component unmounted, skipping auth state change');
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('👤 User found, fetching profile for:', session.user.id);
        try {
          const profileData = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(profileData);
            console.log('📝 Profile set:', profileData);
          }
        } catch (error) {
          console.error('💥 Error in profile fetch:', error);
          if (mounted) {
            setProfile(null);
          }
        }
      } else {
        console.log('❌ No user found, clearing profile');
        if (mounted) {
          setProfile(null);
        }
      }
      
      // Important: Always set loading to false after processing
      if (mounted) {
        setLoading(false);
        console.log('✅ Auth loading complete', { hasUser: !!session?.user, hasProfile: !!profile });
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Check existing session with timeout fallback
    const checkSession = async () => {
      try {
        console.log('🔍 Checking existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          // Don't let this block the loading state
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        console.log('🔄 Initial session check:', { sessionExists: !!session, userEmail: session?.user?.email });
        
        if (mounted) {
          await handleAuthChange('INITIAL_SESSION', session);
        }
      } catch (error) {
        console.error('💥 Exception during session check:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    // Set up a timeout to ensure loading state doesn't get stuck
    timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.log('⏰ Auth check timeout, forcing loading to false');
        setLoading(false);
      }
    }, 3000); // 3 second timeout

    checkSession();

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email);
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Sign in error:', error);
        setLoading(false);
      } else {
        console.log('✅ Sign in successful');
        // Loading will be set to false by the auth state change handler
      }
      
      return { error };
    } catch (error) {
      console.error('💥 Exception during sign in:', error);
      setLoading(false);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData?: UserSignUpData) => {
    console.log('📝 Attempting sign up for:', email);
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
    console.log('👋 Signing out...');
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        setLoading(false);
        return { error };
      }
      
      // Clear state immediately
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
      
      console.log('✅ Sign out successful');
      return { error: null };
    } catch (error) {
      console.error('💥 Exception during sign out:', error);
      setLoading(false);
      return { error };
    }
  };

  // Helper functions for access control
  const isAdmin = profile?.role === 'admin';
  const canAccessClient = profile?.role === 'client' || profile?.role === 'admin';
  const canAccessRepairer = profile?.role === 'repairer' || profile?.role === 'admin';
  const canAccessAdmin = profile?.role === 'admin';

  console.log('🔐 Current auth state:', { 
    hasUser: !!user, 
    hasProfile: !!profile, 
    profileRole: profile?.role,
    isAdmin, 
    canAccessClient,
    canAccessRepairer,
    canAccessAdmin,
    loading 
  });

  return {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    canAccessClient,
    canAccessRepairer,
    canAccessAdmin
  };
};
