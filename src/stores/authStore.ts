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
      setAuth: (session, profile) => {
        const state = {
          session, 
          user: session?.user ?? null, 
          profile,
          loading: false
        };
        
        // Calculer les propriétés dérivées
        const isAdmin = profile?.email === 'admin@repairhub.fr' || profile?.role === 'admin';
        
        set({
          ...state,
          isAdmin,
          canAccessClient: !!state.user,
          canAccessRepairer: profile?.role === 'repairer' || isAdmin,
          canAccessAdmin: isAdmin
        });
      },
      
      setLoading: (loading) => set({ loading }),
      
      setProfile: (profile) => {
        const isAdmin = profile?.email === 'admin@repairhub.fr' || profile?.role === 'admin';
        set({ 
          profile,
          isAdmin,
          canAccessRepairer: profile?.role === 'repairer' || isAdmin,
          canAccessAdmin: isAdmin
        });
      },
      
      clearAuth: () => set({ 
        user: null, 
        session: null, 
        profile: null, 
        loading: false,
        isAdmin: false,
        canAccessClient: false,
        canAccessRepairer: false,
        canAccessAdmin: false
      }),
      
      // Propriétés calculées (valeurs par défaut)
      isAdmin: false,
      canAccessClient: false,
      canAccessRepairer: false,
      canAccessAdmin: false
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