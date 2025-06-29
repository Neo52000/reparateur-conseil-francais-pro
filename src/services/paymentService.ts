
import { supabase } from '@/integrations/supabase/client';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  client_secret?: string;
}

export interface PaymentData {
  quoteId: string;
  repairerId: string;
  clientId: string;
  amount: number;
  description: string;
  holdFunds?: boolean; // Pour la rétention de fonds
}

export class PaymentService {
  /**
   * Créer un intention de paiement avec rétention de fonds
   */
  static async createPaymentIntent(paymentData: PaymentData): Promise<PaymentIntent> {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          ...paymentData,
          // Rétention de fonds par défaut pour les réparations
          transfer_group: `repair_${paymentData.quoteId}`,
          application_fee_amount: Math.round(paymentData.amount * 0.05), // 5% de commission
          on_behalf_of: paymentData.repairerId,
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur création payment intent:', error);
      throw error;
    }
  }

  /**
   * Confirmer le paiement après validation du travail
   */
  static async confirmPayment(paymentIntentId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('confirm-payment', {
        body: { payment_intent_id: paymentIntentId }
      });

      if (error) throw error;
      return data.success;
    } catch (error) {
      console.error('Erreur confirmation paiement:', error);
      throw error;
    }
  }

  /**
   * Rembourser un paiement en cas de litige
   */
  static async refundPayment(paymentIntentId: string, reason?: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('refund-payment', {
        body: { 
          payment_intent_id: paymentIntentId,
          reason: reason || 'requested_by_customer'
        }
      });

      if (error) throw error;
      return data.success;
    } catch (error) {
      console.error('Erreur remboursement:', error);
      throw error;
    }
  }

  /**
   * Récupérer l'historique des paiements pour un utilisateur
   */
  static async getPaymentHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .or(`client_id.eq.${userId},repairer_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération historique:', error);
      return [];
    }
  }
}
