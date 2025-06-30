
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BlogPost, BlogCategory, BlogComment, BlogGenerationTemplate, NewsletterSubscriber } from '@/types/blog';
import { useToast } from '@/hooks/use-toast';

export const useBlog = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch blog categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data as BlogCategory[];
    }
  });

  // Fetch blog posts with filters
  const fetchPosts = async (filters: {
    visibility?: string;
    category?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}) => {
    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories (
          id, name, slug, icon
        ),
        profiles (
          first_name, last_name, email
        )
      `);

    if (filters.visibility) {
      query = query.in('visibility', [filters.visibility, 'both']);
    }
    
    if (filters.category) {
      query = query.eq('category_id', filters.category);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    } else {
      query = query.eq('status', 'published');
    }

    query = query.order('published_at', { ascending: false });

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as BlogPost[];
  };

  // Create or update blog post
  const createOrUpdatePost = useMutation({
    mutationFn: async (post: Partial<BlogPost> & { id?: string }) => {
      const postData = {
        ...post,
        author_id: post.author_id || user?.id,
        updated_at: new Date().toISOString()
      };

      if (post.id) {
        const { data, error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', post.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('blog_posts')
          .insert({
            ...postData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast({
        title: "Article sauvegardé",
        description: "L'article a été sauvegardé avec succès."
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'article.",
        variant: "destructive"
      });
    }
  });

  // Delete blog post
  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast({
        title: "Article supprimé",
        description: "L'article a été supprimé avec succès."
      });
    }
  });

  // Fetch comments for a post
  const fetchComments = async (postId: string) => {
    const { data, error } = await supabase
      .from('blog_comments')
      .select(`
        *,
        profiles (
          first_name, last_name
        )
      `)
      .eq('post_id', postId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as BlogComment[];
  };

  // Add comment
  const addComment = useMutation({
    mutationFn: async (comment: {
      post_id: string;
      content: string;
      author_name?: string;
      author_email?: string;
      parent_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('blog_comments')
        .insert({
          ...comment,
          author_id: user?.id,
          status: isAdmin ? 'approved' : 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Commentaire ajouté",
        description: isAdmin ? "Votre commentaire a été publié." : "Votre commentaire est en attente de modération."
      });
    }
  });

  // Subscribe to newsletter
  const subscribeToNewsletter = useMutation({
    mutationFn: async (data: { email: string; name?: string }) => {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert(data);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Inscription réussie",
        description: "Vous êtes maintenant abonné à notre newsletter."
      });
    }
  });

  return {
    categories,
    categoriesLoading,
    fetchPosts,
    createOrUpdatePost,
    deletePost,
    fetchComments,
    addComment,
    subscribeToNewsletter
  };
};
