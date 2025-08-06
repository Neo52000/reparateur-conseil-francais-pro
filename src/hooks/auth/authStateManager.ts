
import { useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Profile, AuthState } from './types';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const clearState = () => {
    setUser(null);
    setSession(null);
    setProfile(null);
    setLoading(false);
  };

  const updateAuthState = (newSession: Session | null, newProfile: Profile | null = null) => {
    setSession(newSession);
    setUser(newSession?.user ?? null);
    setProfile(newProfile);
    setLoading(false);
  };

  return {
    user,
    session,
    profile,
    loading,
    setLoading,
    setProfile,
    clearState,
    updateAuthState
  };
};
