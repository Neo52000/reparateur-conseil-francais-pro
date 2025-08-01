import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types simplifiés pour éviter les problèmes de compilation
export interface SimpleInventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  current_stock: number;
  minimum_stock?: number;
  selling_price?: number;
  cost_price?: number;
  margin_percentage?: number;
  is_ecommerce_active: boolean;
  requires_intervention: boolean;
  image_url?: string;
  repairer_id: string;
  created_at: string;
  updated_at: string;
}

export interface SimpleCategory {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface SimpleSupplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  repairer_id: string;
}

export const useSimpleInventory = () => {
  const [inventory, setInventory] = useState<SimpleInventoryItem[]>([]);
  const [categories, setCategories] = useState<SimpleCategory[]>([]);
  const [suppliers, setSuppliers] = useState<SimpleSupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pos_inventory_items')
        .select('*')
        .order('name');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Fetched inventory:', data);
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'inventaire",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Categories error:', error);
        throw error;
      }
      
      console.log('Fetched categories:', data);
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('parts_suppliers')
        .select('id, name, email, phone, is_active, repairer_id')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Suppliers error:', error);
        throw error;
      }
      
      console.log('Fetched suppliers:', data);
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const createProduct = async (product: Partial<SimpleInventoryItem>) => {
    try {
      console.log('Creating product:', product);
      
      const productData = {
        name: product.name || '',
        sku: product.sku || `SKU-${Date.now()}`,
        description: product.description,
        brand: product.brand,
        model: product.model,
        current_stock: product.current_stock || 0,
        minimum_stock: product.minimum_stock || 0,
        selling_price: product.selling_price || 0,
        cost_price: product.cost_price || 0,
        margin_percentage: product.margin_percentage,
        is_ecommerce_active: product.is_ecommerce_active || false,
        requires_intervention: product.requires_intervention || false,
        image_url: product.image_url,
        repairer_id: 'current_user_id' // À remplacer par l'ID réel de l'utilisateur
      };

      const { data, error } = await supabase
        .from('pos_inventory_items')
        .insert(productData)
        .select()
        .single();

      if (error) {
        console.error('Create product error:', error);
        throw error;
      }

      console.log('Product created:', data);

      toast({
        title: "Succès",
        description: "Produit créé avec succès",
      });

      await fetchInventory();
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le produit",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<SimpleInventoryItem>) => {
    try {
      console.log('Updating product:', id, updates);
      
      const { error } = await supabase
        .from('pos_inventory_items')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Update product error:', error);
        throw error;
      }

      toast({
        title: "Succès",
        description: "Produit mis à jour",
      });

      await fetchInventory();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le produit",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      console.log('Deleting product:', id);
      
      const { error } = await supabase
        .from('pos_inventory_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete product error:', error);
        throw error;
      }

      toast({
        title: "Succès",
        description: "Produit supprimé",
      });

      await fetchInventory();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createSupplier = async (supplier: Partial<SimpleSupplier>) => {
    try {
      console.log('Creating supplier:', supplier);
      
      const supplierData = {
        name: supplier.name || '',
        email: supplier.email,
        phone: supplier.phone,
        is_active: true,
        repairer_id: 'current_user_id'
      };

      const { data, error } = await supabase
        .from('parts_suppliers')
        .insert(supplierData)
        .select('id, name, email, phone, is_active, repairer_id')
        .single();

      if (error) {
        console.error('Create supplier error:', error);
        throw error;
      }

      console.log('Supplier created:', data);

      toast({
        title: "Succès",
        description: "Fournisseur créé avec succès",
      });

      await fetchSuppliers();
      return data;
    } catch (error) {
      console.error('Error creating supplier:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le fournisseur",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    console.log('Initializing simple inventory hook');
    fetchInventory();
    fetchCategories();
    fetchSuppliers();
  }, []);

  return {
    inventory,
    categories,
    suppliers,
    loading,
    fetchInventory,
    createProduct,
    updateProduct,
    deleteProduct,
    createSupplier,
  };
};