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
  // Relations
  device_type?: {
    id: string;
    name: string;
    description?: string;
  };
  brand?: {
    id: string;
    name: string;
    logo_url?: string;
  };
  device_model?: {
    id: string;
    name: string;
    brand_id: string;
    device_type_id: string;
    release_year?: number;
    image_url?: string;
  };
  initial_condition?: {
    id: string;
    name: string;
    description?: string;
    color: string;
  };
  current_condition?: {
    id: string;
    name: string;
    description?: string;
    color: string;
  };
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
      
      // Enrichir les données avec les relations
      const enrichedData = await Promise.all((data || []).map(async (order: any) => {
        if (order.device) {
          // Récupérer les relations séparément
          const [deviceType, brand, deviceModel, initialCondition, currentCondition] = await Promise.all([
            order.device.device_type_id ? supabase.from('device_types').select('id, name, description').eq('id', order.device.device_type_id).single() : null,
            order.device.brand_id ? supabase.from('brands').select('id, name, logo_url').eq('id', order.device.brand_id).single() : null,
            order.device.device_model_id ? supabase.from('device_models').select('id, name, brand_id, device_type_id, release_year, image_url').eq('id', order.device.device_model_id).single() : null,
            order.device.initial_condition_id ? supabase.from('device_conditions').select('id, name, description, color').eq('id', order.device.initial_condition_id).single() : null,
            order.device.current_condition_id ? supabase.from('device_conditions').select('id, name, description, color').eq('id', order.device.current_condition_id).single() : null,
          ]);

          order.device.device_type = deviceType?.data || null;
          order.device.brand = brand?.data || null;
          order.device.device_model = deviceModel?.data || null;
          order.device.initial_condition = initialCondition?.data || null;
          order.device.current_condition = currentCondition?.data || null;
        }
        return order;
      }));
      
      setRepairOrders(enrichedData as RepairOrder[]);
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
    console.log('🔧 [RepairManagement] Starting createRepairOrder...');
    
    // Vérification de l'authentification
    if (!user?.id) {
      console.error('❌ [RepairManagement] No authenticated user found');
      toast({
        title: 'Erreur d\'authentification',
        description: 'Vous devez être connecté pour créer un ordre de réparation.',
        variant: 'destructive',
      });
      return null;
    }

    console.log('✅ [RepairManagement] User authenticated:', { userId: user.id });
    console.log('📝 [RepairManagement] Device data received:', JSON.stringify(deviceData, null, 2));

    try {
      // Préparer les données pour l'insertion
      const deviceInsertData = {
        repairer_id: user.id,
        device_type_id: deviceData.device_type_id || null,
        brand_id: deviceData.brand_id || null,
        device_model_id: deviceData.device_model_id || null,
        imei_serial: deviceData.imei_serial || null,
        custom_device_info: deviceData.custom_device_info || null,
        initial_condition_id: deviceData.initial_condition_id || null,
        pin_code: deviceData.pin_code || null,
        sim_code: deviceData.sim_code || null,
        lock_pattern: deviceData.lock_pattern || null,
        security_notes: deviceData.security_notes || null,
        customer_name: deviceData.customer_name || '',
        customer_phone: deviceData.customer_phone || null,
        customer_phone_fixed: deviceData.customer_phone_fixed || null,
        customer_email: deviceData.customer_email || null,
        customer_notes: deviceData.customer_notes || null,
        initial_diagnosis: deviceData.initial_diagnosis || null,
        estimated_cost: deviceData.estimated_cost || null,
        estimated_duration_hours: deviceData.estimated_duration_hours || null,
        intake_date: new Date().toISOString(),
        photos: deviceData.photos || [],
        accessories: deviceData.accessories || [],
      };

      console.log('📦 [RepairManagement] Prepared device insert data:', JSON.stringify(deviceInsertData, null, 2));
      
      // Étape 1: Créer le device
      console.log('🔄 [RepairManagement] Inserting device into repair_devices...');
      const { data: device, error: deviceError } = await supabase
        .from('repair_devices')
        .insert(deviceInsertData)
        .select()
        .single();

      if (deviceError) {
        console.error('❌ [RepairManagement] Device creation failed:', {
          error: deviceError,
          message: deviceError.message,
          details: deviceError.details,
          hint: deviceError.hint,
          code: deviceError.code,
        });
        throw new Error(`Erreur lors de la création du device: ${deviceError.message} (Code: ${deviceError.code})`);
      }

      if (!device) {
        console.error('❌ [RepairManagement] Device created but no data returned');
        throw new Error('Device créé mais aucune donnée retournée');
      }

      console.log('✅ [RepairManagement] Device created successfully:', {
        deviceId: device.id,
        device: device
      });

      // Étape 2: Créer l'ordre de réparation
      const orderInsertData = {
        device_id: device.id,
        repairer_id: user.id,
        status: 'diagnostic' as RepairStatus,
        priority: 1,
        time_spent_minutes: 0,
        // order_number sera auto-généré par le trigger
      };

      console.log('📦 [RepairManagement] Prepared order insert data:', JSON.stringify(orderInsertData, null, 2));
      console.log('🔄 [RepairManagement] Inserting order into repair_orders...');

      const { data: order, error: orderError } = await supabase
        .from('repair_orders')
        .insert(orderInsertData)
        .select()
        .single();

      if (orderError) {
        console.error('❌ [RepairManagement] Order creation failed:', {
          error: orderError,
          message: orderError.message,
          details: orderError.details,
          hint: orderError.hint,
          code: orderError.code,
        });
        
        // Essayer de nettoyer le device créé si l'ordre échoue
        console.log('🧹 [RepairManagement] Cleaning up created device...');
        try {
          await supabase.from('repair_devices').delete().eq('id', device.id);
          console.log('✅ [RepairManagement] Device cleanup successful');
        } catch (cleanupError) {
          console.error('❌ [RepairManagement] Device cleanup failed:', cleanupError);
        }
        
        throw new Error(`Erreur lors de la création de l'ordre: ${orderError.message} (Code: ${orderError.code})`);
      }

      if (!order) {
        console.error('❌ [RepairManagement] Order created but no data returned');
        throw new Error('Ordre créé mais aucune donnée retournée');
      }

      console.log('✅ [RepairManagement] Order created successfully:', {
        orderId: order.id,
        orderNumber: order.order_number,
        order: order
      });

      // Rafraîchir la liste des ordres
      console.log('🔄 [RepairManagement] Refreshing repair orders list...');
      await fetchRepairOrders();
      
      toast({
        title: 'Ordre de réparation créé',
        description: `Numéro: ${order.order_number || order.id}`,
      });

      console.log('✅ [RepairManagement] createRepairOrder completed successfully');
      return order;

    } catch (error) {
      console.error('❌ [RepairManagement] createRepairOrder failed with error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      let errorMessage = 'Une erreur inattendue s\'est produite';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Si c'est un objet d'erreur Supabase
        const supabaseError = error as any;
        if (supabaseError.message) {
          errorMessage = supabaseError.message;
        }
        if (supabaseError.details) {
          errorMessage += ` (Détails: ${supabaseError.details})`;
        }
      }
      
      toast({
        title: 'Erreur',
        description: errorMessage,
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
    } else {
      setLoading(false);
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