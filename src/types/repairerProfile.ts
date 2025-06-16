export interface RepairerProfile {
  id: string;
  repairer_id: string;
  business_name: string;
  siret_number: string | null;
  description: string | null;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  email: string;
  website: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  whatsapp_url: string | null;
  telegram_url: string | null;
  tiktok_url: string | null;
  has_qualirepar_label: boolean;
  repair_types: string[];
  profile_image_url: string | null;
  // Allow geo_lat/lng on repairer profiles
  geo_lat?: number;
  geo_lng?: number;
  
  // Nouveaux champs administrables par le réparateur
  opening_hours?: {
    monday?: { 
      morning_open: string; 
      morning_close: string; 
      morning_appointment_only?: boolean;
      morning_home_service?: boolean;
      afternoon_open: string; 
      afternoon_close: string; 
      afternoon_appointment_only?: boolean;
      afternoon_home_service?: boolean;
      closed?: boolean;
    };
    tuesday?: { 
      morning_open: string; 
      morning_close: string; 
      morning_appointment_only?: boolean;
      morning_home_service?: boolean;
      afternoon_open: string; 
      afternoon_close: string; 
      afternoon_appointment_only?: boolean;
      afternoon_home_service?: boolean;
      closed?: boolean;
    };
    wednesday?: { 
      morning_open: string; 
      morning_close: string; 
      morning_appointment_only?: boolean;
      morning_home_service?: boolean;
      afternoon_open: string; 
      afternoon_close: string; 
      afternoon_appointment_only?: boolean;
      afternoon_home_service?: boolean;
      closed?: boolean;
    };
    thursday?: { 
      morning_open: string; 
      morning_close: string; 
      morning_appointment_only?: boolean;
      morning_home_service?: boolean;
      afternoon_open: string; 
      afternoon_close: string; 
      afternoon_appointment_only?: boolean;
      afternoon_home_service?: boolean;
      closed?: boolean;
    };
    friday?: { 
      morning_open: string; 
      morning_close: string; 
      morning_appointment_only?: boolean;
      morning_home_service?: boolean;
      afternoon_open: string; 
      afternoon_close: string; 
      afternoon_appointment_only?: boolean;
      afternoon_home_service?: boolean;
      closed?: boolean;
    };
    saturday?: { 
      morning_open: string; 
      morning_close: string; 
      morning_appointment_only?: boolean;
      morning_home_service?: boolean;
      afternoon_open: string; 
      afternoon_close: string; 
      afternoon_appointment_only?: boolean;
      afternoon_home_service?: boolean;
      closed?: boolean;
    };
    sunday?: { 
      morning_open: string; 
      morning_close: string; 
      morning_appointment_only?: boolean;
      morning_home_service?: boolean;
      afternoon_open: string; 
      afternoon_close: string; 
      afternoon_appointment_only?: boolean;
      afternoon_home_service?: boolean;
      closed?: boolean;
    };
  };
  services_offered?: string[];
  certifications?: string[];
  years_experience?: number;
  languages_spoken?: string[];
  payment_methods?: string[];
  warranty_duration?: string;
  response_time?: string;
  emergency_service?: boolean;
  home_service?: boolean;
  pickup_service?: boolean;
  pricing_info?: {
    diagnostic_fee?: number;
    min_repair_cost?: number;
    hourly_rate?: number;
    free_quote?: boolean;
  };
  
  created_at: string;
  updated_at: string;
}

export interface RepairerProfileFormProps {
  profile: RepairerProfile;
  onSave: (profile: RepairerProfile) => void;
  onCancel: () => void;
  isAdmin?: boolean;
}

export const REPAIR_TYPES = [
  { value: 'telephone', label: 'Téléphone' },
  { value: 'montre', label: 'Montre' },
  { value: 'console', label: 'Console' },
  { value: 'ordinateur', label: 'Ordinateur' },
  { value: 'autres', label: 'Autres' }
];

export const getRepairTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    telephone: 'Téléphone',
    montre: 'Montre',
    console: 'Console',
    ordinateur: 'Ordinateur',
    autres: 'Autres'
  };
  return labels[type] || type;
};

export const LANGUAGES = [
  { value: 'francais', label: 'Français' },
  { value: 'anglais', label: 'Anglais' },
  { value: 'espagnol', label: 'Espagnol' },
  { value: 'italien', label: 'Italien' },
  { value: 'allemand', label: 'Allemand' },
  { value: 'arabe', label: 'Arabe' }
];

export const PAYMENT_METHODS = [
  { value: 'especes', label: 'Espèces' },
  { value: 'carte', label: 'Carte bancaire' },
  { value: 'cheque', label: 'Chèque' },
  { value: 'virement', label: 'Virement' },
  { value: 'paypal', label: 'PayPal' }
];

export const CERTIFICATIONS = [
  { value: 'qualirepar', label: 'QualiRépar' },
  { value: 'rge', label: 'RGE' },
  { value: 'iso', label: 'ISO 9001' },
  { value: 'apple', label: 'Agréé Apple' },
  { value: 'samsung', label: 'Agréé Samsung' }
];
