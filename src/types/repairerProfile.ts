
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
  // Additional properties used by other components
  years_experience?: number;
  response_time?: string;
  warranty_duration?: string;
  emergency_service?: boolean;
  home_service?: boolean;
  pickup_service?: boolean;
  pricing_info?: {
    diagnosis_fee?: number;
    diagnostic_fee?: number; // Alias for diagnosis_fee
    hourly_rate?: number;
    travel_fee?: number;
    warranty_included?: boolean;
    min_repair_cost?: number;
    free_quote?: boolean;
  };
  languages_spoken?: string[];
  payment_methods?: string[];
  certifications?: string[];
  services_offered?: string[];
}

export interface RepairerProfileFormProps {
  profile: RepairerProfile;
  onSave: (profile: RepairerProfile) => void;
  onCancel: () => void;
  isAdmin?: boolean;
}

export const REPAIR_TYPES = [
  { value: 'smartphone', label: 'Smartphone' },
  { value: 'tablet', label: 'Tablette' },
  { value: 'laptop', label: 'Ordinateur portable' },
  { value: 'desktop', label: 'Ordinateur fixe' },
  { value: 'gaming_console', label: 'Console de jeu' },
  { value: 'smartwatch', label: 'Montre connectée' },
  { value: 'headphones', label: 'Écouteurs/Casques' },
  { value: 'camera', label: 'Appareil photo' },
  { value: 'tv', label: 'Télévision' },
  { value: 'appliance', label: 'Électroménager' },
  { value: 'other', label: 'Autre' }
];

export const LANGUAGES = [
  { value: 'french', label: 'Français' },
  { value: 'english', label: 'Anglais' },
  { value: 'spanish', label: 'Espagnol' },
  { value: 'italian', label: 'Italien' },
  { value: 'german', label: 'Allemand' },
  { value: 'portuguese', label: 'Portugais' },
  { value: 'arabic', label: 'Arabe' },
  { value: 'chinese', label: 'Chinois' },
  { value: 'japanese', label: 'Japonais' },
  { value: 'other', label: 'Autre' }
];

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Espèces' },
  { value: 'card', label: 'Carte bancaire' },
  { value: 'bank_transfer', label: 'Virement bancaire' },
  { value: 'check', label: 'Chèque' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'apple_pay', label: 'Apple Pay' },
  { value: 'google_pay', label: 'Google Pay' },
  { value: 'contactless', label: 'Sans contact' }
];

export const getRepairTypeLabel = (value: string): string => {
  const type = REPAIR_TYPES.find(t => t.value === value);
  return type ? type.label : value;
};

