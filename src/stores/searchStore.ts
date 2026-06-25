
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
  
  // Actions simplifiées
  setSearchMode: (mode: 'quick' | 'map') => void;
  setSearchTerm: (term: string) => void;
  setCityPostal: (city: string, postalCode: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  performSearch: () => void;
  clearSearch: () => void;
  setResultsCount: (count: number) => void;
}

/**
 * Store de recherche simplifié
 * Évite les effets de bord et les boucles infinies
 */
export const useSearchStore = create<SearchState>((set) => ({
  searchMode: 'map',
  filters: {
    searchTerm: '',
    city: '',
    postalCode: ''
  },
  isSearchActive: true,
  resultsCount: 0,
  
  setSearchMode: (mode) => {
    set({ searchMode: mode, isSearchActive: mode === 'map' });
  },

  setSearchTerm: (term) => {
    set((state) => ({
      filters: { ...state.filters, searchTerm: term }
    }));
  },

  setCityPostal: (city, postalCode) => {
    set((state) => ({
      filters: { ...state.filters, city, postalCode }
    }));
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  performSearch: () => {
    set({ isSearchActive: true });
  },

  clearSearch: () => {
    set({
      filters: {
        searchTerm: '',
        city: '',
        postalCode: ''
      },
      isSearchActive: true,
      resultsCount: 0
    });
  },
  
  setResultsCount: (count) => {
    set({ resultsCount: count });
  }
}));
