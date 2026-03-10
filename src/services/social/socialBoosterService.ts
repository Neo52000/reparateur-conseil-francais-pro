
import { supabase } from '@/integrations/supabase/client';
import type { SocialCampaign, SocialPost, SocialPublicationLog, SocialSettings } from '@/types/socialBooster';

const invokeBooster = async (action: string, payload: Record<string, unknown> = {}) => {
  const { data, error } = await supabase.functions.invoke('social-booster', {
    body: { action, ...payload },
  });
  if (error) throw new Error(error.message || 'Edge function error');
  return data;
};

export const socialBoosterService = {
  // Scan for new blog posts without campaigns
  async scanArticles(): Promise<{ new_campaigns: number; articles_found: string[] }> {
    return invokeBooster('scan');
  },

  // Generate social posts for a campaign
  async generatePosts(campaignId: string): Promise<{ campaign_id: string; posts_generated: number }> {
    return invokeBooster('generate', { campaign_id: campaignId });
  },

  // Get all campaigns with posts
  async getCampaigns(statusFilter?: string): Promise<SocialCampaign[]> {
    let query = supabase
      .from('social_campaigns')
      .select(`
        *,
        blog_post:blog_posts(id, title, slug, excerpt, content, featured_image_url, status, published_at, category:blog_categories(name, slug)),
        repairer:repairer_profiles(id, business_name, city, specialties),
        social_posts(*)
      `)
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as unknown as SocialCampaign[];
  },

  // Get single campaign
  async getCampaign(id: string): Promise<SocialCampaign | null> {
    const { data, error } = await supabase
      .from('social_campaigns')
      .select(`
        *,
        blog_post:blog_posts(id, title, slug, excerpt, content, featured_image_url, status, published_at, category:blog_categories(name, slug)),
        repairer:repairer_profiles(id, business_name, city, specialties),
        social_posts(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as unknown as SocialCampaign;
  },

  // Update a social post content
  async updatePost(postId: string, updates: Partial<Pick<SocialPost, 'content' | 'hashtags' | 'cta_text' | 'cta_url' | 'status'>>): Promise<void> {
    const { error } = await supabase
      .from('social_posts')
      .update(updates)
      .eq('id', postId);
    if (error) throw error;
  },

  // Update campaign status
  async updateCampaignStatus(campaignId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('social_campaigns')
      .update({ status })
      .eq('id', campaignId);
    if (error) throw error;
  },

  // Get publication logs
  async getLogs(limit = 50): Promise<SocialPublicationLog[]> {
    const { data, error } = await supabase
      .from('social_publication_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []) as unknown as SocialPublicationLog[];
  },

  // Log a publication action
  async logAction(postId: string | null, campaignId: string, action: string, status: string, errorMessage?: string): Promise<void> {
    const { error } = await supabase
      .from('social_publication_logs')
      .insert({
        social_post_id: postId,
        campaign_id: campaignId,
        action,
        status,
        error_message: errorMessage,
      });
    if (error) console.error('Failed to log action:', error);
  },

  // Get settings
  async getSettings(): Promise<SocialSettings> {
    const { data, error } = await supabase
      .from('social_settings')
      .select('config')
      .limit(1)
      .single();
    if (error) throw error;
    return (data?.config || {}) as unknown as SocialSettings;
  },

  // Get stats
  async getStats() {
    const [campaigns, posts] = await Promise.all([
      supabase.from('social_campaigns').select('status', { count: 'exact' }),
      supabase.from('social_posts').select('status, platform', { count: 'exact' }),
    ]);
    return {
      totalCampaigns: campaigns.count || 0,
      totalPosts: posts.count || 0,
    };
  },
};
