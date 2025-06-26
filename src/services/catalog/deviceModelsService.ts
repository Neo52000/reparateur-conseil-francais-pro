
import { supabase } from '@/integrations/supabase/client';
import type { DeviceModel, DeviceModelFormData } from '@/types/catalog';

export const deviceModelsService = {
  async getAll(): Promise<DeviceModel[]> {
    const { data, error } = await supabase
      .from('device_models')
      .select(`
        *,
        device_type:device_types(*),
        brand:brands(*)
      `)
      .order('model_name');
    
    if (error) throw error;
    
    // Conversion des types pour compatibilité
    const modelsWithCorrectTypes = (data || []).map(model => ({
      ...model,
      storage_options: Array.isArray(model.storage_options) ? model.storage_options : [],
      colors: Array.isArray(model.colors) ? model.colors : [],
      connectivity: Array.isArray(model.connectivity) ? model.connectivity : [],
      special_features: Array.isArray(model.special_features) ? model.special_features : [],
    })) as DeviceModel[];
    
    return modelsWithCorrectTypes;
  },

  async create(modelData: DeviceModelFormData): Promise<any> {
    const processedData = {
      device_type_id: modelData.device_type_id,
      brand_id: modelData.brand_id,
      model_name: modelData.model_name,
      model_number: modelData.model_number || null,
      release_date: modelData.release_date || null,
      screen_size: modelData.screen_size ? parseFloat(modelData.screen_size) : null,
      screen_resolution: modelData.screen_resolution || null,
      screen_type: modelData.screen_type || null,
      battery_capacity: modelData.battery_capacity ? parseInt(modelData.battery_capacity) : null,
      operating_system: modelData.operating_system || null,
      is_active: modelData.is_active
    };
    
    const { data, error } = await supabase
      .from('device_models')
      .insert([processedData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, modelData: DeviceModelFormData): Promise<any> {
    const processedData = {
      device_type_id: modelData.device_type_id,
      brand_id: modelData.brand_id,
      model_name: modelData.model_name,
      model_number: modelData.model_number || null,
      release_date: modelData.release_date || null,
      screen_size: modelData.screen_size ? parseFloat(modelData.screen_size) : null,
      screen_resolution: modelData.screen_resolution || null,
      screen_type: modelData.screen_type || null,
      battery_capacity: modelData.battery_capacity ? parseInt(modelData.battery_capacity) : null,
      operating_system: modelData.operating_system || null,
      is_active: modelData.is_active,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('device_models')
      .update(processedData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('device_models')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
