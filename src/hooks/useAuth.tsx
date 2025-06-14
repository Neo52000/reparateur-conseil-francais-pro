
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { authService } from '@/services/authService';
import { profileService } from '@/services/profileService';
import type { Profile, UserSignUpData } from '@/types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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
          const profileData = await profileService.fetchProfile(session.user.id);
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
      const { session, error } = await authService.getSession();
      
      if (error) {
        // Don't let this block the loading state
        if (mounted) {
          setLoading(false);
        }
        return;
      }
      
      if (mounted) {
        await handleAuthChange('INITIAL_SESSION', session);
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
    setLoading(true);
    
    const result = await authService.signIn(email, password);
    
    if (result.error) {
      setLoading(false);
    }
    // Loading will be set to false by the auth state change handler on success
    
    return result;
  };

  const signUp = async (email: string, password: string, userData?: UserSignUpData) => {
    return await authService.signUp(email, password, userData);
  };

  const signOut = async () => {
    setLoading(true);
    
    const result = await authService.signOut();
    
    if (result.error) {
      setLoading(false);
      return result;
    }
    
    // Clear state immediately
    setUser(null);
    setSession(null);
    setProfile(null);
    setLoading(false);
    
    return result;
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
