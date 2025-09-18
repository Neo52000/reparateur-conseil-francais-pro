import { supabase } from '@/integrations/supabase/client';
import { ElectronicInvoiceService } from './electronicInvoiceService';

export interface AutomationConfig {
  auto_generate_on_quote_accepted: boolean;
  auto_send_reminders: boolean;
  reminder_days_before_due: number;
  auto_archive_after_days: number;
}

export class InvoiceAutomationService {
  /**
   * Automatiser la génération de facture depuis un devis validé
   */
  static async autoGenerateFromQuote(quoteId: string): Promise<boolean> {
    try {
      // Vérifier que le devis est dans un état valide
      const { data: quote, error: quoteError } = await supabase
        .from('quotes_with_timeline')
        .select('*')
        .eq('id', quoteId)
        .eq('status', 'accepted')
        .single();

      if (quoteError || !quote) {
        console.log('Devis non trouvé ou non accepté');
        return false;
      }

      // Vérifier qu'une facture n'existe pas déjà
      const { data: existingInvoice } = await supabase
        .from('electronic_invoices')
        .select('id')
        .eq('quote_id', quoteId)
        .single();

      if (existingInvoice) {
        console.log('Facture déjà générée pour ce devis');
        return false;
      }

      // Générer la facture électronique
      const invoice = await ElectronicInvoiceService.generateFromQuote(quoteId);
      
      // Notifier le réparateur
      await this.notifyInvoiceGenerated(quote.repairer_id, invoice.invoice_number);
      
      // Si client B2B, programmer soumission Chorus Pro
      if (await this.isClientB2B(quote.client_id)) {
        await this.scheduleChorusProSubmission(invoice.id);
      }

      return true;
    } catch (error) {
      console.error('Erreur génération automatique facture:', error);
      return false;
    }
  }

  /**
   * Vérifier si un client est B2B (a un SIRET)
   */
  static async isClientB2B(clientId: string): Promise<boolean> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('siret_number')
        .eq('id', clientId)
        .single();

      return !!(profile?.siret_number);
    } catch {
      return false;
    }
  }

  /**
   * Programmer la soumission à Chorus Pro
   */
  static async scheduleChorusProSubmission(invoiceId: string): Promise<void> {
    try {
      // Marquer la facture pour soumission automatique
      await supabase
        .from('electronic_invoices')
        .update({ 
          status: 'ready_for_chorus_pro',
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      console.log(`Facture ${invoiceId} programmée pour Chorus Pro`);
    } catch (error) {
      console.error('Erreur programmation Chorus Pro:', error);
    }
  }

  /**
   * Envoyer des rappels automatiques
   */
  static async processAutomaticReminders(): Promise<void> {
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      // Trouver les factures avec échéance dans 3 jours
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

  /**
   * Envoyer un rappel de paiement
   */
  static async sendPaymentReminder(invoiceId: string, clientId: string): Promise<void> {
    try {
      // Créer une notification pour le client
      await supabase
        .from('notification_queue')
        .insert({
          recipient_id: clientId,
          type: 'payment_reminder',
          title: 'Rappel de paiement',
          message: `Votre facture arrive à échéance dans 3 jours.`,
          data: { invoice_id: invoiceId },
          scheduled_for: new Date().toISOString()
        });

      console.log(`Rappel envoyé pour facture ${invoiceId}`);
    } catch (error) {
      console.error('Erreur envoi rappel:', error);
    }
  }

  /**
   * Notifier la génération d'une facture
   */
  static async notifyInvoiceGenerated(repairerId: string, invoiceNumber: string): Promise<void> {
    try {
      await supabase
        .from('notification_queue')
        .insert({
          recipient_id: repairerId,
          type: 'invoice_generated',
          title: 'Facture générée automatiquement',
          message: `La facture ${invoiceNumber} a été générée depuis un devis accepté.`,
          data: { invoice_number: invoiceNumber },
          scheduled_for: new Date().toISOString()
        });
    } catch (error) {
      console.error('Erreur notification:', error);
    }
  }

  /**
   * Traiter les factures en attente de Chorus Pro
   */
  static async processChorusProQueue(): Promise<void> {
    try {
      const { data: invoices } = await supabase
        .from('electronic_invoices')
        .select('*')
        .eq('status', 'ready_for_chorus_pro')
        .is('chorus_pro_status', null);

      if (invoices) {
        for (const invoice of invoices) {
          // Vérifier que les infos légales sont complètes
          const hasLegalInfo = await this.hasCompleteLegalInfo(invoice.repairer_id);
          
          if (hasLegalInfo) {
            await ElectronicInvoiceService.submitToChorusPro(invoice.id);
          } else {
            // Notifier le réparateur des infos manquantes
            await this.notifyMissingLegalInfo(invoice.repairer_id);
          }
        }
      }
    } catch (error) {
      console.error('Erreur traitement queue Chorus Pro:', error);
    }
  }

  /**
   * Vérifier si les informations légales sont complètes
   */
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

  /**
   * Notifier des informations légales manquantes
   */
  static async notifyMissingLegalInfo(repairerId: string): Promise<void> {
    try {
      await supabase
        .from('notification_queue')
        .insert({
          recipient_id: repairerId,
          type: 'missing_legal_info',
          title: 'Informations légales manquantes',
          message: 'Complétez vos informations légales pour pouvoir soumettre à Chorus Pro.',
          data: { action: 'configure_legal_info' },
          scheduled_for: new Date().toISOString()
        });
    } catch (error) {
      console.error('Erreur notification infos légales:', error);
    }
  }

  /**
   * Archiver automatiquement les factures anciennes
   */
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

      console.log('Archivage automatique des factures terminé');
    } catch (error) {
      console.error('Erreur archivage automatique:', error);
    }
  }
}