
export interface GeoTargetingZone {
  id: string;
  name: string;
  type: 'city' | 'postal_code' | 'radius' | 'region';
  coordinates?: {
    lat: number;
    lng: number;
    radius: number;
  };
  polygons?: Array<{lat: number; lng: number}>;
  metadata: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface EnhancedTargetingSegment {
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
    geo_zones?: string[];
    demographic_filters?: {
      age_range?: string;
      gender?: string;
      income_range?: string;
      family_status?: string;
    };
    behavioral_filters?: {
      interaction_frequency?: string;
      last_activity?: string;
      engagement_level?: string;
    };
  };
  estimated_reach: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AutomatedCampaign {
  id: string;
  campaign_id: string;
  campaign_type: 'acquisition' | 'reactivation' | 'loyalty' | 'contextual';
  triggers: {
    conditions?: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
    schedule?: {
      frequency: string;
      time?: string;
      days?: string[];
    };
    events?: string[];
  };
  rules: {
    budget_adjustments?: {
      increase_threshold?: number;
      decrease_threshold?: number;
      max_adjustment?: number;
    };
    targeting_optimization?: boolean;
    creative_rotation?: boolean;
  };
  is_active: boolean;
  last_executed?: string;
  next_execution?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignVariant {
  id: string;
  campaign_id: string;
  variant_name: string;
  variant_data: {
    creative_id?: string;
    targeting_adjustments?: Record<string, any>;
    budget_allocation?: number;
    message_variations?: {
      title?: string;
      description?: string;
      cta_text?: string;
    };
  };
  traffic_split: number;
  performance_metrics: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    ctr?: number;
    conversion_rate?: number;
  };
  is_active: boolean;
  created_at: string;
}

export interface CampaignCreative {
  id: string;
  campaign_id: string;
  creative_type: 'image' | 'video' | 'text' | 'html';
  creative_url?: string;
  creative_data: {
    title?: string;
    description?: string;
    image_url?: string;
    video_url?: string;
    html_content?: string;
    cta_text?: string;
    template_id?: string;
  };
  ai_generated: boolean;
  performance_score: number;
  is_active: boolean;
  created_at: string;
}

export interface UserBehaviorEvent {
  id: string;
  user_id?: string;
  session_id?: string;
  event_type: string;
  event_data: Record<string, any>;
  page_url?: string;
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
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

export interface PersonalizationData {
  user_id?: string;
  user_name?: string;
  city?: string;
  device_model?: string;
  recent_searches?: string[];
  interaction_history?: Array<{
    type: string;
    target: string;
    timestamp: string;
  }>;
}
