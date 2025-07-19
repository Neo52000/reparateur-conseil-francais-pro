import { supabase } from '@/integrations/supabase/client';

export interface PaymentMethod {
  id: string;
  repairer_id: string;
  method_type: 'cash' | 'card' | 'mobile_pay' | 'bank_transfer' | 'check' | 'crypto';
  method_name: string;
  configuration: Record<string, any>;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  transaction_id: string;
  payment_method_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  stripe_payment_intent_id?: string;
  reference_number?: string;
  metadata?: Record<string, any>;
}

export interface StripeTerminalConfig {
  publishable_key: string;
  location_id: string;
  reader_id?: string;
}

export class PaymentIntegrationService {
  /**
   * Obtenir les moyens de paiement configurés pour un réparateur
   */
  static async getPaymentMethods(repairerId: string): Promise<PaymentMethod[]> {
    try {
      const { data, error } = await supabase
        .from('pos_payment_methods')
        .select('*')
        .eq('repairer_id', repairerId)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération moyens de paiement:', error);
      throw error;
    }
  }

  /**
   * Configurer un nouveau moyen de paiement
   */
  static async configurePaymentMethod(repairerId: string, methodData: Omit<PaymentMethod, 'id' | 'repairer_id' | 'created_at' | 'updated_at'>): Promise<PaymentMethod> {
    try {
      const { data, error } = await supabase
        .from('pos_payment_methods')
        .insert({
          repairer_id: repairerId,
          ...methodData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur configuration moyen de paiement:', error);
      throw error;
    }
  }

  /**
   * Créer un paiement Stripe Terminal pour paiement sans contact
   */
  static async createStripeTerminalPayment(
    repairerId: string,
    amount: number,
    currency: string = 'eur',
    description?: string
  ): Promise<{ client_secret: string; payment_intent_id: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('create-terminal-payment', {
        body: {
          repairer_id: repairerId,
          amount: Math.round(amount * 100), // Centimes
          currency,
          description,
          payment_method_types: ['card_present'],
          capture_method: 'automatic'
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur création paiement terminal:', error);
      throw error;
    }
  }

  /**
   * Traiter un paiement mobile (Apple Pay, Google Pay)
   */
  static async processMobilePayment(
    repairerId: string,
    amount: number,
    paymentMethodId: string,
    currency: string = 'eur'
  ): Promise<{ success: boolean; payment_intent_id: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('process-mobile-payment', {
        body: {
          repairer_id: repairerId,
          amount: Math.round(amount * 100),
          payment_method_id: paymentMethodId,
          currency,
          confirmation_method: 'automatic'
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur traitement paiement mobile:', error);
      throw error;
    }
  }

  /**
   * Traiter un paiement en espèces
   */
  static async processCashPayment(
    transactionId: string,
    amount: number,
    received: number,
    change: number
  ): Promise<{ success: boolean; receipt_data: any }> {
    try {
      // Enregistrer la transaction en espèces
      const { data, error } = await supabase
        .from('pos_cash_transactions')
        .insert({
          transaction_id: transactionId,
          amount_due: amount,
          amount_received: received,
          change_given: change,
          processed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        receipt_data: data
      };
    } catch (error) {
      console.error('Erreur traitement paiement espèces:', error);
      throw error;
    }
  }

  /**
   * Effectuer un remboursement
   */
  static async processRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<{ success: boolean; refund_id: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('process-refund', {
        body: {
          payment_intent_id: paymentIntentId,
          amount: amount ? Math.round(amount * 100) : undefined,
          reason: reason || 'requested_by_customer'
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur traitement remboursement:', error);
      throw error;
    }
  }

  /**
   * Obtenir l'état d'un paiement
   */
  static async getPaymentStatus(paymentIntentId: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('get-payment-status', {
        body: { payment_intent_id: paymentIntentId }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération statut paiement:', error);
      throw error;
    }
  }

  /**
   * Configurer Stripe Terminal pour un réparateur
   */
  static async setupStripeTerminal(repairerId: string, config: StripeTerminalConfig): Promise<void> {
    try {
      await this.configurePaymentMethod(repairerId, {
        method_type: 'card',
        method_name: 'Stripe Terminal',
        configuration: config,
        is_active: true,
        display_order: 1
      });
    } catch (error) {
      console.error('Erreur configuration Stripe Terminal:', error);
      throw error;
    }
  }

  /**
   * Activer Apple Pay/Google Pay
   */
  static async enableMobilePayments(repairerId: string): Promise<void> {
    try {
      const mobileMethods = [
        {
          method_type: 'mobile_pay' as const,
          method_name: 'Apple Pay',
          configuration: { provider: 'stripe', enabled: true },
          is_active: true,
          display_order: 2
        },
        {
          method_type: 'mobile_pay' as const,
          method_name: 'Google Pay',
          configuration: { provider: 'stripe', enabled: true },
          is_active: true,
          display_order: 3
        }
      ];

      await Promise.all(
        mobileMethods.map(method => 
          this.configurePaymentMethod(repairerId, method)
        )
      );
    } catch (error) {
      console.error('Erreur activation paiements mobiles:', error);
      throw error;
    }
  }

  /**
   * Initialiser les moyens de paiement par défaut
   */
  static async initializeDefaultPaymentMethods(repairerId: string): Promise<void> {
    try {
      const defaultMethods = [
        {
          method_type: 'cash' as const,
          method_name: 'Espèces',
          configuration: {},
          is_active: true,
          display_order: 0
        },
        {
          method_type: 'card' as const,
          method_name: 'Carte bancaire',
          configuration: { provider: 'stripe' },
          is_active: true,
          display_order: 1
        }
      ];

      await Promise.all(
        defaultMethods.map(method => 
          this.configurePaymentMethod(repairerId, method)
        )
      );
    } catch (error) {
      console.error('Erreur initialisation moyens de paiement:', error);
      throw error;
    }
  }

  /**
   * Valider la conformité PCI-DSS
   */
  static async validatePCICompliance(repairerId: string): Promise<{ compliant: boolean; issues: string[] }> {
    try {
      const { data, error } = await supabase.functions.invoke('validate-pci-compliance', {
        body: { repairer_id: repairerId }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur validation conformité PCI:', error);
      return { compliant: false, issues: ['Erreur de validation'] };
    }
  }
}