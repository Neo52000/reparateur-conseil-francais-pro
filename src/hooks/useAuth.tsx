
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
    console.log('🚀 Initializing auth system...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, 'User ID:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 User found, fetching profile...');
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
          console.log('📋 Profile set:', profileData?.role || 'no role');
        } else {
          console.log('👤 No user, clearing profile');
          setProfile(null);
        }
        
        console.log('✅ Auth loading complete');
        setLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        console.log('🔍 Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          return;
        }
        
        console.log('📱 Initial session check:', session?.user?.id || 'No session');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 Initial user found, fetching profile...');
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
          console.log('📋 Initial profile set:', profileData?.role || 'no role');
        }
        
        console.log('✅ Initial auth check complete');
        setLoading(false);
      } catch (error) {
        console.error('💥 Exception during auth initialization:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('❌ Sign in error:', error);
    } else {
      console.log('✅ Sign in successful');
    }
    return { error };
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
    if (error) {
      console.error('❌ Sign up error:', error);
    } else {
      console.log('✅ Sign up successful');
    }
    return { error };
  };

  const signOut = async () => {
    console.log('🚪 Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Sign out error:', error);
    } else {
      console.log('✅ Sign out successful');
    }
    return { error };
  };

  const isAdmin = profile?.role === 'admin';

  console.log('🎯 Current auth state:', {
    loading,
    hasUser: !!user,
    hasProfile: !!profile,
    role: profile?.role,
    isAdmin
  });

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
