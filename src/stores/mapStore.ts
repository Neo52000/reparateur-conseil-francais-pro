import { create } from 'zustand';

// Type simplifié pour le store de la carte - compatible avec les données réelles
export interface MapRepairer {
  id: string;
  name: string;
  address: string;
  city: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  services?: string[];
  rating?: number;
  lat?: number | null;
  lng?: number | null;
  is_verified?: boolean;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface MapState {
  center: [number, number];
  zoom: number;
  repairers: MapRepairer[];
  selectedRepairer: MapRepairer | null;
  userLocation: [number, number] | null;
  isLoading: boolean;
  openProfileOnSelect: boolean;
  
  // Actions
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setRepairers: (repairers: MapRepairer[]) => void;
  setSelectedRepairer: (repairer: MapRepairer | null) => void;
  setUserLocation: (location: [number, number] | null) => void;
  setLoading: (loading: boolean) => void;
  setOpenProfileOnSelect: (open: boolean) => void;
  reset: () => void;
}

const initialState = {
  center: [46.8566, 2.3522] as [number, number], // France center
  zoom: 6,
  repairers: [] as MapRepairer[],
  selectedRepairer: null as MapRepairer | null,
  userLocation: null as [number, number] | null,
  isLoading: false,
  openProfileOnSelect: false,
};

export const useMapStore = create<MapState>((set) => ({
  ...initialState,
  
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setRepairers: (repairers) => set({ repairers }),
  setSelectedRepairer: (selectedRepairer) => set({ selectedRepairer }),
  setUserLocation: (userLocation) => set({ userLocation }),
  setLoading: (isLoading) => set({ isLoading }),
  setOpenProfileOnSelect: (openProfileOnSelect) => set({ openProfileOnSelect }),
  reset: () => set(initialState),
}));