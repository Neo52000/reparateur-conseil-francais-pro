
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBlogSocial = () => {
  const trackSocialShare = useCallback(async (
    postId: string, 
    platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'email',
    userId?: string
  ) => {
    try {
      const { error } = await supabase
        .from('blog_social_shares')
        .insert({
          post_id: postId,
          platform,
          user_id: userId,
          shared_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error tracking social share:', error);
        return false;
      }

      // Increment share count on the post
      const { error: updateError } = await supabase.rpc('increment_share_count', {
        post_id: postId
      });

      if (updateError) {
        console.error('Error incrementing share count:', updateError);
      }

      return true;
    } catch (error) {
      console.error('Error tracking social share:', error);
      return false;
    }
  }, []);

  return {
    trackSocialShare
  };
};
