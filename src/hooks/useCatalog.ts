
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { DeviceType, Brand, DeviceModel, RepairCategory, RepairType, RepairPrice } from '@/types/catalog';

export const useCatalog = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Device Types
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  
  // Brands
  const [brands, setBrands] = useState<Brand[]>([]);
  
  // Device Models
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  
  // Repair Categories
  const [repairCategories, setRepairCategories] = useState<RepairCategory[]>([]);
  
  // Repair Types
  const [repairTypes, setRepairTypes] = useState<RepairType[]>([]);

  const fetchDeviceTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('device_types')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setDeviceTypes(data || []);
    } catch (err) {
      console.error('Error fetching device types:', err);
      setError('Erreur lors du chargement des types d\'appareils');
    }
  };

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setBrands(data || []);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError('Erreur lors du chargement des marques');
    }
  };

  const fetchDeviceModels = async () => {
    try {
      const { data, error } = await supabase
        .from('device_models')
        .select(`
          *,
          device_type:device_types(*),
          brand:brands(*)
        `)
        .order('model_name');
      
      if (error) throw error;
      setDeviceModels(data || []);
    } catch (err) {
      console.error('Error fetching device models:', err);
      setError('Erreur lors du chargement des modèles');
    }
  };

  const fetchRepairCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('repair_categories')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      setRepairCategories(data || []);
    } catch (err) {
      console.error('Error fetching repair categories:', err);
      setError('Erreur lors du chargement des catégories de réparation');
    }
  };

  const fetchRepairTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('repair_types')
        .select(`
          *,
          category:repair_categories(*)
        `)
        .order('name');
      
      if (error) throw error;
      setRepairTypes(data || []);
    } catch (err) {
      console.error('Error fetching repair types:', err);
      setError('Erreur lors du chargement des types de réparation');
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchDeviceTypes(),
        fetchBrands(),
        fetchDeviceModels(),
        fetchRepairCategories(),
        fetchRepairTypes()
      ]);
    } finally {
      setLoading(false);
    }
  };

  // CRUD Operations
  const createBrand = async (brand: Omit<Brand, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .insert([brand])
        .select()
        .single();
      
      if (error) throw error;
      await fetchBrands();
      return data;
    } catch (err) {
      console.error('Error creating brand:', err);
      throw new Error('Erreur lors de la création de la marque');
    }
  };

  const updateBrand = async (id: string, updates: Partial<Brand>) => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      await fetchBrands();
      return data;
    } catch (err) {
      console.error('Error updating brand:', err);
      throw new Error('Erreur lors de la mise à jour de la marque');
    }
  };

  const deleteBrand = async (id: string) => {
    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await fetchBrands();
    } catch (err) {
      console.error('Error deleting brand:', err);
      throw new Error('Erreur lors de la suppression de la marque');
    }
  };

  const createDeviceModel = async (model: Omit<DeviceModel, 'id' | 'created_at' | 'updated_at' | 'device_type' | 'brand'>) => {
    try {
      const { data, error } = await supabase
        .from('device_models')
        .insert([model])
        .select()
        .single();
      
      if (error) throw error;
      await fetchDeviceModels();
      return data;
    } catch (err) {
      console.error('Error creating device model:', err);
      throw new Error('Erreur lors de la création du modèle');
    }
  };

  const updateDeviceModel = async (id: string, updates: Partial<DeviceModel>) => {
    try {
      const { data, error } = await supabase
        .from('device_models')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      await fetchDeviceModels();
      return data;
    } catch (err) {
      console.error('Error updating device model:', err);
      throw new Error('Erreur lors de la mise à jour du modèle');
    }
  };

  const deleteDeviceModel = async (id: string) => {
    try {
      const { error } = await supabase
        .from('device_models')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await fetchDeviceModels();
    } catch (err) {
      console.error('Error deleting device model:', err);
      throw new Error('Erreur lors de la suppression du modèle');
    }
  };

  const createRepairType = async (repairType: Omit<RepairType, 'id' | 'created_at' | 'category'>) => {
    try {
      const { data, error } = await supabase
        .from('repair_types')
        .insert([repairType])
        .select()
        .single();
      
      if (error) throw error;
      await fetchRepairTypes();
      return data;
    } catch (err) {
      console.error('Error creating repair type:', err);
      throw new Error('Erreur lors de la création du type de réparation');
    }
  };

  const updateRepairType = async (id: string, updates: Partial<RepairType>) => {
    try {
      const { data, error } = await supabase
        .from('repair_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      await fetchRepairTypes();
      return data;
    } catch (err) {
      console.error('Error updating repair type:', err);
      throw new Error('Erreur lors de la mise à jour du type de réparation');
    }
  };

  const deleteRepairType = async (id: string) => {
    try {
      const { error } = await supabase
        .from('repair_types')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await fetchRepairTypes();
    } catch (err) {
      console.error('Error deleting repair type:', err);
      throw new Error('Erreur lors de la suppression du type de réparation');
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return {
    // Data
    deviceTypes,
    brands,
    deviceModels,
    repairCategories,
    repairTypes,
    
    // State
    loading,
    error,
    
    // Actions
    fetchAllData,
    
    // Brand CRUD
    createBrand,
    updateBrand,
    deleteBrand,
    
    // Device Model CRUD
    createDeviceModel,
    updateDeviceModel,
    deleteDeviceModel,
    
    // Repair Type CRUD
    createRepairType,
    updateRepairType,
    deleteRepairType
  };
};
