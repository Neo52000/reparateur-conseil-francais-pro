
export interface Repairer {
  id: string;
  name: string;
  business_name?: string;
  address: string;
  city: string;
  postal_code: string;
  department: string;
  region: string;
  phone?: string;
  website?: string;
  email?: string;
  lat: number;
  lng: number;
  rating?: number;
  review_count?: number;
  services: string[];
  specialties: string[];
  price_range: 'low' | 'medium' | 'high';
  response_time?: string;
  opening_hours?: Record<string, string> | null;
  is_verified: boolean;
  is_open?: boolean;
  has_qualirepar_label?: boolean;
  source: 'pages_jaunes' | 'google_places' | 'manual';
  scraped_at: string;
  updated_at: string;
  created_at: string;
  // Required properties from Supabase schema
  business_status: string;
  pappers_verified: boolean;
  pappers_last_check?: string;
  siret?: string;
  siren?: string;
}

// Alias pour compatibilité avec le code existant
export type RepairerDB = Repairer;

// Type étendu pour les réparateurs avec coordonnées calculées
export interface RepairerWithCoordinates extends Repairer {
  hasRealCoordinates?: boolean;
}

// Propriétés calculées pour l'affichage
export interface RepairerDisplay extends Repairer {
  reviewCount: number;
  averagePrice: string;
  responseTime: string;
}
