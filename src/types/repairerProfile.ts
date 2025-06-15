
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
