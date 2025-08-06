
import { create } from 'zustand';
import { Repairer } from '@/types/repairer';

interface MapState {
  center: [number, number];
  zoom: number;
  repairers: Repairer[];
  selectedRepairer: Repairer | null;
  userLocation: [number, number] | null;
  isLoading: boolean;
  
  // Actions
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setRepairers: (repairers: Repairer[]) => void;
  setSelectedRepairer: (repairer: Repairer | null) => void;
  setUserLocation: (location: [number, number] | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  center: [46.8566, 2.3522] as [number, number], // France center
  zoom: 6,
  repairers: [],
  selectedRepairer: null,
  userLocation: null,
  isLoading: false,
};

export const useMapStore = create<MapState>((set) => ({
  ...initialState,
  
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setRepairers: (repairers) => set({ repairers }),
  setSelectedRepairer: (selectedRepairer) => set({ selectedRepairer }),
  setUserLocation: (userLocation) => set({ userLocation }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set(initialState),
}));
