import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export type RepairStatus = 
  | 'diagnostic' 
  | 'quote_pending' 
  | 'quote_accepted' 
  | 'in_progress' 
  | 'waiting_parts' 
  | 'testing' 
  | 'completed' 
  | 'ready_pickup' 
  | 'delivered' 
  | 'cancelled' 
  | 'warranty_return';

export interface RepairDevice {
  id: string;
  repairer_id: string;
  device_type_id?: string;
  brand_id?: string;
  device_model_id?: string;
  imei_serial?: string;
  custom_device_info?: string;
  initial_condition_id?: string;
  current_condition_id?: string;
  pin_code?: string;
  sim_code?: string;
  lock_pattern?: string;
  security_notes?: string;
  customer_name: string;
  customer_phone?: string;
  customer_phone_fixed?: string;
  customer_email?: string;
  customer_notes?: string;
  initial_diagnosis?: string;
  estimated_cost?: number;
  estimated_duration_hours?: number;
  intake_date: string;
  estimated_completion?: string;
  actual_completion?: string;
  photos: string[];
  accessories: string[];
  created_at: string;
  updated_at: string;
}

export interface RepairOrder {
  id: string;
  order_number: string;
  repairer_id: string;
  device_id: string;
  status: RepairStatus;
  quote_amount?: number;
  final_amount?: number;
  quote_accepted_at?: string;
  quote_expires_at?: string;
  customer_signature_data?: string;
  customer_signature_date?: string;
  technician_id?: string;
  time_spent_minutes: number;
  started_at?: string;
  completed_at?: string;
  technician_notes?: string;
  internal_notes?: string;
  priority: number;
  created_at: string;
  updated_at: string;
  device?: RepairDevice;
}

export interface DeviceCondition {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  is_active: boolean;
}

export const useRepairManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>([]);
  const [deviceConditions, setDeviceConditions] = useState<DeviceCondition[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch repair orders
  const fetchRepairOrders = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('repair_orders')
        .select(`
          *,
          device:repair_devices(*)
        `)
        .eq('repairer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRepairOrders((data || []) as RepairOrder[]);
    } catch (error) {
      console.error('Error fetching repair orders:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les ordres de réparation.',
        variant: 'destructive',
      });
    }
  };

  // Fetch device conditions
  const fetchDeviceConditions = async () => {
    try {
      const { data, error } = await supabase
        .from('device_conditions')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDeviceConditions(data || []);
    } catch (error) {
      console.error('Error fetching device conditions:', error);
    }
  };

  // Create new repair device and order
  const createRepairOrder = async (deviceData: Partial<RepairDevice>) => {
    if (!user?.id) return null;

    try {
      console.log('Creating repair device with data:', deviceData);
      
      // First create the device - only include fields that exist in the table
      const { data: device, error: deviceError } = await supabase
        .from('repair_devices')
        .insert({
          repairer_id: user.id,
          device_type_id: deviceData.device_type_id,
          brand_id: deviceData.brand_id,
          device_model_id: deviceData.device_model_id,
          imei_serial: deviceData.imei_serial,
          custom_device_info: deviceData.custom_device_info,
          initial_condition_id: deviceData.initial_condition_id,
          pin_code: deviceData.pin_code,
          sim_code: deviceData.sim_code,
          lock_pattern: deviceData.lock_pattern,
          security_notes: deviceData.security_notes,
          customer_name: deviceData.customer_name || '',
          customer_phone: deviceData.customer_phone,
          customer_phone_fixed: deviceData.customer_phone_fixed,
          customer_email: deviceData.customer_email,
          customer_notes: deviceData.customer_notes,
          initial_diagnosis: deviceData.initial_diagnosis,
          estimated_cost: deviceData.estimated_cost,
          estimated_duration_hours: deviceData.estimated_duration_hours,
          intake_date: new Date().toISOString(),
          photos: deviceData.photos || [],
          accessories: deviceData.accessories || [],
        })
        .select()
        .single();

      if (deviceError) {
        console.error('Device creation error:', deviceError);
        throw deviceError;
      }

      console.log('Device created successfully:', device);

      // Then create the repair order  
      const { data: order, error: orderError } = await supabase
        .from('repair_orders')
        .insert({
          device_id: device.id,
          repairer_id: user.id,
          status: 'diagnostic' as RepairStatus,
          priority: 1,
          time_spent_minutes: 0,
          order_number: '', // Will be auto-generated by trigger
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      console.log('Repair order created successfully:', order);

      await fetchRepairOrders();
      
      toast({
        title: 'Ordre de réparation créé',
        description: `Numéro: ${order.order_number}`,
      });

      return order;
    } catch (error) {
      console.error('Error creating repair order:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'ordre de réparation.',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Update repair order status
  const updateRepairStatus = async (orderId: string, status: RepairStatus, updates?: Partial<RepairOrder>) => {
    try {
      const { error } = await supabase
        .from('repair_orders')
        .update({
          status,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .eq('repairer_id', user?.id);

      if (error) throw error;

      await fetchRepairOrders();
      
      toast({
        title: 'Statut mis à jour',
        description: `Ordre de réparation mis à jour vers: ${status}`,
      });
    } catch (error) {
      console.error('Error updating repair status:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut.',
        variant: 'destructive',
      });
    }
  };

  // Get repairs by status
  const getRepairsByStatus = (status: RepairStatus) => {
    return repairOrders.filter(order => order.status === status);
  };

  // Get repairs statistics
  const getRepairStats = () => {
    const totalRepairs = repairOrders.length;
    const inProgress = repairOrders.filter(order => 
      ['in_progress', 'waiting_parts', 'testing'].includes(order.status)
    ).length;
    const completed = repairOrders.filter(order => 
      order.status === 'completed'
    ).length;
    const readyForPickup = repairOrders.filter(order => 
      order.status === 'ready_pickup'
    ).length;

    return {
      totalRepairs,
      inProgress,
      completed,
      readyForPickup,
    };
  };

  useEffect(() => {
    if (user?.id) {
      Promise.all([
        fetchRepairOrders(),
        fetchDeviceConditions(),
      ]).finally(() => setLoading(false));
    }
  }, [user?.id]);

  return {
    repairOrders,
    deviceConditions,
    loading,
    createRepairOrder,
    updateRepairStatus,
    getRepairsByStatus,
    getRepairStats,
    fetchRepairOrders,
  };
};