
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BlogComment } from '@/types/blog';

export const useBlogComments = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async (postId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addComment = useCallback(async (comment: Omit<BlogComment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .insert({
          ...comment,
          status: 'pending', // Les commentaires sont en attente par défaut
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Commentaire ajouté",
        description: "Votre commentaire est en attente de modération"
      });

      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le commentaire",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  return {
    loading,
    fetchComments,
    addComment
  };
};
