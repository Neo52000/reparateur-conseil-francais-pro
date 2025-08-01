import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: any;
  website?: string;
  contact_person?: string;
  city?: string;
  country?: string;
  payment_terms?: string;
  delivery_time_days?: number;
  delivery_delay_days?: number;
  minimum_order_amount?: number;
  discount_percentage?: number;
  rating?: number;
  is_active: boolean;
  repairer_id: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  repairer_id: string;
  status: string;
  order_date: string;
  expected_delivery?: string;
  total_amount_ttc?: number;
  total_amount_ht?: number;
  notes?: string;
  auto_generated?: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  inventory_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  received_quantity?: number;
  inventory_item?: any;
}

export interface SupplierProduct {
  id: string;
  supplier_id: string;
  inventory_item_id: string;
  supplier_sku?: string;
  supplier_price: number;
  minimum_quantity?: number;
  lead_time_days?: number;
  is_preferred: boolean;
  last_price_update?: string;
}

export const useSupplierManagement = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('parts_suppliers')
        .select('*')
        .order('name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les fournisseurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:parts_suppliers(*),
          items:purchase_order_items(
            *,
            inventory_item:pos_inventory_items(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchaseOrders(data || []);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes",
        variant: "destructive",
      });
    }
  };

  const createSupplier = async (supplier: Partial<Supplier>) => {
    try {
      const { data, error } = await supabase
        .from('parts_suppliers')
        .insert({
          ...supplier,
          repairer_id: supplier.repairer_id || 'current_user_id' // This should come from auth context
        })
        .select()
        .single();

      if (error) throw error;

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

  const createPurchaseOrder = async (order: Partial<PurchaseOrder>, items: Partial<PurchaseOrderItem>[]) => {
    try {
      // Generate order number
      const orderNumber = `PO-${Date.now()}`;
      
      const { data: orderData, error: orderError } = await supabase
        .from('purchase_orders')
        .insert({
          ...order,
          order_number: orderNumber,
          repairer_id: order.repairer_id || 'current_user_id',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Add items
      const itemsWithOrderId = items.map(item => ({
        ...item,
        purchase_order_id: orderData.id,
        total_price: (item.quantity || 0) * (item.unit_price || 0),
      }));

      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(itemsWithOrderId);

      if (itemsError) throw itemsError;

      toast({
        title: "Succès",
        description: "Commande créée avec succès",
      });

      await fetchPurchaseOrders();
      return orderData;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la commande",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePurchaseOrderStatus = async (orderId: string, status: PurchaseOrder['status']) => {
    try {
      const { error } = await supabase
        .from('purchase_orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Statut mis à jour",
      });

      await fetchPurchaseOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
      throw error;
    }
  };

  const receiveOrder = async (orderId: string, receivedItems: { itemId: string; receivedQuantity: number }[]) => {
    try {
      // Update received quantities
      for (const item of receivedItems) {
        const { error } = await supabase
          .from('purchase_order_items')
          .update({ received_quantity: item.receivedQuantity })
          .eq('id', item.itemId);

        if (error) throw error;
      }

      // Update order status
      await updatePurchaseOrderStatus(orderId, 'received');

      // Update inventory stock levels
      const { data: orderItems, error: fetchError } = await supabase
        .from('purchase_order_items')
        .select('inventory_item_id, received_quantity')
        .eq('purchase_order_id', orderId);

      if (fetchError) throw fetchError;

      for (const item of orderItems) {
        if (item.received_quantity) {
          const { error: stockError } = await supabase.rpc('increment_stock', {
            item_id: item.inventory_item_id,
            quantity: item.received_quantity
          });

          if (stockError) console.error('Error updating stock:', stockError);
        }
      }

      toast({
        title: "Succès",
        description: "Réception enregistrée et stock mis à jour",
      });

    } catch (error) {
      console.error('Error receiving order:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la réception",
        variant: "destructive",
      });
      throw error;
    }
  };

  const generateAutoOrder = async (itemId: string) => {
    try {
      // Get preferred supplier for this item
      const { data: supplierProduct, error } = await supabase
        .from('supplier_products')
        .select(`
          *,
          supplier:parts_suppliers(*),
          inventory_item:pos_inventory_items(*)
        `)
        .eq('inventory_item_id', itemId)
        .eq('is_preferred', true)
        .single();

      if (error || !supplierProduct) {
        toast({
          title: "Attention",
          description: "Aucun fournisseur préféré configuré pour ce produit",
          variant: "destructive",
        });
        return;
      }

      const item = supplierProduct.inventory_item;
      const quantityToOrder = Math.max(
        (item.minimum_stock || 0) * 3 - item.current_stock,
        supplierProduct.minimum_quantity || 1
      );

      // Create auto purchase order
      await createPurchaseOrder(
        {
          supplier_id: supplierProduct.supplier_id,
          status: 'draft',
          order_date: new Date().toISOString(),
          total_amount: quantityToOrder * supplierProduct.supplier_price,
          notes: 'Commande générée automatiquement'
        },
        [{
          inventory_item_id: itemId,
          quantity: quantityToOrder,
          unit_price: supplierProduct.supplier_price
        }]
      );

    } catch (error) {
      console.error('Error generating auto order:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la commande automatique",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchPurchaseOrders();
  }, []);

  return {
    suppliers,
    purchaseOrders,
    loading,
    fetchSuppliers,
    fetchPurchaseOrders,
    createSupplier,
    createPurchaseOrder,
    updatePurchaseOrderStatus,
    receiveOrder,
    generateAutoOrder,
  };
};