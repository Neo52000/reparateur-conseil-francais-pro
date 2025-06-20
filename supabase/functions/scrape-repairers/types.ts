
export interface BusinessData {
  name: string;
  address: string;
  city: string;
  postal_code: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  category?: string;
  lat?: number;  // Coordonnées GPS latitude
  lng?: number;  // Coordonnées GPS longitude
}

export interface ClassificationResult {
  is_repairer: boolean;
  confidence: number;
  services: string[];
  specialties: string[];
  price_range: string;
  is_open?: boolean;
  verification_method?: string;
  gouvernement_verified?: boolean;
  business_status?: string;
  siret?: string;
  siren?: string;
}
