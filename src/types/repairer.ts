
export interface Repairer {
  id: string;
  name: string;
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
  opening_hours?: Record<string, string>;
  is_verified: boolean;
  is_open?: boolean;
  source: 'pages_jaunes' | 'google_places' | 'manual';
  scraped_at: string;
  updated_at: string;
  created_at: string;
}

// Alias pour compatibilité avec le code existant
export type RepairerDB = Repairer;

// Propriétés calculées pour l'affichage
export interface RepairerDisplay extends Repairer {
  reviewCount: number;
  averagePrice: string;
  responseTime: string;
}
