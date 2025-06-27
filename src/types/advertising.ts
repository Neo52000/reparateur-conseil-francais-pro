
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
  current_impressions: number;
  max_clicks?: number;
  current_clicks: number;
  daily_budget?: number;
  targeting_config: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
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

export interface AdStats {
  banner_id: string;
  impressions: number;
  clicks: number;
  ctr: number;
  period: string;
}

// Helper type for database rows - updated to handle Json type from Supabase
export interface AdBannerRow {
  id: string;
  title: string;
  image_url: string;
  target_url: string;
  target_type: string; // Database returns string
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  max_impressions: number | null;
  current_impressions: number;
  max_clicks: number | null;
  current_clicks: number;
  daily_budget: number | null;
  targeting_config: any; // Changed from Record<string, any> to any to handle Json type
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
