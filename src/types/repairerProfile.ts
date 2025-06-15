
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
  has_qualirepar_label: boolean;
  repair_types: string[];
  profile_image_url: string | null;
  
  // Nouveaux champs administrables par le réparateur
  opening_hours?: {
    monday?: { open: string; close: string; closed?: boolean };
    tuesday?: { open: string; close: string; closed?: boolean };
    wednesday?: { open: string; close: string; closed?: boolean };
    thursday?: { open: string; close: string; closed?: boolean };
    friday?: { open: string; close: string; closed?: boolean };
    saturday?: { open: string; close: string; closed?: boolean };
    sunday?: { open: string; close: string; closed?: boolean };
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
