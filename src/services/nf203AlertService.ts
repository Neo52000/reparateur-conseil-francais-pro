import { supabase } from '@/integrations/supabase/client';

export interface NF203Alert {
  id: string;
  repairer_id: string;
  alert_type: 'chain_broken' | 'missing_timestamp' | 'archive_expiring' | 'closure_due' | 'low_compliance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  metadata: any;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_at?: string;
  created_at: string;
}

export class NF203AlertService {
  static async getActiveAlerts(repairerId: string): Promise<NF203Alert[]> {
    const { data, error } = await supabase
      .from('nf203_alerts')
      .select('*')
      .eq('repairer_id', repairerId)
      .eq('status', 'active')
      .order('severity', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getAlertHistory(
    repairerId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<NF203Alert[]> {
    let query = supabase
      .from('nf203_alerts')
      .select('*')
      .eq('repairer_id', repairerId)
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async createAlert(params: {
    repairer_id: string;
    alert_type: NF203Alert['alert_type'];
    severity: NF203Alert['severity'];
    title: string;
    description: string;
    metadata?: any;
  }): Promise<NF203Alert> {
    const { data, error } = await supabase
      .from('nf203_alerts')
      .insert([{
        ...params,
        metadata: params.metadata || {}
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('nf203_alerts')
      .update({
        status: 'acknowledged',
        acknowledged_by: userId,
        acknowledged_at: new Date().toISOString()
      })
      .eq('id', alertId);

    if (error) throw error;
  }

  static async resolveAlert(alertId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('nf203_alerts')
      .update({
        status: 'resolved',
        acknowledged_by: userId,
        acknowledged_at: new Date().toISOString(),
        resolved_at: new Date().toISOString()
      })
      .eq('id', alertId);

    if (error) throw error;
  }

  static async checkChainIntegrity(repairerId: string): Promise<void> {
    // Appeler la fonction Supabase pour vérifier l'intégrité
    const { data: result, error } = await supabase.rpc('verify_chain_integrity', {
      repairer_uuid: repairerId
    });

    if (error) throw error;

    // Si la chaîne est cassée, créer une alerte
    if (result && !result.is_valid) {
      await this.createAlert({
        repairer_id: repairerId,
        alert_type: 'chain_broken',
        severity: 'critical',
        title: '⚠️ Rupture de chaîne cryptographique détectée',
        description: result.error_details || 'La chaîne de facturation électronique présente une anomalie.',
        metadata: {
          total_invoices: result.total_invoices,
          broken_links: result.broken_links,
          first_error_sequence: result.first_error_sequence
        }
      });
    }
  }

  static async getAlertStats(repairerId: string) {
    const { data, error } = await supabase
      .from('nf203_alerts')
      .select('severity, status')
      .eq('repairer_id', repairerId);

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      active: data?.filter(a => a.status === 'active').length || 0,
      critical: data?.filter(a => a.severity === 'critical' && a.status === 'active').length || 0,
      high: data?.filter(a => a.severity === 'high' && a.status === 'active').length || 0,
      medium: data?.filter(a => a.severity === 'medium' && a.status === 'active').length || 0,
      low: data?.filter(a => a.severity === 'low' && a.status === 'active').length || 0
    };

    return stats;
  }
}
