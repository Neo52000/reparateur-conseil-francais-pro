
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BlogComment } from '@/types/blog';

export const useBlogComments = () => {
  const { toast } = useToast();

  // Gestion des commentaires
  const fetchComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as BlogComment[];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  const addComment = async (comment: Omit<BlogComment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .insert(comment)
        .select()
        .single();

      if (error) throw error;
      toast({
        title: "Succès",
        description: "Commentaire ajouté avec succès"
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
  };

  return {
    fetchComments,
    addComment
  };
};
