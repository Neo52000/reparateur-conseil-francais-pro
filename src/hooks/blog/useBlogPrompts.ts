import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface BlogPromptTemplate {
  id: string;
  name: string;
  category_id: string | null;
  prompt_template: string;
  ai_model: string | null;
  visibility: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useBlogPrompts = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchPrompts = useCallback(async (): Promise<BlogPromptTemplate[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_generation_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching prompts:', error);
      toast({
        title: "Erreur de chargement",
        description: error.message || "Impossible de charger les prompts",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const savePrompt = useCallback(async (prompt: Partial<BlogPromptTemplate>): Promise<boolean> => {
    setLoading(true);
    try {
      if (prompt.id) {
        // Update existing
        const { error } = await supabase
          .from('blog_generation_templates')
          .update({
            name: prompt.name,
            category_id: prompt.category_id || null,
            prompt_template: prompt.prompt_template,
            ai_model: prompt.ai_model || null,
            visibility: prompt.visibility,
            is_active: prompt.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', prompt.id);

        if (error) throw error;

        toast({
          title: "✅ Prompt mis à jour",
          description: "Le prompt a été sauvegardé avec succès"
        });
      } else {
        // Create new
        const { error } = await supabase
          .from('blog_generation_templates')
          .insert({
            name: prompt.name!,
            category_id: prompt.category_id || null,
            prompt_template: prompt.prompt_template!,
            ai_model: prompt.ai_model || 'google/gemini-2.5-flash',
            visibility: prompt.visibility || 'public',
            is_active: prompt.is_active !== false
          });

        if (error) throw error;

        toast({
          title: "✅ Prompt créé",
          description: "Le nouveau prompt a été créé avec succès"
        });
      }

      return true;
    } catch (error: any) {
      console.error('Error saving prompt:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: error.message || "Impossible de sauvegarder le prompt",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deletePrompt = useCallback(async (promptId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('blog_generation_templates')
        .delete()
        .eq('id', promptId);

      if (error) throw error;

      toast({
        title: "✅ Prompt supprimé",
        description: "Le prompt a été supprimé avec succès"
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting prompt:', error);
      toast({
        title: "Erreur de suppression",
        description: error.message || "Impossible de supprimer le prompt",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    fetchPrompts,
    savePrompt,
    deletePrompt
  };
};
