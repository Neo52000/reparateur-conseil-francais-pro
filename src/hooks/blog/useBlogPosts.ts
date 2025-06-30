
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

  // Fonction pour nettoyer les données avant sauvegarde
  const cleanPostData = (post: any) => {
    console.log('🧹 Cleaning post data:', post);
    const cleanedPost = { ...post };
    
    // Convertir les chaînes vides en null pour les UUIDs
    if (cleanedPost.category_id === '') {
      console.log('Converting empty category_id to null');
      cleanedPost.category_id = null;
    }
    if (cleanedPost.author_id === '') {
      console.log('Converting empty author_id to null');
      cleanedPost.author_id = null;
    }
    
    // Nettoyer les autres champs optionnels
    if (cleanedPost.featured_image_url === '') {
      cleanedPost.featured_image_url = null;
    }
    if (cleanedPost.meta_title === '') {
      cleanedPost.meta_title = null;
    }
    if (cleanedPost.meta_description === '') {
      cleanedPost.meta_description = null;
    }
    if (cleanedPost.excerpt === '') {
      cleanedPost.excerpt = null;
    }
    
    // S'assurer que les keywords sont un tableau
    if (!Array.isArray(cleanedPost.keywords)) {
      cleanedPost.keywords = [];
    }
    
    // Supprimer les champs undefined
    Object.keys(cleanedPost).forEach(key => {
      if (cleanedPost[key] === undefined) {
        delete cleanedPost[key];
      }
    });
    
    console.log('🧹 Cleaned post data:', cleanedPost);
    return cleanedPost;
  };

  // Création/mise à jour d'un article
  const savePost = async (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => {
    try {
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
        toast({
          title: "Succès",
          description: "Article mis à jour avec succès"
        });
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
        toast({
          title: "Succès",
          description: "Article créé avec succès"
        });
        return data;
      }
    } catch (error: any) {
      console.error('❌ Error saving blog post:', error);
      
      // Messages d'erreur plus spécifiques
      let errorMessage = "Impossible de sauvegarder l'article";
      
      if (error.message?.includes('duplicate key value violates unique constraint')) {
        if (error.message.includes('slug')) {
          errorMessage = "Ce slug existe déjà. Veuillez en choisir un autre.";
        }
      } else if (error.message?.includes('invalid input syntax for type uuid')) {
        errorMessage = "Erreur de format des identifiants. Veuillez réessayer.";
      } else if (error.message?.includes('not-null constraint')) {
        errorMessage = "Certains champs obligatoires sont manquants.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erreur de sauvegarde",
        description: errorMessage,
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
