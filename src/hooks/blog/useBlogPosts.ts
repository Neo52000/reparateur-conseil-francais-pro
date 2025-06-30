
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BlogPost } from '@/types/blog';

export const useBlogPosts = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Récupération des articles avec filtres
  const fetchPosts = async (filters?: {
    visibility?: string;
    category?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) => {
    setLoading(true);
    try {
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

      if (error) throw error;
      return data as BlogPost[];
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les articles",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Récupération d'un article par slug
  const fetchPostBySlug = async (slug: string) => {
    try {
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
    } catch (error) {
      console.error('Error fetching blog post:', error);
      return null;
    }
  };

  // Création/mise à jour d'un article
  const savePost = async (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => {
    try {
      if (post.id) {
        const { data, error } = await supabase
          .from('blog_posts')
          .update(post)
          .eq('id', post.id)
          .select()
          .single();

        if (error) throw error;
        toast({
          title: "Succès",
          description: "Article mis à jour avec succès"
        });
        return data;
      } else {
        const { data, error } = await supabase
          .from('blog_posts')
          .insert(post)
          .select()
          .single();

        if (error) throw error;
        toast({
          title: "Succès",
          description: "Article créé avec succès"
        });
        return data;
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'article",
        variant: "destructive"
      });
      return null;
    }
  };

  // Suppression d'un article
  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Succès",
        description: "Article supprimé avec succès"
      });
      return true;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'article",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    loading,
    fetchPosts,
    fetchPostBySlug,
    savePost,
    deletePost
  };
};
