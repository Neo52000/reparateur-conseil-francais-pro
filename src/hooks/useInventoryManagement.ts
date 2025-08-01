import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EnhancedInventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  custom_description?: string;
  external_reference?: string;
  brand?: string;
  model?: string;
  category_id?: string;
  current_stock: number;
  minimum_stock?: number;
  purchase_price_ht?: number;
  purchase_price_ttc?: number;
  sale_price_ht?: number;
  sale_price_ttc?: number;
  selling_price?: number; // Required by DB schema
  cost_price?: number; // Required by DB schema
  margin_percentage?: number;
  tva_rate?: number;
  ecotax?: number;
  ademe_bonus?: number;
  is_ecommerce_active: boolean;
  requires_intervention: boolean;
  intervention_service_id?: string;
  image_url?: string;
  weight?: number;
  dimensions?: any;
  repairer_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  is_active: boolean;
}

export interface ProductLink {
  id: string;
  primary_product_id: string;
  linked_product_id: string;
  link_type: 'upsell' | 'cross_sell' | 'combo' | 'accessory';
  is_automatic: boolean;
  ai_confidence?: number;
  linked_product?: EnhancedInventoryItem;
}

export const useInventoryManagement = () => {
  const [inventory, setInventory] = useState<EnhancedInventoryItem[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pos_inventory_items')
        .select('*')
        .order('name');

      if (error) throw error;
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

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const createProduct = async (product: Partial<EnhancedInventoryItem>) => {
    try {
      // Extract only the fields that exist in the database
      const productData = {
        name: product.name || '',
        sku: product.sku || '',
        description: product.description,
        custom_description: product.custom_description,
        external_reference: product.external_reference,
        brand: product.brand,
        model: product.model,
        category_id: product.category_id,
        current_stock: product.current_stock || 0,
        minimum_stock: product.minimum_stock || 0,
        purchase_price_ht: product.purchase_price_ht || 0,
        purchase_price_ttc: product.purchase_price_ttc || 0,
        sale_price_ht: product.sale_price_ht || 0,
        sale_price_ttc: product.sale_price_ttc || 0,
        selling_price: product.sale_price_ttc || 0, // Map to DB field
        cost_price: product.purchase_price_ttc || 0, // Map to DB field
        margin_percentage: product.margin_percentage,
        tva_rate: product.tva_rate || 20,
        ecotax: product.ecotax || 0,
        ademe_bonus: product.ademe_bonus || 0,
        is_ecommerce_active: product.is_ecommerce_active || false,
        requires_intervention: product.requires_intervention || false,
        intervention_service_id: product.intervention_service_id,
        image_url: product.image_url,
        weight: product.weight || 0,
        dimensions: product.dimensions || {},
        repairer_id: product.repairer_id || ''
      };

      const { data, error } = await supabase
        .from('pos_inventory_items')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;

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

  const updateProduct = async (id: string, updates: Partial<EnhancedInventoryItem>) => {
    try {
      const { error } = await supabase
        .from('pos_inventory_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

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
      const { error } = await supabase
        .from('pos_inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

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

  const getProductLinks = async (productId: string): Promise<ProductLink[]> => {
    try {
      const { data, error } = await supabase
        .from('product_links')
        .select(`
          *,
          linked_product:pos_inventory_items!linked_product_id(*)
        `)
        .eq('primary_product_id', productId);

      if (error) throw error;
      
      // Transform the data to match our ProductLink interface
      const transformedData = (data || []).map(item => ({
        id: item.id,
        primary_product_id: item.primary_product_id,
        linked_product_id: item.linked_product_id,
        link_type: item.link_type as 'upsell' | 'cross_sell' | 'combo' | 'accessory',
        is_automatic: item.is_automatic,
        ai_confidence: item.ai_confidence,
        linked_product: item.linked_product
      }));
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching product links:', error);
      return [];
    }
  };

  const addProductLink = async (
    primaryProductId: string, 
    linkedProductId: string, 
    linkType: ProductLink['link_type']
  ) => {
    try {
      const { error } = await supabase
        .from('product_links')
        .insert({
          primary_product_id: primaryProductId,
          linked_product_id: linkedProductId,
          link_type: linkType,
          is_automatic: false
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Produit lié ajouté",
      });
    } catch (error) {
      console.error('Error adding product link:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit lié",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeProductLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('product_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Lien produit supprimé",
      });
    } catch (error) {
      console.error('Error removing product link:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le lien",
        variant: "destructive",
      });
      throw error;
    }
  };

  const calculatePricesFromMargin = (purchasePrice: number, marginPercentage: number) => {
    const salePrice = purchasePrice * (1 + marginPercentage / 100);
    return {
      sale_price_ht: Math.round(salePrice * 100) / 100,
      sale_price_ttc: Math.round(salePrice * 1.2 * 100) / 100, // Assuming 20% VAT
    };
  };

  useEffect(() => {
    fetchInventory();
    fetchCategories();
  }, []);

  return {
    inventory,
    categories,
    loading,
    fetchInventory,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductLinks,
    addProductLink,
    removeProductLink,
    calculatePricesFromMargin,
  };
};