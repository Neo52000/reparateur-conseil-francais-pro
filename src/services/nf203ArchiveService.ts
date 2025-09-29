import { supabase } from '@/integrations/supabase/client';

export interface ArchiveRecord {
  id: string;
  document_id: string;
  document_type: 'invoice' | 'credit_note' | 'quote' | 'receipt';
  repairer_id: string;
  archive_date: string;
  archive_format: 'PDF' | 'PDF/A-3' | 'XML' | 'JSON';
  file_path?: string;
  file_url?: string;
  file_hash: string;
  file_size: number;
  retention_period: number;
  deletion_date?: string;
  archive_status: 'active' | 'expired' | 'deleted' | 'legal_hold';
  legal_hold: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface PeriodClosure {
  id: string;
  repairer_id: string;
  period_type: 'monthly' | 'quarterly' | 'annual';
  period_start: string;
  period_end: string;
  closure_date: string;
  closure_hash: string;
  invoice_count: number;
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  closed_by?: string;
  is_locked: boolean;
  fec_export_path?: string;
  fec_generated_at?: string;
  compliance_report: any;
  created_at: string;
}

export class NF203ArchiveService {
  /**
   * Créer une archive pour un document
   */
  static async createArchive(params: {
    document_id: string;
    document_type: 'invoice' | 'credit_note' | 'quote' | 'receipt';
    repairer_id: string;
    archive_format?: 'PDF' | 'PDF/A-3' | 'XML' | 'JSON';
    file_hash: string;
    file_size: number;
    file_path?: string;
    file_url?: string;
    retention_period?: number;
    metadata?: any;
  }): Promise<ArchiveRecord | null> {
    try {
      const { data, error } = await supabase
        .from('nf203_archives')
        .insert({
          document_id: params.document_id,
          document_type: params.document_type,
          repairer_id: params.repairer_id,
          archive_format: params.archive_format || 'PDF',
          file_hash: params.file_hash,
          file_size: params.file_size,
          file_path: params.file_path,
          file_url: params.file_url,
          retention_period: params.retention_period || 10,
          metadata: params.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;
      return data as ArchiveRecord;
    } catch (error) {
      console.error('Erreur création archive:', error);
      return null;
    }
  }

  /**
   * Récupérer les archives d'un réparateur
   */
  static async getArchives(
    repairerId: string,
    filters?: {
      document_type?: string;
      archive_status?: string;
      limit?: number;
    }
  ): Promise<ArchiveRecord[]> {
    try {
      let query = supabase
        .from('nf203_archives')
        .select('*')
        .eq('repairer_id', repairerId)
        .order('created_at', { ascending: false });

      if (filters?.document_type) {
        query = query.eq('document_type', filters.document_type);
      }

      if (filters?.archive_status) {
        query = query.eq('archive_status', filters.archive_status);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as ArchiveRecord[];
    } catch (error) {
      console.error('Erreur récupération archives:', error);
      return [];
    }
  }

  /**
   * Récupérer une archive spécifique
   */
  static async getArchive(archiveId: string): Promise<ArchiveRecord | null> {
    try {
      const { data, error } = await supabase
        .from('nf203_archives')
        .select('*')
        .eq('id', archiveId)
        .single();

      if (error) throw error;
      return data as ArchiveRecord;
    } catch (error) {
      console.error('Erreur récupération archive:', error);
      return null;
    }
  }

  /**
   * Mettre en conservation légale (legal hold)
   */
  static async setLegalHold(archiveId: string, enabled: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('nf203_archives')
        .update({
          legal_hold: enabled,
          archive_status: enabled ? 'legal_hold' : 'active'
        })
        .eq('id', archiveId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur mise à jour legal hold:', error);
      return false;
    }
  }

  /**
   * Marquer des archives comme expirées
   */
  static async markExpired(repairerId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('nf203_archives')
        .update({ archive_status: 'expired' })
        .eq('repairer_id', repairerId)
        .lt('deletion_date', new Date().toISOString().split('T')[0])
        .eq('archive_status', 'active')
        .eq('legal_hold', false)
        .select();

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Erreur marquage archives expirées:', error);
      return 0;
    }
  }

  /**
   * Calculer les statistiques d'archivage
   */
  static async getArchiveStats(repairerId: string) {
    try {
      const { count: total, error: totalError } = await supabase
        .from('nf203_archives')
        .select('*', { count: 'exact', head: true })
        .eq('repairer_id', repairerId);

      if (totalError) throw totalError;

      const { count: active, error: activeError } = await supabase
        .from('nf203_archives')
        .select('*', { count: 'exact', head: true })
        .eq('repairer_id', repairerId)
        .eq('archive_status', 'active');

      if (activeError) throw activeError;

      const { count: legalHold, error: legalError } = await supabase
        .from('nf203_archives')
        .select('*', { count: 'exact', head: true })
        .eq('repairer_id', repairerId)
        .eq('legal_hold', true);

      if (legalError) throw legalError;

      const { data: sizeData, error: sizeError } = await supabase
        .from('nf203_archives')
        .select('file_size')
        .eq('repairer_id', repairerId);

      if (sizeError) throw sizeError;

      const totalSize = sizeData?.reduce((sum, record) => sum + (record.file_size || 0), 0) || 0;

      return {
        total: total || 0,
        active: active || 0,
        expired: (total || 0) - (active || 0) - (legalHold || 0),
        legal_hold: legalHold || 0,
        total_size_bytes: totalSize,
        total_size_mb: Math.round(totalSize / 1024 / 1024 * 100) / 100
      };
    } catch (error) {
      console.error('Erreur statistiques archives:', error);
      return {
        total: 0,
        active: 0,
        expired: 0,
        legal_hold: 0,
        total_size_bytes: 0,
        total_size_mb: 0
      };
    }
  }
}

export class NF203PeriodService {
  /**
   * Vérifier si une période peut être clôturée
   */
  static async canClosePeriod(
    repairerId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('can_close_period', {
        repairer_uuid: repairerId,
        start_date: startDate,
        end_date: endDate
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur vérification clôture:', error);
      return null;
    }
  }

  /**
   * Clôturer une période comptable
   */
  static async closePeriod(
    repairerId: string,
    periodType: 'monthly' | 'quarterly' | 'annual',
    startDate: string,
    endDate: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('close_accounting_period', {
        repairer_uuid: repairerId,
        period_type_param: periodType,
        start_date: startDate,
        end_date: endDate
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur clôture période:', error);
      throw error;
    }
  }

  /**
   * Récupérer les clôtures d'un réparateur
   */
  static async getClosures(
    repairerId: string,
    periodType?: 'monthly' | 'quarterly' | 'annual'
  ): Promise<PeriodClosure[]> {
    try {
      let query = supabase
        .from('nf203_period_closures')
        .select('*')
        .eq('repairer_id', repairerId)
        .order('period_end', { ascending: false });

      if (periodType) {
        query = query.eq('period_type', periodType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as PeriodClosure[];
    } catch (error) {
      console.error('Erreur récupération clôtures:', error);
      return [];
    }
  }

  /**
   * Récupérer une clôture spécifique
   */
  static async getClosure(closureId: string): Promise<PeriodClosure | null> {
    try {
      const { data, error } = await supabase
        .from('nf203_period_closures')
        .select('*')
        .eq('id', closureId)
        .single();

      if (error) throw error;
      return data as PeriodClosure;
    } catch (error) {
      console.error('Erreur récupération clôture:', error);
      return null;
    }
  }

  /**
   * Calculer le hash d'une période
   */
  static async calculatePeriodHash(
    repairerId: string,
    startDate: string,
    endDate: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('calculate_period_hash', {
        repairer_uuid: repairerId,
        start_date: startDate,
        end_date: endDate
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur calcul hash période:', error);
      return null;
    }
  }

  /**
   * Obtenir les statistiques de clôture
   */
  static async getClosureStats(repairerId: string) {
    try {
      const { data: closures, error } = await supabase
        .from('nf203_period_closures')
        .select('*')
        .eq('repairer_id', repairerId);

      if (error) throw error;

      const monthly = closures?.filter(c => c.period_type === 'monthly').length || 0;
      const quarterly = closures?.filter(c => c.period_type === 'quarterly').length || 0;
      const annual = closures?.filter(c => c.period_type === 'annual').length || 0;

      const totalInvoices = closures?.reduce((sum, c) => sum + c.invoice_count, 0) || 0;
      const totalAmount = closures?.reduce((sum, c) => sum + parseFloat(c.total_ttc.toString()), 0) || 0;

      return {
        total_closures: closures?.length || 0,
        monthly_closures: monthly,
        quarterly_closures: quarterly,
        annual_closures: annual,
        total_invoices_closed: totalInvoices,
        total_amount_closed: totalAmount
      };
    } catch (error) {
      console.error('Erreur statistiques clôtures:', error);
      return {
        total_closures: 0,
        monthly_closures: 0,
        quarterly_closures: 0,
        annual_closures: 0,
        total_invoices_closed: 0,
        total_amount_closed: 0
      };
    }
  }
}
