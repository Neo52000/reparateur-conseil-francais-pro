import { supabase } from '@/integrations/supabase/client';

/**
 * Interface pour une ligne FEC conforme aux normes françaises
 * Format: 18 colonnes obligatoires séparées par | ou tabulation
 */
export interface FECLine {
  JournalCode: string;        // Code journal (max 3 car)
  JournalLib: string;          // Libellé journal
  EcritureNum: string;         // Numéro d'écriture
  EcritureDate: string;        // Date écriture (YYYYMMDD)
  CompteNum: string;           // Numéro de compte
  CompteLib: string;           // Libellé du compte
  CompAuxNum: string;          // Compte auxiliaire (vide si N/A)
  CompAuxLib: string;          // Libellé auxiliaire (vide si N/A)
  PieceRef: string;            // Référence pièce
  PieceDate: string;           // Date pièce (YYYYMMDD)
  EcritureLib: string;         // Libellé écriture
  Debit: string;               // Montant débit
  Credit: string;              // Montant crédit
  EcritureLet: string;         // Lettrage (vide si N/A)
  DateLet: string;             // Date lettrage (vide si N/A)
  ValidDate: string;           // Date validation
  Montantdevise: string;       // Montant en devise (vide si EUR)
  Idevise: string;             // Code devise (vide si EUR)
}

export interface FECExportParams {
  repairer_id: string;
  start_date: string;
  end_date: string;
  siren: string;
  format?: 'txt' | 'csv';
  separator?: '|' | '\t';
}

export interface FECExportResult {
  success: boolean;
  file_path?: string;
  file_url?: string;
  line_count?: number;
  file_size?: number;
  error?: string;
}

export class FECExportService {
  /**
   * Générer un export FEC via edge function
   */
  static async generateFEC(params: FECExportParams): Promise<FECExportResult> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-fec-export', {
        body: {
          repairer_id: params.repairer_id,
          start_date: params.start_date,
          end_date: params.end_date,
          siren: params.siren,
          format: params.format || 'txt',
          separator: params.separator || '|'
        }
      });

      if (error) throw error;
      
      return {
        success: true,
        ...data
      };
    } catch (error) {
      console.error('Erreur génération FEC:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Générer un FEC côté client (pour petits volumes)
   */
  static async generateFECClient(params: FECExportParams): Promise<string> {
    try {
      // Récupérer les factures de la période
      const { data: invoices, error: invoicesError } = await supabase
        .from('electronic_invoices')
        .select('*')
        .eq('repairer_id', params.repairer_id)
        .gte('invoice_date', params.start_date)
        .lte('invoice_date', params.end_date)
        .order('invoice_date', { ascending: true });

      if (invoicesError) throw invoicesError;

      if (!invoices || invoices.length === 0) {
        throw new Error('Aucune facture trouvée pour la période');
      }

      // Générer les lignes FEC
      const fecLines: FECLine[] = [];

      invoices.forEach((invoice, index) => {
        const invoiceDate = invoice.invoice_date.replace(/-/g, '');
        const ecritureNum = `FAC${invoiceDate}${String(index + 1).padStart(4, '0')}`;

        // Ligne de débit client (411xxx)
        fecLines.push({
          JournalCode: 'VTE',
          JournalLib: 'Journal des ventes',
          EcritureNum: ecritureNum,
          EcritureDate: invoiceDate,
          CompteNum: '411000',
          CompteLib: 'Clients',
          CompAuxNum: invoice.client_id.substring(0, 8),
          CompAuxLib: 'Client',
          PieceRef: invoice.invoice_number,
          PieceDate: invoiceDate,
          EcritureLib: `Facture ${invoice.invoice_number}`,
          Debit: this.formatAmount(invoice.amount_ttc),
          Credit: '0,00',
          EcritureLet: '',
          DateLet: '',
          ValidDate: invoiceDate,
          Montantdevise: '',
          Idevise: ''
        });

        // Ligne de crédit ventes HT (707xxx)
        fecLines.push({
          JournalCode: 'VTE',
          JournalLib: 'Journal des ventes',
          EcritureNum: ecritureNum,
          EcritureDate: invoiceDate,
          CompteNum: '707000',
          CompteLib: 'Ventes de prestations de services',
          CompAuxNum: '',
          CompAuxLib: '',
          PieceRef: invoice.invoice_number,
          PieceDate: invoiceDate,
          EcritureLib: `Facture ${invoice.invoice_number}`,
          Debit: '0,00',
          Credit: this.formatAmount(invoice.amount_ht),
          EcritureLet: '',
          DateLet: '',
          ValidDate: invoiceDate,
          Montantdevise: '',
          Idevise: ''
        });

        // Ligne de crédit TVA (445710)
        fecLines.push({
          JournalCode: 'VTE',
          JournalLib: 'Journal des ventes',
          EcritureNum: ecritureNum,
          EcritureDate: invoiceDate,
          CompteNum: '445710',
          CompteLib: 'TVA collectée',
          CompAuxNum: '',
          CompAuxLib: '',
          PieceRef: invoice.invoice_number,
          PieceDate: invoiceDate,
          EcritureLib: `TVA ${invoice.tva_rate}%`,
          Debit: '0,00',
          Credit: this.formatAmount(invoice.tva_amount),
          EcritureLet: '',
          DateLet: '',
          ValidDate: invoiceDate,
          Montantdevise: '',
          Idevise: ''
        });
      });

      // Convertir en format FEC
      return this.linesToFECFormat(fecLines, params.separator || '|');
    } catch (error) {
      console.error('Erreur génération FEC client:', error);
      throw error;
    }
  }

  /**
   * Formater un montant au format FEC (ex: 1234,56)
   */
  private static formatAmount(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num.toFixed(2).replace('.', ',');
  }

  /**
   * Convertir les lignes en format FEC
   */
  private static linesToFECFormat(lines: FECLine[], separator: string): string {
    // En-tête FEC
    const headers = [
      'JournalCode',
      'JournalLib',
      'EcritureNum',
      'EcritureDate',
      'CompteNum',
      'CompteLib',
      'CompAuxNum',
      'CompAuxLib',
      'PieceRef',
      'PieceDate',
      'EcritureLib',
      'Debit',
      'Credit',
      'EcritureLet',
      'DateLet',
      'ValidDate',
      'Montantdevise',
      'Idevise'
    ];

    const headerLine = headers.join(separator);
    const dataLines = lines.map(line =>
      headers.map(header => line[header as keyof FECLine]).join(separator)
    );

    return [headerLine, ...dataLines].join('\n');
  }

  /**
   * Télécharger le FEC généré
   */
  static downloadFEC(content: string, siren: string, endDate: string): void {
    const fileName = `${siren}_FEC_${endDate.replace(/-/g, '')}.txt`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Valider un export FEC
   */
  static validateFEC(content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const lines = content.split('\n');

    // Vérifier l'en-tête
    if (lines.length < 2) {
      errors.push('Fichier FEC vide ou invalide');
      return { valid: false, errors };
    }

    const headers = lines[0].split(/[|\t]/);
    const requiredHeaders = [
      'JournalCode',
      'JournalLib',
      'EcritureNum',
      'EcritureDate',
      'CompteNum',
      'CompteLib'
    ];

    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        errors.push(`Colonne manquante: ${required}`);
      }
    }

    // Vérifier quelques lignes
    for (let i = 1; i < Math.min(lines.length, 10); i++) {
      const fields = lines[i].split(/[|\t]/);
      if (fields.length !== 18) {
        errors.push(`Ligne ${i + 1}: nombre de colonnes incorrect (${fields.length}/18)`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Mettre à jour le chemin FEC dans la clôture
   */
  static async updateClosureFECPath(
    closureId: string,
    fecPath: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('nf203_period_closures')
        .update({
          fec_export_path: fecPath,
          fec_generated_at: new Date().toISOString()
        })
        .eq('id', closureId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur mise à jour FEC path:', error);
      return false;
    }
  }
}
