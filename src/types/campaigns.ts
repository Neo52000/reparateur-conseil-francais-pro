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

export interface CampaignBanner {
  id: string;
  campaign_id: string;
  banner_id: string;
  weight: number;
  is_active: boolean;
}

export interface CampaignStats {
  campaign_id: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  ctr: number;
  cpc: number;
  roi: number;
}

export interface TargetingRule {
  field: string;
  operator: 'equals' | 'in' | 'not_in' | 'contains';
  value: string | string[];
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

// Extension pour les nouvelles fonctionnalités avancées
export interface EnhancedAdCampaign extends AdCampaign {
  automation_config?: {
    type: 'acquisition' | 'reactivation' | 'loyalty' | 'contextual';
    triggers: Record<string, any>;
    rules: Record<string, any>;
  };
  variants?: CampaignVariant[];
  performance_metrics?: CampaignPerformanceMetrics[];
  geo_targeting?: string[]; // IDs des zones géographiques
}

export interface CampaignVariant {
  id: string;
  campaign_id: string;
  variant_name: string;
  variant_data: Record<string, any>;
  traffic_split: number;
  performance_metrics: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface CampaignPerformanceMetrics {
  id: string;
  campaign_id: string;
  date: string;
  segment_id?: string;
  geo_zone_id?: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  revenue: number;
  created_at: string;
}
