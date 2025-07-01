import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BlogPost } from '@/types/blog';
import * as blogPostService from './services/blogPostService';
import { getBlogErrorMessage } from './utils/errorHandler';

export const useBlogPosts = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Récupération des articles avec filtres - maintenant mémorisée avec useCallback
  const fetchPosts = useCallback(async (filters?: {
    visibility?: string;
    category?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) => {
    setLoading(true);
    try {
      const data = await blogPostService.fetchPosts(filters);
      console.log('📝 Blog posts fetched successfully:', data?.length || 0);
      return data;
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
  }, [toast]);

  // Récupération d'un article par slug
  const fetchPostBySlug = useCallback(async (slug: string) => {
    try {
      const data = await blogPostService.fetchPostBySlug(slug);
      return data;
    } catch (error) {
      console.error('Error fetching blog post:', error);
      return null;
    }
  }, []);

  // Création/mise à jour d'un article
  const savePost = useCallback(async (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'> & { id?: string }, overwriteExisting = false) => {
    try {
      const result = await blogPostService.savePost(post, overwriteExisting);
      toast({
        title: "Succès",
        description: post.id ? "Article mis à jour avec succès" : "Article créé avec succès"
      });
      return result;
    } catch (error: any) {
      console.error('❌ Error saving blog post:', error);
      
      const errorMessage = getBlogErrorMessage(error);
      
      // Si c'est un conflit de slug, on le relance pour que le composant puisse le gérer
      if (errorMessage === 'DUPLICATE_SLUG') {
        throw new Error('DUPLICATE_SLUG');
      }
      
      toast({
        title: "Erreur de sauvegarde",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  // Vérifier si un slug existe
  const checkSlugExists = useCallback(async (slug: string, excludeId?: string) => {
    try {
      return await blogPostService.checkSlugExists(slug, excludeId);
    } catch (error) {
      console.error('Error checking slug:', error);
      return false;
    }
  }, []);

  // Suppression d'un article
  const deletePost = useCallback(async (id: string) => {
    try {
      await blogPostService.deletePost(id);
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
  }, [toast]);

  return {
    loading,
    fetchPosts,
    fetchPostBySlug,
    savePost,
    deletePost,
    checkSlugExists
  };
};
