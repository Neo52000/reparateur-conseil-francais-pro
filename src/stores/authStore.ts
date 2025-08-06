import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/hooks/auth/types';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  // État
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  
  // Actions
  setAuth: (session: Session | null, profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setProfile: (profile: Profile | null) => void;
  clearAuth: () => void;
  
  // Computed values
  isAdmin: boolean;
  canAccessClient: boolean;
  canAccessRepairer: boolean;
  canAccessAdmin: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      // État initial
      user: null,
      session: null,
      profile: null,
      loading: true,
      
      // Actions
      setAuth: (session, profile) => set({ 
        session, 
        user: session?.user ?? null, 
        profile,
        loading: false 
      }),
      
      setLoading: (loading) => set({ loading }),
      
      setProfile: (profile) => set({ profile }),
      
      clearAuth: () => set({ 
        user: null, 
        session: null, 
        profile: null, 
        loading: false 
      }),
      
      // Computed values (getters)
      get isAdmin() {
        const { profile } = get();
        return profile?.email === 'admin@repairhub.fr' || profile?.role === 'admin';
      },
      
      get canAccessClient() {
        const { user } = get();
        return !!user;
      },
      
      get canAccessRepairer() {
        const { profile } = get();
        const isAdmin = get().isAdmin;
        return profile?.role === 'repairer' || isAdmin;
      },
      
      get canAccessAdmin() {
        return get().isAdmin;
      }
    })),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        session: state.session,
        profile: state.profile 
      })
    }
  )
);