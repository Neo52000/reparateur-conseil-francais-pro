// Store de compatibilité temporaire - VERSION SIMPLE
import { create } from 'zustand';

interface SimpleAuthStore {
  user: any;
  profile: any;
  loading: boolean;
  isAdmin: boolean;
  canAccessClient: boolean;
  canAccessRepairer: boolean;
  canAccessAdmin: boolean;
  setAuth: (session: any, profile: any) => void;
  setLoading: (loading: boolean) => void;
  setProfile: (profile: any) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<SimpleAuthStore>((set) => ({
  user: null,
  profile: null,
  loading: false,
  isAdmin: false,
  canAccessClient: false,
  canAccessRepairer: false,
  canAccessAdmin: false,
  setAuth: (session, profile) => set({
    user: session?.user ?? null,
    profile,
    loading: false,
    isAdmin: profile?.role === 'admin' || profile?.email === 'admin@repairhub.fr',
    canAccessClient: !!session?.user,
    canAccessRepairer: profile?.role === 'repairer' || profile?.role === 'admin',
    canAccessAdmin: profile?.role === 'admin' || profile?.email === 'admin@repairhub.fr'
  }),
  setLoading: (loading) => set({ loading }),
  setProfile: (profile) => set({ 
    profile,
    isAdmin: profile?.role === 'admin' || profile?.email === 'admin@repairhub.fr',
    canAccessRepairer: profile?.role === 'repairer' || profile?.role === 'admin',
    canAccessAdmin: profile?.role === 'admin' || profile?.email === 'admin@repairhub.fr'
  }),
  clearAuth: () => set({
    user: null,
    profile: null,
    loading: false,
    isAdmin: false,
    canAccessClient: false,
    canAccessRepairer: false,
    canAccessAdmin: false
  })
}));