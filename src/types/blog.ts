
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image_url?: string;
  author_id?: string;
  category_id?: string;
  visibility: 'public' | 'repairers' | 'both';
  status: 'draft' | 'pending' | 'scheduled' | 'published' | 'archived';
  ai_generated: boolean;
  ai_model?: string;
  generation_prompt?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  view_count: number;
  comment_count: number;
  share_count: number;
  published_at?: string;
  scheduled_at?: string;
  created_at: string;
  updated_at: string;
  // Relations
  category?: BlogCategory;
  author?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

export interface BlogGenerationTemplate {
  id: string;
  name: string;
  category_id?: string;
  visibility: 'public' | 'repairers' | 'both';
  prompt_template: string;
  ai_model: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: BlogCategory;
}

export interface BlogComment {
  id: string;
  post_id: string;
  author_id?: string;
  author_name?: string;
  author_email?: string;
  content: string;
  parent_id?: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  created_at: string;
  updated_at: string;
  replies?: BlogComment[];
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  preferences: {
    blog_updates: boolean;
    product_news: boolean;
    promotions: boolean;
  };
  subscribed_at: string;
  unsubscribed_at?: string;
  created_at: string;
}

export interface BlogSocialShare {
  id: string;
  post_id: string;
  platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'email';
  user_id?: string;
  shared_at: string;
}

export interface AIGenerationRequest {
  template_id: string;
  custom_prompt?: string;
  ai_model?: string;
  auto_publish?: boolean;
  visibility?: 'public' | 'repairers' | 'both';
}
