
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
}

export interface ClassificationResult {
  is_repairer: boolean;
  confidence: number;
  services: string[];
  specialties: string[];
  price_range: string;
  is_open: boolean;
}

export interface DepartmentInfo {
  lat: number;
  lng: number;
  name: string;
  region: string;
}
