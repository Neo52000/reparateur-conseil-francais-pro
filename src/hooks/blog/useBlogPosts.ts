
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BlogPost } from '@/types/blog';
import * as blogPostService from './services/blogPostService';
import { getBlogErrorMessage } from './utils/errorHandler';

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
      const data = await blogPostService.fetchPosts(filters);
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
  };

  // Récupération d'un article par slug
  const fetchPostBySlug = async (slug: string) => {
    try {
      const data = await blogPostService.fetchPostBySlug(slug);
      return data;
    } catch (error) {
      console.error('Error fetching blog post:', error);
      return null;
    }
  };

  // Création/mise à jour d'un article
  const savePost = async (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => {
    try {
      const result = await blogPostService.savePost(post);
      toast({
        title: "Succès",
        description: post.id ? "Article mis à jour avec succès" : "Article créé avec succès"
      });
      return result;
    } catch (error: any) {
      console.error('❌ Error saving blog post:', error);
      
      const errorMessage = getBlogErrorMessage(error);
      
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
  };

  return {
    loading,
    fetchPosts,
    fetchPostBySlug,
    savePost,
    deletePost
  };
};
