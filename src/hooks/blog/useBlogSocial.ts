
import { supabase } from '@/integrations/supabase/client';

export const useBlogSocial = () => {
  // Partage social
  const trackSocialShare = async (postId: string, platform: string, userId?: string) => {
    try {
      await supabase
        .from('blog_social_shares')
        .insert({ post_id: postId, platform, user_id: userId });

      // Incrémenter le compteur de partages
      const { data: post } = await supabase
        .from('blog_posts')
        .select('share_count')
        .eq('id', postId)
        .single();

      if (post) {
        await supabase
          .from('blog_posts')
          .update({ share_count: (post.share_count || 0) + 1 })
          .eq('id', postId);
      }
    } catch (error) {
      console.error('Error tracking social share:', error);
    }
  };

  return {
    trackSocialShare
  };
};
