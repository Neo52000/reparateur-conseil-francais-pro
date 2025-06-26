
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
  }
};
