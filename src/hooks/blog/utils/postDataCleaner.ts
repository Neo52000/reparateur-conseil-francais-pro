
import { BlogPost } from '@/types/blog';

export const cleanBlogPostData = (rawPost: any): BlogPost => {
  return {
    ...rawPost,
    visibility: rawPost.visibility as 'public' | 'repairers' | 'both',
    status: rawPost.status as 'draft' | 'pending' | 'scheduled' | 'published' | 'archived'
  };
};

export const cleanBlogPostsData = (rawPosts: any[]): BlogPost[] => {
  return rawPosts.map(cleanBlogPostData);
};
