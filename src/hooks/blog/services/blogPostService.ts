import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '@/types/blog';
import { cleanBlogPostsData, cleanBlogPostData } from '../utils/postDataCleaner';

export const fetchPosts = async (filters?: {
  visibility?: string;
  category?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  let query = supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*),
      author:profiles(first_name, last_name, email)
    `)
    .order('created_at', { ascending: false });

  // Application des filtres
  if (filters?.visibility && filters.visibility !== 'all') {
    query = query.eq('visibility', filters.visibility);
  }
  
  if (filters?.category && filters.category !== 'all') {
    query = query.eq('category_id', filters.category);
  }
  
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }

  return cleanBlogPostsData(data || []);
};

export const fetchPostBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*),
      author:profiles(first_name, last_name, email)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching blog post by slug:', error);
    throw error;
  }

  return cleanBlogPostData(data);
};

export const checkSlugExists = async (slug: string, excludeId?: string) => {
  let query = supabase
    .from('blog_posts')
    .select('id')
    .eq('slug', slug);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error checking slug existence:', error);
    throw error;
  }

  return data && data.length > 0;
};

export const savePost = async (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'> & { id?: string }, overwriteExisting = false) => {
  // Vérifier si le slug existe déjà
  if (!overwriteExisting) {
    const slugExists = await checkSlugExists(post.slug, post.id);
    if (slugExists) {
      throw new Error('DUPLICATE_SLUG');
    }
  }

  if (post.id) {
    // Mise à jour
    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        ...post,
        updated_at: new Date().toISOString()
      })
      .eq('id', post.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating blog post:', error);
      throw error;
    }

    return cleanBlogPostData(data);
  } else {
    // Création
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        ...post,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }

    return cleanBlogPostData(data);
  }
};

export const deletePost = async (id: string) => {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting blog post:', error);
    throw error;
  }

  return true;
};
