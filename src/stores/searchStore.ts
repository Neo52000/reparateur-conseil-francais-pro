
import { create } from 'zustand';

interface SearchFilters {
  searchTerm?: string;
  city?: string;
  postalCode?: string;
  location?: string;
  minRating?: number;
  services?: string[];
  priceRange?: string;
}

interface SearchState {
  filters: SearchFilters;
  isSearchActive: boolean;
  resultsCount: number;
  
  // Actions
  setSearchTerm: (term: string) => void;
  setLocation: (location: string) => void;
  setCityPostal: (city: string, postalCode: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  performSearch: () => void;
  clearSearch: () => void;
  setResultsCount: (count: number) => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  filters: {},
  isSearchActive: false,
  resultsCount: 0,
  
  setSearchTerm: (searchTerm) => 
    set((state) => ({ 
      filters: { 
        ...state.filters, 
        searchTerm,
        // Convertir le searchTerm en services si c'est pertinent
        services: searchTerm && searchTerm.trim() !== '' ? [searchTerm.trim()] : undefined
      } 
    })),
    
  setLocation: (location) => 
    set((state) => ({ 
      filters: { ...state.filters, location } 
    })),
    
  setCityPostal: (city, postalCode) => 
    set((state) => ({ 
      filters: { ...state.filters, city, postalCode } 
    })),
    
  setFilters: (newFilters) => 
    set((state) => ({ 
      filters: { ...state.filters, ...newFilters } 
    })),
    
  performSearch: () => {
    set({ isSearchActive: true });
    console.log('Recherche effectuée avec les filtres:', get().filters);
  },
  
  clearSearch: () => 
    set({ 
      filters: {}, 
      isSearchActive: false, 
      resultsCount: 0 
    }),
    
  setResultsCount: (resultsCount) => 
    set({ resultsCount }),
}));
