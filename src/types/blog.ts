
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
  visibility: 'public' | 'repairers' | 'both';
  category_id?: string;
  author_id?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  status: 'draft' | 'pending' | 'published' | 'archived';
  published_at?: string;
  scheduled_at?: string;
  ai_generated: boolean;
  ai_model?: string;
  generation_prompt?: string;
  view_count: number;
  comment_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
  
  // Relations
  blog_categories?: BlogCategory;
  profiles?: {
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
  
  // Relations
  blog_categories?: BlogCategory;
}

export interface BlogComment {
  id: string;
  post_id: string;
  author_id?: string;
  author_name?: string;
  author_email?: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  parent_id?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  profiles?: {
    first_name?: string;
    last_name?: string;
  };
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

export interface BlogScheduling {
  id: string;
  template_id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  custom_cron?: string;
  next_execution?: string;
  is_active: boolean;
  auto_publish: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations
  blog_generation_templates?: BlogGenerationTemplate;
}

export type AIModel = 'mistral' | 'deepseek' | 'openai';

export interface BlogGenerationRequest {
  template_id: string;
  title?: string;
  additional_context?: string;
  ai_model?: AIModel;
  auto_publish?: boolean;
}
