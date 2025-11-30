import { BlogPost } from '@/types/blog';

interface RawBlogPost {
  visibility?: string;
  status?: string;
  [key: string]: unknown;
}

export const cleanBlogPostData = (rawPost: RawBlogPost): BlogPost => {
  return {
    ...rawPost,
    visibility: (rawPost.visibility || 'public') as 'public' | 'repairers' | 'both',
    status: (rawPost.status || 'draft') as 'draft' | 'pending' | 'scheduled' | 'published' | 'archived'
  } as BlogPost;
};

export const cleanBlogPostsData = (rawPosts: RawBlogPost[]): BlogPost[] => {
  return rawPosts.map(cleanBlogPostData);
};
