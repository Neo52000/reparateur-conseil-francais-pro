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

// Préparer les données pour l'INSERT/UPDATE en ne gardant que les colonnes valides
export const preparePostForSave = (post: Partial<BlogPost>) => {
  const validColumns = [
    'id',
    'title',
    'slug',
    'excerpt',
    'content',
    'featured_image_url',
    'author_id',
    'category_id',
    'visibility',
    'status',
    'ai_generated',
    'ai_model',
    'generation_prompt',
    'meta_title',
    'meta_description',
    'keywords',
    'view_count',
    'comment_count',
    'share_count',
    'published_at',
    'scheduled_at'
  ];

  const cleanedPost: Record<string, any> = {};
  
  for (const key of validColumns) {
    if (key in post) {
      cleanedPost[key] = post[key as keyof BlogPost];
    }
  }

  return cleanedPost;
};
