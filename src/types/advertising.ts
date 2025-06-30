
export interface AdBanner {
  id: string;
  title: string;
  image_url: string;
  target_url: string;
  target_type: 'client' | 'repairer';
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  max_impressions?: number;
  max_clicks?: number;
  current_impressions: number;
  current_clicks: number;
  daily_budget?: number;
  targeting_config: {
    cities?: string[];
    postal_codes?: string[];
    device_types?: string[];
    subscription_tiers?: string[];
    global?: boolean;
  };
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface AdImpression {
  id: string;
  banner_id: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  placement: string;
  created_at: string;
}

export interface AdClick {
  id: string;
  banner_id: string;
  impression_id?: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  placement: string;
  created_at: string;
}

export interface AdCampaignStats {
  banner_id: string;
  impressions: number;
  clicks: number;
  ctr: number;
  cost: number;
  conversions: number;
}

export type AdPlacement = 'homepage_carousel' | 'repairer_dashboard' | 'search_results';

export interface AdTargetingRules {
  cities?: string[];
  postal_codes?: string[];
  device_types?: string[];
  subscription_tiers?: string[];
  user_types?: ('client' | 'repairer')[];
  global?: boolean;
}

// Ajouter les nouveaux types pour les campagnes
export interface AdCampaign {
  id: string;
  name: string;
  description?: string;
  budget_total: number;
  budget_daily: number;
  budget_spent: number;
  start_date: string;
  end_date?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  targeting_config: {
    user_types?: ('client' | 'repairer')[];
    subscription_tiers?: string[];
    device_types?: string[];
    cities?: string[];
    postal_codes?: string[];
    age_ranges?: string[];
    global?: boolean;
  };
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface TargetingSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    user_types?: string[];
    subscription_tiers?: string[];
    cities?: string[];
    postal_codes?: string[];
    device_preferences?: string[];
    age_ranges?: string[];
    behavior_patterns?: string[];
    purchase_history?: string[];
  };
  estimated_reach: number;
  is_active: boolean;
  created_at: string;
}
