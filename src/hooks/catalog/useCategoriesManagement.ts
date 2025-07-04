import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  is_active: boolean;
  search_keywords?: string[];
  created_at: string;
  updated_at: string;
}

export const useCategoriesManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('business_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les catégories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData: Partial<Category>) => {
    try {
      const { data, error } = await supabase
        .from('business_categories')
        .insert([{
          name: categoryData.name,
          description: categoryData.description,
          color: categoryData.color || '#6b7280',
          icon: categoryData.icon,
          search_keywords: categoryData.search_keywords || [],
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data]);
      toast({
        title: "Succès",
        description: "Catégorie créée avec succès"
      });
      return data;
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la catégorie",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    try {
      const { data, error } = await supabase
        .from('business_categories')
        .update({
          name: categoryData.name,
          description: categoryData.description,
          color: categoryData.color,
          icon: categoryData.icon,
          search_keywords: categoryData.search_keywords,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => prev.map(cat => cat.id === id ? data : cat));
      toast({
        title: "Succès",
        description: "Catégorie mise à jour avec succès"
      });
      return data;
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la catégorie",
        variant: "destructive"
      });
      throw error;
    }
  };

  const toggleCategoryStatus = async (id: string, isActive: boolean) => {
    try {
      const { data, error } = await supabase
        .from('business_categories')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => prev.map(cat => cat.id === id ? data : cat));
      toast({
        title: "Succès",
        description: `Catégorie ${isActive ? 'activée' : 'désactivée'} avec succès`
      });
      return data;
    } catch (error: any) {
      console.error('Error toggling category status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de la catégorie",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      // Vérifier si la catégorie est utilisée par des réparateurs
      const { count } = await supabase
        .from('repairers')
        .select('*', { count: 'exact', head: true })
        .eq('business_category_id', id);

      if (count && count > 0) {
        toast({
          title: "Impossible de supprimer",
          description: `Cette catégorie est utilisée par ${count} réparateur(s). Désactivez-la plutôt.`,
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('business_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast({
        title: "Succès",
        description: "Catégorie supprimée avec succès"
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la catégorie",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    toggleCategoryStatus,
    deleteCategory
  };
};