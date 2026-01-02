import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '@/types/blog';
import { cleanBlogPostsData, cleanBlogPostData, preparePostForSave } from '../utils/postDataCleaner';

export const fetchPosts = async (filters?: {
  visibility?: string;
  category?: string;
  status?: string;
  limit?: number;
  offset?: number;
  /**
   * Par défaut, on n'inclut pas le champ `content` (très volumineux) pour éviter
   * les timeouts et les réponses trop lourdes sur les listes.
   */
  includeContent?: boolean;
}) => {
  const limit = filters?.limit ?? 50;
  const offset = filters?.offset ?? 0;

  const listSelect = filters?.includeContent
    ? `*,
       category:blog_categories(*),
       author:profiles(first_name, last_name, email)`
    : `id, title, slug, excerpt, featured_image_url, author_id, category_id, visibility, status,
       ai_generated, ai_model, generation_prompt, meta_title, meta_description, keywords,
       view_count, comment_count, share_count, published_at, scheduled_at, created_at, updated_at,
       category:blog_categories(id, name, slug, description, icon, display_order, is_active, created_at, updated_at)`;

  let query = supabase
    .from('blog_posts')
    .select(listSelect)
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

  // Pagination (toujours, pour éviter de récupérer toute la table)
  query = query.range(offset, offset + limit - 1);

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
    // Mise à jour - nettoyer les données avant l'UPDATE
    const cleanedPost = preparePostForSave(post);
    
    const { data, error } = await supabase
      .from('blog_posts')
      .update(cleanedPost as any)
      .eq('id', post.id)
      .select(`
        *,
        category:blog_categories(*),
        author:profiles(first_name, last_name, email)
      `)
      .single();

    if (error) {
      console.error('Error updating blog post:', error);
      throw error;
    }

    return cleanBlogPostData(data);
  } else {
    // Création - nettoyer les données avant l'INSERT
    const cleanedPost = preparePostForSave(post);
    
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(cleanedPost as any)
      .select(`
        *,
        category:blog_categories(*),
        author:profiles(first_name, last_name, email)
      `)
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
