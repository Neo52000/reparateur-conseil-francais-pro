
import { create } from 'zustand';

export interface SearchFilters {
  searchTerm: string;
  city: string;
  postalCode: string;
  services?: string[];
  priceRange?: string;
  distance?: number;
  minRating?: number;
  openNow?: boolean;
  fastResponse?: boolean;
}

interface SearchState {
  searchMode: 'quick' | 'map';
  filters: SearchFilters;
  isSearchActive: boolean;
  resultsCount: number;
  
  // Actions
  setSearchMode: (mode: 'quick' | 'map') => void;
  setSearchTerm: (term: string) => void;
  setCityPostal: (city: string, postalCode: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  performSearch: () => void;
  clearSearch: () => void;
  setResultsCount: (count: number) => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  searchMode: 'map', // Mode carte par défaut
  filters: {
    searchTerm: '',
    city: '',
    postalCode: ''
  },
  isSearchActive: true, // Carte active par défaut
  resultsCount: 0,
  
  setSearchMode: (mode) => {
    try {
      set({ searchMode: mode });
      // Activer automatiquement la recherche en mode carte
      if (mode === 'map') {
        set({ isSearchActive: true });
      }
    } catch (error) {
      console.error('Error setting search mode:', error);
    }
  },
  
  setSearchTerm: (term) => {
    try {
      set((state) => ({
        filters: { ...state.filters, searchTerm: term }
      }));
    } catch (error) {
      console.error('Error setting search term:', error);
    }
  },
  
  setCityPostal: (city, postalCode) => {
    try {
      set((state) => ({
        filters: { ...state.filters, city, postalCode }
      }));
    } catch (error) {
      console.error('Error setting city/postal:', error);
    }
  },
  
  setFilters: (newFilters) => {
    try {
      set((state) => ({
        filters: { ...state.filters, ...newFilters }
      }));
    } catch (error) {
      console.error('Error setting filters:', error);
    }
  },
  
  performSearch: () => {
    try {
      set({ isSearchActive: true });
    } catch (error) {
      console.error('Error performing search:', error);
    }
  },
  
  clearSearch: () => {
    try {
      set({
        filters: {
          searchTerm: '',
          city: '',
          postalCode: ''
        },
        isSearchActive: true, // Garder la carte active
        resultsCount: 0
      });
    } catch (error) {
      console.error('Error clearing search:', error);
    }
  },
  
  setResultsCount: (count) => {
    try {
      set({ resultsCount: count });
    } catch (error) {
      console.error('Error setting results count:', error);
    }
  }
}));
