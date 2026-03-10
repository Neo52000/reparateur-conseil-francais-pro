
export type SocialPlatform = 'facebook' | 'instagram' | 'x' | 'linkedin';

export type CampaignStatus = 'detected' | 'normalized' | 'classified' | 'queued' | 'generated' | 'draft' | 'approved' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled' | 'skipped';

export type PostStatus = 'draft' | 'approved' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled';

export interface SocialCampaign {
  id: string;
  blog_post_id: string;
  status: CampaignStatus;
  repairer_id?: string | null;
  match_score?: number | null;
  match_reason?: string | null;
  article_classification?: ArticleClassification;
  created_at: string;
  updated_at: string;
  // Joined
  blog_post?: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    featured_image_url?: string;
    status: string;
    published_at?: string;
    category?: { name: string; slug: string } | null;
  };
  repairer?: {
    id: string;
    business_name?: string;
    city?: string;
    specialties?: string[];
  } | null;
  social_posts?: SocialPost[];
}

export interface SocialPost {
  id: string;
  campaign_id: string;
  platform: SocialPlatform;
  content: string;
  hashtags: string[];
  cta_text?: string;
  cta_url?: string;
  media_url?: string;
  status: PostStatus;
  external_post_id?: string;
  scheduled_at?: string;
  published_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialPublicationLog {
  id: string;
  social_post_id?: string;
  campaign_id?: string;
  action: string;
  status: string;
  response_data?: Record<string, unknown>;
  error_message?: string;
  created_at: string;
}

export interface SocialSettings {
  auto_scan: boolean;
  default_platforms: SocialPlatform[];
  utm_source: string;
  utm_medium: string;
  utm_campaign_prefix: string;
  base_url: string;
}

export interface ArticleClassification {
  device_type?: string;
  repair_type?: string;
  brand?: string;
  intent_type?: string;
  scope?: 'local' | 'national';
  recommended_angle?: string;
  keywords?: string[];
}

export interface GenerateRequest {
  campaign_id: string;
}

export interface ScanResult {
  new_campaigns: number;
  articles_found: string[];
}
