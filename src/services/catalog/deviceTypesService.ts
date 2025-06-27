
import { supabase } from '@/integrations/supabase/client';
import type { DeviceType } from '@/types/catalog';

export const deviceTypesService = {
  async getAll(): Promise<DeviceType[]> {
    const { data, error } = await supabase
      .from('device_types')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async create(deviceType: Omit<DeviceType, 'id' | 'created_at'>): Promise<DeviceType> {
    const { data, error } = await supabase
      .from('device_types')
      .insert(deviceType)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<DeviceType>): Promise<DeviceType> {
    const { data, error } = await supabase
      .from('device_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('device_types')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
