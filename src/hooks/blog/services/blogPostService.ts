
import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '@/types/blog';
import { cleanPostData } from '../utils/postDataCleaner';

export const fetchPosts = async (filters?: {
  visibility?: string;
  category?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  console.log('Fetching posts with filters:', filters);
  
  let query = supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*),
      author:profiles(first_name, last_name, email)
    `)
    .order('created_at', { ascending: false });

  if (filters?.visibility) {
    query = query.eq('visibility', filters.visibility);
  }
  if (filters?.category) {
    query = query.eq('category_id', filters.category);
  }
  if (filters?.status) {
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
    console.error('Database error:', error);
    throw error;
  }
  
  console.log('Raw data from database:', data?.length || 0);
  return data as BlogPost[] || [];
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
    .eq('status', 'published')
    .single();

  if (error) throw error;

  // Incrémenter le compteur de vues
  await supabase
    .from('blog_posts')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', data.id);

  return data as BlogPost;
};

export const savePost = async (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => {
  console.log('💾 Starting savePost with data:', post);
  
  // Nettoyer les données avant sauvegarde
  const cleanedPost = cleanPostData(post);
  
  // Validation des champs requis
  if (!cleanedPost.title?.trim()) {
    throw new Error('Le titre est requis');
  }
  if (!cleanedPost.content?.trim()) {
    throw new Error('Le contenu est requis');
  }
  if (!cleanedPost.slug?.trim()) {
    throw new Error('Le slug est requis');
  }
  
  if (post.id) {
    console.log('📝 Updating existing post with ID:', post.id);
    
    // Retirer l'ID des données à mettre à jour
    const { id, ...updateData } = cleanedPost;
    
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', post.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Update error:', error);
      throw error;
    }
    
    console.log('✅ Post updated successfully:', data);
    return data;
  } else {
    console.log('📝 Creating new post');
    
    // Pour la création, on doit s'assurer que l'author_id est défini
    if (!cleanedPost.author_id) {
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        cleanedPost.author_id = user.id;
        console.log('Setting author_id to current user:', user.id);
      }
    }
    
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(cleanedPost)
      .select()
      .single();

    if (error) {
      console.error('❌ Insert error:', error);
      throw error;
    }
    
    console.log('✅ Post created successfully:', data);
    return data;
  }
};

export const deletePost = async (id: string) => {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};
