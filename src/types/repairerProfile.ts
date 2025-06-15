
export interface RepairerProfile {
  id: string;
  repairer_id: string;
  business_name: string;
  siret_number?: string;
  description?: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  email: string;
  website?: string;
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  has_qualirepar_label: boolean;
  repair_types: string[];
  profile_image_url?: string;
  created_at?: string;
  updated_at?: string;
  geo_lat?: number;
  geo_lng?: number;
  department?: string;
}
