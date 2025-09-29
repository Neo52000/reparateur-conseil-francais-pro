import { supabase } from '@/integrations/supabase/client';

export interface ChainIntegrityReport {
  is_valid: boolean;
  total_invoices: number;
  broken_links: number;
  first_error_sequence: number | null;
  error_details: string;
}

export interface ChainEntry {
  id: string;
  invoice_id: string;
  sequence_number: number;
  previous_hash: string | null;
  current_hash: string;
  invoice_data_snapshot: any;
  created_at: string;
  repairer_id: string;
}

export interface AuditEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  user_id: string | null;
  before_state: any;
  after_state: any;
  compliance_metadata: any;
  timestamp: string;
  ip_address?: unknown;
  user_agent?: string | null;
  user_role?: string | null;
  changes_summary?: string | null;
  created_at: string;
  is_locked?: boolean;
  locked_at?: string | null;
  retention_period?: number | null;
  session_id?: string | null;
}

export class NF203ChainService {
  /**
   * Vérifier l'intégrité de la chaîne cryptographique d'un réparateur
   */
  static async verifyChainIntegrity(repairerId: string): Promise<ChainIntegrityReport> {
    try {
      const { data, error } = await supabase.rpc('verify_chain_integrity', {
        repairer_uuid: repairerId
      });

      if (error) throw error;

      // La fonction retourne un array avec un seul élément
      if (data && data.length > 0) {
        return {
          is_valid: data[0].is_valid,
          total_invoices: data[0].total_invoices,
          broken_links: data[0].broken_links,
          first_error_sequence: data[0].first_error_sequence,
          error_details: data[0].error_details
        };
      }

      throw new Error('Aucune donnée retournée par la vérification');
    } catch (error) {
      console.error('Erreur vérification intégrité chaîne:', error);
      throw error;
    }
  }

  /**
   * Récupérer la chaîne complète d'un réparateur
   */
  static async getChain(repairerId: string): Promise<ChainEntry[]> {
    try {
      const { data, error } = await supabase
        .from('electronic_invoices_chain')
        .select('*')
        .eq('repairer_id', repairerId)
        .order('sequence_number', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération chaîne:', error);
      return [];
    }
  }

  /**
   * Récupérer une entrée spécifique de la chaîne
   */
  static async getChainEntry(invoiceId: string): Promise<ChainEntry | null> {
    try {
      const { data, error } = await supabase
        .from('electronic_invoices_chain')
        .select('*')
        .eq('invoice_id', invoiceId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération entrée chaîne:', error);
      return null;
    }
  }

  /**
   * Récupérer l'horodatage d'un document
   */
  static async getTimestamp(documentId: string, documentType: string = 'invoice') {
    try {
      const { data, error } = await supabase
        .from('nf203_timestamps')
        .select('*')
        .eq('document_id', documentId)
        .eq('document_type', documentType)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération horodatage:', error);
      return null;
    }
  }

  /**
   * Récupérer la piste d'audit pour une entité
   */
  static async getAuditTrail(
    entityId: string,
    entityType: string = 'invoice'
  ): Promise<AuditEntry[]> {
    try {
      const { data, error } = await supabase
        .from('nf203_audit_trail')
        .select('*')
        .eq('entity_id', entityId)
        .eq('entity_type', entityType)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération audit trail:', error);
      return [];
    }
  }

  /**
   * Logger un événement d'audit NF203
   */
  static async logAuditEvent(params: {
    entity_type: string;
    entity_id: string;
    action: string;
    before_state?: any;
    after_state?: any;
    compliance_metadata?: any;
  }): Promise<boolean> {
    try {
      const { error } = await supabase.from('nf203_audit_trail').insert({
        entity_type: params.entity_type,
        entity_id: params.entity_id,
        action: params.action,
        user_id: (await supabase.auth.getUser()).data.user?.id || null,
        before_state: params.before_state || null,
        after_state: params.after_state || null,
        compliance_metadata: params.compliance_metadata || {},
        timestamp: new Date().toISOString()
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur logging événement audit:', error);
      return false;
    }
  }

  /**
   * Obtenir les statistiques de conformité NF203 d'un réparateur
   */
  static async getComplianceStats(repairerId: string) {
    try {
      // Récupérer le nombre total de factures
      const { count: totalInvoices, error: invoiceError } = await supabase
        .from('electronic_invoices')
        .select('*', { count: 'exact', head: true })
        .eq('repairer_id', repairerId);

      if (invoiceError) throw invoiceError;

      // Récupérer le nombre d'entrées dans la chaîne
      const { count: chainedInvoices, error: chainError } = await supabase
        .from('electronic_invoices_chain')
        .select('*', { count: 'exact', head: true })
        .eq('repairer_id', repairerId);

      if (chainError) throw chainError;

      // Récupérer le nombre d'horodatages
      const { count: timestamps, error: timestampError } = await supabase
        .from('nf203_timestamps')
        .select('*', { count: 'exact', head: true })
        .eq('document_type', 'invoice');

      if (timestampError) throw timestampError;

      // Vérifier l'intégrité
      let integrityStatus = null;
      try {
        integrityStatus = await this.verifyChainIntegrity(repairerId);
      } catch (e) {
        console.warn('Impossible de vérifier intégrité:', e);
      }

      return {
        total_invoices: totalInvoices || 0,
        chained_invoices: chainedInvoices || 0,
        timestamped_documents: timestamps || 0,
        chain_integrity: integrityStatus,
        compliance_rate: totalInvoices ? Math.round((chainedInvoices / totalInvoices) * 100) : 0
      };
    } catch (error) {
      console.error('Erreur récupération stats conformité:', error);
      return {
        total_invoices: 0,
        chained_invoices: 0,
        timestamped_documents: 0,
        chain_integrity: null,
        compliance_rate: 0
      };
    }
  }

  /**
   * Exporter les données de conformité pour audit
   */
  static async exportComplianceData(repairerId: string, format: 'json' | 'csv' = 'json') {
    try {
      const chain = await this.getChain(repairerId);
      const stats = await this.getComplianceStats(repairerId);

      const exportData = {
        repairer_id: repairerId,
        export_date: new Date().toISOString(),
        compliance_stats: stats,
        chain_data: chain,
        format_version: '1.0.0',
        standard: 'NF203'
      };

      if (format === 'json') {
        return JSON.stringify(exportData, null, 2);
      } else {
        // CSV simple pour la chaîne
        const headers = 'sequence_number,invoice_id,current_hash,previous_hash,created_at\n';
        const rows = chain
          .map(entry => 
            `${entry.sequence_number},${entry.invoice_id},${entry.current_hash},${entry.previous_hash || 'NULL'},${entry.created_at}`
          )
          .join('\n');
        return headers + rows;
      }
    } catch (error) {
      console.error('Erreur export données conformité:', error);
      throw error;
    }
  }
}
