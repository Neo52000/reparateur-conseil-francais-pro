
import { supabase } from '@/integrations/supabase/client';

export interface AdminAuditLogEntry {
  id?: string;
  timestamp?: string;
  admin_user_id: string;
  action_type: 'login' | 'logout' | 'create' | 'update' | 'delete' | 
               'approve' | 'reject' | 'activate' | 'deactivate' |
               'scraping_start' | 'scraping_stop' | 'export' |
               'configuration_change' | 'user_management';
  resource_type: string;
  resource_id?: string;
  action_details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  before_data?: Record<string, any>;
  after_data?: Record<string, any>;
  severity_level?: 'info' | 'warning' | 'critical';
}

export interface AdminAuditFilters {
  admin_user_id?: string;
  action_type?: string;
  resource_type?: string;
  severity_level?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

/**
 * Service centralisé pour la traçabilité des actions administratives
 */
export class AdminAuditService {
  
  /**
   * Enregistre automatiquement une action d'administration
   */
  static async logAction(entry: Omit<AdminAuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      console.log('🔍 AdminAuditService - Logging action:', entry.action_type, 'on', entry.resource_type);
      
      // Enrichir avec les données de contexte navigateur
      const enrichedEntry = {
        ...entry,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        session_id: this.getSessionId(),
        timestamp: new Date().toISOString()
      };

      const { error } = await supabase
        .from('admin_audit_logs')
        .insert(enrichedEntry);

      if (error) {
        console.error('❌ AdminAuditService - Error logging action:', error);
        throw error;
      }

      console.log('✅ AdminAuditService - Action logged successfully');
    } catch (error) {
      console.error('❌ AdminAuditService - Failed to log action:', error);
      // Ne pas bloquer l'application si le logging échoue
    }
  }

  /**
   * Enregistre une modification avec les données avant/après
   */
  static async logModification(
    adminUserId: string,
    actionType: AdminAuditLogEntry['action_type'],
    resourceType: string,
    resourceId: string,
    beforeData: Record<string, any>,
    afterData: Record<string, any>,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logAction({
      admin_user_id: adminUserId,
      action_type: actionType,
      resource_type: resourceType,
      resource_id: resourceId,
      before_data: beforeData,
      after_data: afterData,
      action_details: details,
      severity_level: 'info'
    });
  }

  /**
   * Enregistre une action critique
   */
  static async logCriticalAction(
    adminUserId: string,
    actionType: AdminAuditLogEntry['action_type'],
    resourceType: string,
    resourceId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logAction({
      admin_user_id: adminUserId,
      action_type: actionType,
      resource_type: resourceType,
      resource_id: resourceId,
      action_details: details,
      severity_level: 'critical'
    });
  }

  /**
   * Récupère les logs d'audit avec filtres
   */
  static async getLogs(filters: AdminAuditFilters = {}): Promise<{
    logs: AdminAuditLogEntry[];
    total: number;
  }> {
    try {
      console.log('🔍 AdminAuditService - Fetching logs with filters:', filters);

      let query = supabase
        .from('admin_audit_logs')
        .select(`
          id,
          timestamp,
          admin_user_id,
          action_type,
          resource_type,
          resource_id,
          action_details,
          ip_address,
          user_agent,
          session_id,
          before_data,
          after_data,
          severity_level,
          created_at
        `, { count: 'exact' })
        .order('timestamp', { ascending: false });

      // Appliquer les filtres
      if (filters.admin_user_id) {
        query = query.eq('admin_user_id', filters.admin_user_id);
      }
      if (filters.action_type) {
        query = query.eq('action_type', filters.action_type);
      }
      if (filters.resource_type) {
        query = query.eq('resource_type', filters.resource_type);
      }
      if (filters.severity_level) {
        query = query.eq('severity_level', filters.severity_level);
      }
      if (filters.start_date) {
        query = query.gte('timestamp', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('timestamp', filters.end_date);
      }

      // Pagination
      const limit = filters.limit || 50;
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ AdminAuditService - Error fetching logs:', error);
        throw error;
      }

      console.log('✅ AdminAuditService - Fetched', data?.length || 0, 'logs');
      return {
        logs: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('❌ AdminAuditService - Failed to fetch logs:', error);
      return { logs: [], total: 0 };
    }
  }

  /**
   * Exporte les logs en format CSV
   */
  static async exportLogs(filters: AdminAuditFilters = {}): Promise<string> {
    const { logs } = await this.getLogs({ ...filters, limit: 10000 });
    
    const csvHeaders = [
      'Timestamp',
      'Admin User ID',
      'Action Type',
      'Resource Type',
      'Resource ID',
      'Severity Level',
      'IP Address',
      'Details'
    ];

    const csvRows = logs.map(log => [
      log.timestamp || '',
      log.admin_user_id,
      log.action_type,
      log.resource_type,
      log.resource_id || '',
      log.severity_level || 'info',
      log.ip_address || '',
      JSON.stringify(log.action_details || {})
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Récupère l'IP du client (approximatif)
   */
  private static async getClientIP(): Promise<string | undefined> {
    try {
      // En production, vous pourriez utiliser un service externe
      // ou récupérer l'IP depuis les headers de requête
      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Génère/récupère un ID de session
   */
  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('admin_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('admin_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Nettoie les anciens logs (pour la maintenance)
   */
  static async cleanupOldLogs(daysToKeep: number = 90): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { error } = await supabase
        .from('admin_audit_logs')
        .delete()
        .lt('timestamp', cutoffDate.toISOString());

      if (error) {
        console.error('❌ AdminAuditService - Error cleaning up old logs:', error);
        throw error;
      }

      console.log('✅ AdminAuditService - Old logs cleaned up successfully');
    } catch (error) {
      console.error('❌ AdminAuditService - Failed to cleanup old logs:', error);
    }
  }
}
