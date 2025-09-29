import { supabase } from '@/integrations/supabase/client';

export interface ArchiveAccessLog {
  id: string;
  archive_id: string;
  user_id: string;
  action: 'view' | 'download' | 'export' | 'verify' | 'search';
  ip_address?: string;
  user_agent?: string;
  access_reason?: string;
  duration_ms?: number;
  metadata: any;
  created_at: string;
}

export class NF203ArchiveAccessService {
  static async logArchiveAccess(params: {
    archive_id: string;
    user_id: string;
    action: ArchiveAccessLog['action'];
    access_reason?: string;
    duration_ms?: number;
    metadata?: any;
  }): Promise<void> {
    // Récupérer IP et user agent côté client
    const userAgent = navigator.userAgent;

    const { error } = await supabase
      .from('nf203_archive_access_logs')
      .insert([{
        archive_id: params.archive_id,
        user_id: params.user_id,
        action: params.action,
        user_agent: userAgent,
        access_reason: params.access_reason,
        duration_ms: params.duration_ms,
        metadata: params.metadata || {}
      }]);

    if (error) throw error;
  }

  static async getArchiveAccessHistory(archiveId: string): Promise<ArchiveAccessLog[]> {
    const { data, error } = await supabase
      .from('nf203_archive_access_logs')
      .select('*')
      .eq('archive_id', archiveId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as ArchiveAccessLog[];
  }

  static async getAccessReport(
    repairerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    total_accesses: number;
    by_action: Record<string, number>;
    by_user: Record<string, number>;
    recent_logs: ArchiveAccessLog[];
  }> {
    const { data: archives } = await supabase
      .from('nf203_archives')
      .select('id')
      .eq('repairer_id', repairerId);

    if (!archives || archives.length === 0) {
      return {
        total_accesses: 0,
        by_action: {},
        by_user: {},
        recent_logs: []
      };
    }

    const archiveIds = archives.map(a => a.id);

    const { data: logs, error } = await supabase
      .from('nf203_archive_access_logs')
      .select('*')
      .in('archive_id', archiveIds)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    const byAction: Record<string, number> = {};
    const byUser: Record<string, number> = {};

    logs?.forEach(log => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      byUser[log.user_id] = (byUser[log.user_id] || 0) + 1;
    });

    return {
      total_accesses: logs?.length || 0,
      by_action: byAction,
      by_user: byUser,
      recent_logs: (logs?.slice(0, 50) || []) as ArchiveAccessLog[]
    };
  }

  static async exportAccessLogsPDF(
    repairerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<string> {
    const report = await this.getAccessReport(repairerId, startDate, endDate);
    
    // Créer un JSON formaté pour export
    const exportData = {
      repairer_id: repairerId,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      summary: {
        total_accesses: report.total_accesses,
        by_action: report.by_action,
        unique_users: Object.keys(report.by_user).length
      },
      logs: report.recent_logs,
      generated_at: new Date().toISOString(),
      compliance: 'RGPD - Article 30'
    };

    return JSON.stringify(exportData, null, 2);
  }

  static async getAccessStats(repairerId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const report = await this.getAccessReport(repairerId, startDate, new Date());

    return {
      total_accesses: report.total_accesses,
      daily_average: Math.round(report.total_accesses / days),
      most_common_action: Object.entries(report.by_action)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'none',
      unique_users: Object.keys(report.by_user).length
    };
  }
}
