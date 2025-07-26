export interface AdvertisingCampaign {
  id: string;
  repairer_id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  campaign_type: 'automated' | 'manual' | 'boost';
  budget_total: number;
  budget_daily: number;
  budget_spent: number;
  channels: string[];
  targeting_config: {
    location_radius?: number;
    keywords?: string[];
    demographics?: Record<string, any>;
    custom_audiences?: string[];
  };
  creative_style: 'technique' | 'proximite' | 'urgence' | 'humour' | 'premium';
  auto_optimization: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignCreative {
  id: string;
  campaign_id: string;
  creative_type: 'text' | 'image' | 'video' | 'carousel';
  creative_url?: string;
  creative_data: {
    title?: string;
    description?: string;
    cta_text?: string;
    image_url?: string;
    video_url?: string;
    format?: string;
  };
  ai_generated: boolean;
  ai_model?: string;
  generation_prompt?: string;
  performance_score: number;
  status: 'draft' | 'active' | 'archived';
  name: string;
  metadata?: Record<string, any>;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AdvertisingAnalytics {
  id: string;
  campaign_id: string;
  creative_id?: string;
  date: string;
  channel: 'google_ads' | 'meta_ads' | 'microsoft_ads';
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  revenue: number;
  ctr: number;
  cpc: number;
  roas: number;
  created_at: string;
}

export interface PosCatalogSync {
  id: string;
  repairer_id: string;
  catalog_type: 'product' | 'service' | 'repair_type';
  item_id: string;
  item_data: {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    brand?: string;
    model?: string;
    stock_quantity?: number;
    images?: string[];
  };
  sync_status: 'pending' | 'synced' | 'error';
  last_synced_at?: string;
  sync_errors: string[];
  created_at: string;
  updated_at: string;
}

export interface AiGeneratedContent {
  id: string;
  repairer_id: string;
  content_type: 'ad_title' | 'ad_description' | 'image' | 'video' | 'social_post';
  source_item_id?: string;
  ai_model: string;
  generation_prompt: string;
  generated_content: {
    text?: string;
    image_url?: string;
    video_url?: string;
    metadata?: Record<string, any>;
  };
  style_used?: string;
  generation_cost: number;
  quality_score: number;
  usage_count: number;
  created_at: string;
}

export interface AdvertisingBudget {
  id: string;
  campaign_id: string;
  channel: 'google_ads' | 'meta_ads' | 'microsoft_ads';
  budget_allocated: number;
  budget_spent: number;
  auto_optimization: boolean;
  optimization_rules: {
    max_cpc?: number;
    target_roas?: number;
    pause_threshold?: number;
    boost_threshold?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface CampaignSchedule {
  id: string;
  campaign_id: string;
  schedule_type: 'recurring' | 'one_time' | 'seasonal';
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  schedule_config: {
    days_of_week?: number[];
    time_of_day?: string;
    seasonal_periods?: Array<{
      start: string;
      end: string;
      budget_multiplier: number;
    }>;
  };
  last_executed_at?: string;
  next_execution_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GoogleCssConfig {
  id: string;
  repairer_id: string;
  css_provider?: string;
  css_account_id?: string;
  is_active: boolean;
  savings_percentage: number;
  total_savings: number;
  activation_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCampaignData {
  name: string;
  description?: string;
  campaign_type: 'automated' | 'manual' | 'boost';
  budget_total: number;
  budget_daily: number;
  channels: string[];
  creative_style: 'technique' | 'proximite' | 'urgence' | 'humour' | 'premium';
  targeting_config?: Record<string, any>;
  auto_optimization?: boolean;
  start_date?: string;
  end_date?: string;
}

export interface AIContentGenerationRequest {
  content_type: 'ad_title' | 'ad_description' | 'image' | 'video';
  source_item: {
    id: string;
    name: string;
    description?: string;
    price?: number;
    category?: string;
  };
  style: 'technique' | 'proximite' | 'urgence' | 'humour' | 'premium';
  target_audience?: string;
  additional_context?: string;
}

export interface CampaignPerformanceMetrics {
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  total_cost: number;
  total_revenue: number;
  average_ctr: number;
  average_cpc: number;
  average_roas: number;
  best_performing_channel: string;
  best_performing_creative: string;
  optimization_suggestions: string[];
}