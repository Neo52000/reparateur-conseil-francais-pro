import { supabase } from '@/integrations/supabase/client';

export interface POSCustomer {
  id: string;
  repairer_id: string;
  customer_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: any;
  loyalty_status: string;
  loyalty_points: number;
  preferred_contact: string;
  marketing_consent: boolean;
  private_notes?: string;
  tags?: string[];
  total_orders: number;
  total_spent: number;
  last_visit_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerCreateData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: POSCustomer['address'];
  preferred_contact?: POSCustomer['preferred_contact'];
  marketing_consent?: boolean;
  private_notes?: string;
  tags?: string[];
}

export class CustomerService {
  /**
   * Rechercher des clients par nom, email ou téléphone
   */
  static async searchCustomers(repairerId: string, query: string): Promise<POSCustomer[]> {
    try {
      const { data, error } = await supabase
        .from('pos_customers')
        .select('*')
        .eq('repairer_id', repairerId)
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('last_visit_date', { ascending: false, nullsFirst: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur recherche clients:', error);
      throw error;
    }
  }

  /**
   * Obtenir tous les clients d'un réparateur
   */
  static async getCustomers(repairerId: string, limit = 50, offset = 0): Promise<POSCustomer[]> {
    try {
      const { data, error } = await supabase
        .from('pos_customers')
        .select('*')
        .eq('repairer_id', repairerId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération clients:', error);
      throw error;
    }
  }

  /**
   * Créer un nouveau client
   */
  static async createCustomer(repairerId: string, customerData: CustomerCreateData): Promise<POSCustomer> {
    try {
      const { data, error } = await supabase
        .from('pos_customers')
        .insert({
          repairer_id: repairerId,
          ...customerData,
          customer_number: '',
          loyalty_status: 'standard',
          preferred_contact: customerData.preferred_contact || 'email',
          loyalty_points: 0,
          total_orders: 0,
          total_spent: 0,
          marketing_consent: customerData.marketing_consent || false
        })
        .select()
        .single();

      if (error) throw error;
      return data as POSCustomer;
    } catch (error) {
      console.error('Erreur création client:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un client existant
   */
  static async updateCustomer(customerId: string, updates: Partial<CustomerCreateData>): Promise<POSCustomer> {
    try {
      const { data, error } = await supabase
        .from('pos_customers')
        .update(updates)
        .eq('id', customerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur mise à jour client:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour les statistiques d'un client après une transaction
   */
  static async updateCustomerStats(customerId: string, orderAmount: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('pos_customers')
        .update({
          total_orders: customerId.length, // Placeholder - will be handled by database function
          total_spent: orderAmount,
          last_visit_date: new Date().toISOString()
        })
        .eq('id', customerId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur mise à jour stats client:', error);
      throw error;
    }
  }

  /**
   * Ajouter des points de fidélité
   */
  static async addLoyaltyPoints(customerId: string, points: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('pos_customers')
        .update({
          loyalty_points: points // Placeholder - will be handled by database function
        })
        .eq('id', customerId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur ajout points fidélité:', error);
      throw error;
    }
  }

  /**
   * Obtenir l'historique des transactions d'un client
   */
  static async getCustomerHistory(customerId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('pos_transactions')
        .select(`
          *,
          pos_transaction_items (
            *,
            pos_inventory_items (name, sku)
          )
        `)
        .eq('customer_id', customerId)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur historique client:', error);
      throw error;
    }
  }

  /**
   * Supprimer un client (soft delete)
   */
  static async deleteCustomer(customerId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('pos_customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur suppression client:', error);
      throw error;
    }
  }
}