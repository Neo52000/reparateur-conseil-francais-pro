
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BlogCategory } from '@/types/blog';

export const useBlogCategories = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les catégories",
          variant: "destructive"
        });
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const saveCategory = useCallback(async (category: Omit<BlogCategory, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => {
    try {
      if (category.id) {
        const { data, error } = await supabase
          .from('blog_categories')
          .update({
            ...category,
            updated_at: new Date().toISOString()
          })
          .eq('id', category.id)
          .select()
          .single();

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Catégorie mise à jour avec succès"
        });
        
        return data;
      } else {
        const { data, error } = await supabase
          .from('blog_categories')
          .insert({
            ...category,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Catégorie créée avec succès"
        });
        
        return data;
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la catégorie",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  return {
    loading,
    fetchCategories,
    saveCategory
  };
};
