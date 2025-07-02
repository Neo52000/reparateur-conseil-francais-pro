/**
 * Interface unifiée pour les filtres de recherche
 */

export interface SearchFilters {
  services?: string[];
  brands?: string[];
  priceRange?: [number, number];
  distance?: number;
  minRating?: number;
  openNow?: boolean;
  fastResponse?: boolean;
  city?: string;
  postalCode?: string;
  searchTerm?: string;
}

export interface RepairerSearchFilters extends SearchFilters {
  deviceModelId?: string;
  repairTypeId?: string;
  location?: {
    lat: number;
    lng: number;
    radius?: number;
  };
  maxPrice?: number;
  minPrice?: number;
}