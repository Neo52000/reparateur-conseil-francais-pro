
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
          let profileData = await profileService.fetchProfile(session.user.id);
          
          // Si pas de profil, essayer de le créer à partir des métadonnées utilisateur
          if (!profileData && session.user.user_metadata) {
            console.log('📝 No profile found, creating from user metadata');
            const userData = {
              email: session.user.email!,
              first_name: session.user.user_metadata.first_name,
              last_name: session.user.user_metadata.last_name,
              role: session.user.user_metadata.role || 'user'
            };
            
            try {
              profileData = await profileService.createProfile(session.user.id, userData);
              console.log('✅ Profile created from metadata:', profileData);
            } catch (createError) {
              console.error('❌ Error creating profile:', createError);
              // Créer un profil temporaire pour permettre l'accès
              if (session.user.email === 'reine.elie@gmail.com') {
                profileData = {
                  id: session.user.id,
                  email: session.user.email!,
                  first_name: 'Reine',
                  last_name: 'Elie',
                  role: 'admin'
                };
                console.log('🚨 Created temporary admin profile:', profileData);
              }
            }
          }
          
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
      
      if (mounted) {
        setLoading(false);
        console.log('✅ Auth loading complete', { hasUser: !!session?.user, hasProfile: !!profile });
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Check existing session
    const checkSession = async () => {
      try {
        console.log('🔍 Checking existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        if (mounted) {
          await handleAuthChange('INITIAL_SESSION', session);
        }
      } catch (error) {
        console.error('💥 Exception during session check:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    // Timeout de sécurité
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.log('⏰ Auth check timeout, forcing loading to false');
        setLoading(false);
      }
    }, 5000);

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    console.log('🔑 Starting sign in process for:', email);
    
    const result = await authService.signIn(email, password);
    
    if (result.error) {
      console.error('❌ Sign in failed:', result.error);
      setLoading(false);
    }
    
    return result;
  };

  const signUp = async (email: string, password: string, userData?: UserSignUpData) => {
    return await authService.signUp(email, password, userData);
  };

  const signOut = async () => {
    setLoading(true);
    console.log('👋 Starting sign out process');
    
    const result = await authService.signOut();
    
    if (result.error) {
      console.error('❌ Sign out failed:', result.error);
      setLoading(false);
      return result;
    }
    
    // Clear state immediately
    setUser(null);
    setSession(null);
    setProfile(null);
    setLoading(false);
    console.log('✅ Sign out completed');
    
    return result;
  };

  // Helper functions for access control
  const isAdmin = profile?.role === 'admin';
  const canAccessClient = profile?.role === 'client' || profile?.role === 'user' || profile?.role === 'admin';
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
