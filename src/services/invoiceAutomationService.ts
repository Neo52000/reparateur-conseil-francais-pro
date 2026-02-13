import { supabase } from '@/integrations/supabase/client';
import { ElectronicInvoiceService } from './electronicInvoiceService';

export interface AutomationConfig {
  auto_generate_on_quote_accepted: boolean;
  auto_send_reminders: boolean;
  reminder_days_before_due: number;
  auto_archive_after_days: number;
}

/**
 * Send a notification via the notifications table
 */
async function sendNotification(
  userId: string,
  title: string,
  message: string,
  type: string = 'info'
): Promise<void> {
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      read: false,
    });
  } catch (error) {
    console.error('Erreur envoi notification:', error);
  }
}

export class InvoiceAutomationService {
  /**
   * Automatiser la génération de facture depuis un devis validé
   */
  static async autoGenerateFromQuote(quoteId: string): Promise<boolean> {
    try {
      const { data: quote, error: quoteError } = await supabase
        .from('quotes_with_timeline')
        .select('*')
        .eq('id', quoteId)
        .eq('status', 'accepted')
        .single();

      if (quoteError || !quote) return false;

      const { data: existingInvoice } = await supabase
        .from('electronic_invoices')
        .select('id')
        .eq('quote_id', quoteId)
        .single();

      if (existingInvoice) return false;

      const invoice = await ElectronicInvoiceService.generateFromQuote(quoteId);
      
      await this.notifyInvoiceGenerated(quote.repairer_id, invoice.invoice_number);
      
      if (await this.isClientB2B(quote.client_id)) {
        await this.scheduleChorusProSubmission(invoice.id);
      }

      return true;
    } catch (error) {
      console.error('Erreur génération automatique facture:', error);
      return false;
    }
  }

  static async isClientB2B(clientId: string): Promise<boolean> {
    try {
      const { data: legalInfo } = await supabase
        .from('repairer_legal_info')
        .select('siret')
        .eq('repairer_id', clientId)
        .single();
      return !!(legalInfo?.siret);
    } catch {
      return false;
    }
  }

  static async scheduleChorusProSubmission(invoiceId: string): Promise<void> {
    try {
      await supabase
        .from('electronic_invoices')
        .update({ 
          status: 'ready_for_chorus_pro',
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId);
    } catch (error) {
      console.error('Erreur programmation Chorus Pro:', error);
    }
  }

  static async processAutomaticReminders(): Promise<void> {
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const { data: invoices } = await supabase
        .from('electronic_invoices')
        .select('*')
        .eq('status', 'sent')
        .lte('due_date', threeDaysFromNow.toISOString().split('T')[0]);

      if (invoices) {
        for (const invoice of invoices) {
          await this.sendPaymentReminder(invoice.id, invoice.client_id);
        }
      }
    } catch (error) {
      console.error('Erreur traitement rappels automatiques:', error);
    }
  }

  static async sendPaymentReminder(invoiceId: string, clientId: string): Promise<void> {
    try {
      await sendNotification(
        clientId,
        'Rappel de paiement',
        `Votre facture arrive bientôt à échéance. Veuillez procéder au paiement.`,
        'payment_reminder'
      );

      await supabase
        .from('electronic_invoices')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', invoiceId);
    } catch (error) {
      console.error('Erreur envoi rappel:', error);
    }
  }

  static async notifyInvoiceGenerated(repairerId: string, invoiceNumber: string): Promise<void> {
    try {
      await sendNotification(
        repairerId,
        'Nouvelle facture générée',
        `La facture ${invoiceNumber} a été générée automatiquement.`,
        'invoice_generated'
      );
    } catch (error) {
      console.error('Erreur notification:', error);
    }
  }

  static async processChorusProQueue(): Promise<void> {
    try {
      const { data: invoices } = await supabase
        .from('electronic_invoices')
        .select('*')
        .eq('status', 'ready_for_chorus_pro')
        .is('chorus_pro_status', null);

      if (invoices) {
        for (const invoice of invoices) {
          const hasLegalInfo = await this.hasCompleteLegalInfo(invoice.repairer_id);
          if (hasLegalInfo) {
            await ElectronicInvoiceService.submitToChorusPro(invoice.id);
          } else {
            await this.notifyMissingLegalInfo(invoice.repairer_id);
          }
        }
      }
    } catch (error) {
      console.error('Erreur traitement queue Chorus Pro:', error);
    }
  }

  static async hasCompleteLegalInfo(repairerId: string): Promise<boolean> {
    try {
      const { data: legalInfo } = await supabase
        .from('repairer_legal_info')
        .select('siret, tva_number')
        .eq('repairer_id', repairerId)
        .single();
      return !!(legalInfo?.siret);
    } catch {
      return false;
    }
  }

  static async notifyMissingLegalInfo(repairerId: string): Promise<void> {
    try {
      await sendNotification(
        repairerId,
        'Informations légales manquantes',
        'Veuillez compléter vos informations légales (SIRET, TVA) pour activer la facturation électronique Chorus Pro.',
        'missing_legal_info'
      );
    } catch (error) {
      console.error('Erreur notification infos légales:', error);
    }
  }

  static async autoArchiveOldInvoices(): Promise<void> {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      await supabase
        .from('electronic_invoices')
        .update({ 
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('status', 'paid')
        .lt('invoice_date', sixMonthsAgo.toISOString());
    } catch (error) {
      console.error('Erreur archivage automatique:', error);
    }
  }
}
