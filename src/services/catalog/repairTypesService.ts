
import { supabase } from '@/integrations/supabase/client';
import type { RepairType } from '@/types/catalog';

export const repairTypesService = {
  async getAll(): Promise<RepairType[]> {
    const { data, error } = await supabase
      .from('repair_types')
      .select(`
        *,
        category:repair_categories(*)
      `)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async create(repairType: Omit<RepairType, 'id' | 'created_at' | 'category'>): Promise<RepairType> {
    const { data, error } = await supabase
      .from('repair_types')
      .insert([repairType])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<RepairType>): Promise<RepairType> {
    const { data, error } = await supabase
      .from('repair_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('repair_types')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
