import { supabase } from '@/integrations/supabase/client';

export interface ElectronicInvoiceData {
  repairer_id: string;
  client_id: string;
  quote_id?: string;
  siret_repairer: string;
  siret_client?: string;
  tva_number_repairer?: string;
  tva_number_client?: string;
  naf_code?: string;
  amount_ht: number;
  amount_ttc: number;
  tva_rate: number;
  tva_amount: number;
  invoice_type?: 'standard' | 'avoir' | 'acompte';
  format_type?: 'factur_x' | 'chorus_pro';
  due_date?: string;
  invoice_number?: string; // Optional since auto-generated
}

export interface ElectronicInvoice {
  id: string;
  invoice_number: string;
  repairer_id: string;
  client_id: string;
  status: string;
  chorus_pro_status?: string;
  amount_ht: number;
  amount_ttc: number;
  tva_rate?: number;
  tva_amount: number;
  invoice_date: string;
  due_date?: string;
  client_name?: string;
  client_siret?: string;
  quote_id?: string;
  factur_x_pdf_path?: string;
  factur_x_xml_path?: string;
  created_at: string;
  updated_at: string;
}

export interface LegalInfo {
  siret: string;
  tva_number?: string;
  naf_code?: string;
  legal_form?: string;
  capital_social?: number;
  rcs_number?: string;
  rcs_city?: string;
  invoice_prefix?: string;
  legal_mentions?: string;
  payment_terms_days?: number;
  late_penalty_rate?: number;
}

export class ElectronicInvoiceService {
  /**
   * Créer une facture électronique conforme
   */
  static async createInvoice(invoiceData: ElectronicInvoiceData): Promise<ElectronicInvoice> {
    try {
      const { data, error } = await supabase
        .from('electronic_invoices')
        .insert(invoiceData as any) // Cast to any to handle auto-generated fields
        .select()
        .single();

      if (error) throw error;
      return data as ElectronicInvoice;
    } catch (error) {
      console.error('Erreur création facture électronique:', error);
      throw error;
    }
  }

  /**
   * Récupérer les factures d'un réparateur
   */
  static async getInvoicesByRepairer(repairerId: string): Promise<ElectronicInvoice[]> {
    try {
      const { data, error } = await supabase
        .from('electronic_invoices')
        .select('*')
        .eq('repairer_id', repairerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ElectronicInvoice[];
    } catch (error) {
      console.error('Erreur récupération factures:', error);
      return [];
    }
  }

  /**
   * Mettre à jour le statut d'une facture
   */
  static async updateInvoiceStatus(
    invoiceId: string, 
    status: string,
    chorusProStatus?: string
  ): Promise<boolean> {
    try {
      const updateData: any = { status };
      if (chorusProStatus) {
        updateData.chorus_pro_status = chorusProStatus;
      }

      const { error } = await supabase
        .from('electronic_invoices')
        .update(updateData)
        .eq('id', invoiceId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur mise à jour statut facture:', error);
      return false;
    }
  }

  /**
   * Générer une facture depuis un devis validé
   */
  static async generateFromQuote(quoteId: string): Promise<ElectronicInvoice> {
    try {
      // Récupérer les détails du devis
      const { data: quote, error: quoteError } = await supabase
        .from('quotes_with_timeline')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (quoteError || !quote) {
        throw new Error('Devis introuvable');
      }

      // Récupérer les infos légales du réparateur
      const { data: legalInfo, error: legalError } = await supabase
        .from('repairer_legal_info')
        .select('*')
        .eq('repairer_id', quote.repairer_id)
        .single();

      if (legalError) {
        throw new Error('Informations légales manquantes. Configurez votre SIRET et TVA.');
      }

      // Calculer les montants TVA
      const amountHT = (quote as any).total_price || (quote as any).price || 0;
      const tvaRate = 20.0; // TVA standard en France
      const tvaAmount = Math.round((amountHT * tvaRate / 100) * 100) / 100;
      const amountTTC = Math.round((amountHT + tvaAmount) * 100) / 100;

      const invoiceData: ElectronicInvoiceData = {
        repairer_id: quote.repairer_id,
        client_id: quote.client_id,
        quote_id: quoteId,
        siret_repairer: legalInfo.siret,
        tva_number_repairer: legalInfo.tva_number,
        naf_code: legalInfo.naf_code,
        amount_ht: amountHT,
        amount_ttc: amountTTC,
        tva_rate: tvaRate,
        tva_amount: tvaAmount,
        due_date: new Date(Date.now() + (legalInfo.payment_terms_days || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      return await this.createInvoice(invoiceData);
    } catch (error) {
      console.error('Erreur génération facture depuis devis:', error);
      throw error;
    }
  }

  /**
   * Gérer les informations légales du réparateur
   */
  static async updateLegalInfo(repairerId: string, legalInfo: LegalInfo): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('repairer_legal_info')
        .upsert({
          repairer_id: repairerId,
          ...legalInfo
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur mise à jour infos légales:', error);
      return false;
    }
  }

  /**
   * Récupérer les informations légales d'un réparateur
   */
  static async getLegalInfo(repairerId: string): Promise<LegalInfo | null> {
    try {
      if (!repairerId) {
        throw new Error('ID du réparateur requis');
      }

      const { data, error } = await supabase
        .from('repairer_legal_info')
        .select('*')
        .eq('repairer_id', repairerId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération infos légales:', error);
      return null;
    }
  }

  /**
   * Soumettre une facture à Chorus Pro (B2B uniquement)
   */
  static async submitToChorusPro(invoiceId: string): Promise<boolean> {
    try {
      if (!invoiceId) {
        throw new Error('ID de facture requis');
      }

      const { data, error } = await supabase.functions.invoke('submit-chorus-pro', {
        body: { invoice_id: invoiceId }
      });

      if (error) throw error;
      return data?.success || false;
    } catch (error) {
      console.error('Erreur soumission Chorus Pro:', error);
      return false;
    }
  }

  /**
   * Générer le format Factur-X (PDF + XML UBL)
   */
  static async generateFacturX(invoiceId: string): Promise<{ pdf_url: string; xml_content: string }> {
    try {
      if (!invoiceId) {
        throw new Error('ID de facture requis');
      }

      const { data, error } = await supabase.functions.invoke('generate-factur-x', {
        body: { invoice_id: invoiceId }
      });

      if (error) throw error;
      
      if (!data || !data.pdf_url || !data.xml_content) {
        throw new Error('Données de réponse invalides');
      }
      
      return data;
    } catch (error) {
      console.error('Erreur génération Factur-X:', error);
      throw error;
    }
  }

  /**
   * Créer un avoir électronique
   */
  static async createCreditNote(invoiceId: string, repairerId: string, amount: number, reason: string): Promise<boolean> {
    try {
      // Generate credit note number
      const creditNoteNumber = `AV-${Date.now()}`;
      
      const { error } = await supabase
        .from('electronic_credit_notes')
        .insert({
          credit_note_number: creditNoteNumber,
          original_invoice_id: invoiceId,
          repairer_id: repairerId,
          amount_ht: amount / 1.2, // Approximation, à calculer précisément
          amount_ttc: amount,
          tva_amount: amount - (amount / 1.2),
          reason
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur création avoir:', error);
      return false;
    }
  }

  /**
   * Vérifier la conformité d'une facture
   */
  static async validateInvoiceCompliance(invoiceId: string): Promise<{
    isCompliant: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('validate-invoice-compliance', {
        body: { invoice_id: invoiceId }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur validation conformité:', error);
      return {
        isCompliant: false,
        errors: ['Erreur de validation'],
        warnings: []
      };
    }
  }
}