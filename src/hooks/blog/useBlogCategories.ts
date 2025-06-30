
import { supabase } from '@/integrations/supabase/client';
import { BlogCategory } from '@/types/blog';

export const useBlogCategories = () => {
  // Récupération des catégories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data as BlogCategory[];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  };

  return {
    fetchCategories
  };
};
