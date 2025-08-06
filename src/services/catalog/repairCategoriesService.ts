
import { supabase } from '@/integrations/supabase/client';
import type { RepairCategory } from '@/types/catalog';

export const repairCategoriesService = {
  async getAll(): Promise<RepairCategory[]> {
    const { data, error } = await supabase
      .from('repair_categories')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }
};
