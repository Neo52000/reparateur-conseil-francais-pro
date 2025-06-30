
import { useState, useEffect } from 'react';
import { AdminAuditService, AdminAuditLogEntry, AdminAuditFilters } from '@/services/adminAuditService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useAdminAudit = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  /**
   * Hook pour enregistrer automatiquement les actions
   */
  const logAction = async (
    actionType: AdminAuditLogEntry['action_type'],
    resourceType: string,
    resourceId?: string,
    details?: Record<string, any>,
    severityLevel: AdminAuditLogEntry['severity_level'] = 'info'
  ) => {
    if (!user) {
      console.warn('⚠️ useAdminAudit - No user available for logging');
      return;
    }

    try {
      await AdminAuditService.logAction({
        admin_user_id: user.id,
        action_type: actionType,
        resource_type: resourceType,
        resource_id: resourceId,
        action_details: details,
        severity_level: severityLevel
      });
    } catch (error) {
      console.error('❌ useAdminAudit - Failed to log action:', error);
    }
  };

  /**
   * Hook pour enregistrer les modifications
   */
  const logModification = async (
    actionType: AdminAuditLogEntry['action_type'],
    resourceType: string,
    resourceId: string,
    beforeData: Record<string, any>,
    afterData: Record<string, any>,
    details?: Record<string, any>
  ) => {
    if (!user) return;

    try {
      await AdminAuditService.logModification(
        user.id,
        actionType,
        resourceType,
        resourceId,
        beforeData,
        afterData,
        details
      );
    } catch (error) {
      console.error('❌ useAdminAudit - Failed to log modification:', error);
    }
  };

  /**
   * Hook pour enregistrer les actions critiques
   */
  const logCriticalAction = async (
    actionType: AdminAuditLogEntry['action_type'],
    resourceType: string,
    resourceId?: string,
    details?: Record<string, any>
  ) => {
    if (!user) return;

    try {
      await AdminAuditService.logCriticalAction(
        user.id,
        actionType,
        resourceType,
        resourceId,
        details
      );

      // Notification pour les actions critiques
      toast({
        title: "Action critique enregistrée",
        description: `${actionType} sur ${resourceType}`,
        variant: "default"
      });
    } catch (error) {
      console.error('❌ useAdminAudit - Failed to log critical action:', error);
    }
  };

  return {
    logAction,
    logModification,
    logCriticalAction
  };
};

export const useAdminAuditLogs = (filters: AdminAuditFilters = {}) => {
  const [logs, setLogs] = useState<AdminAuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async (newFilters: AdminAuditFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await AdminAuditService.getLogs({ ...filters, ...newFilters });
      setLogs(result.logs);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des logs');
      console.error('❌ useAdminAuditLogs - Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async (exportFilters: AdminAuditFilters = {}) => {
    try {
      const csvContent = await AdminAuditService.exportLogs({ ...filters, ...exportFilters });
      
      // Créer et télécharger le fichier CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `admin_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('❌ useAdminAuditLogs - Error exporting logs:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return {
    logs,
    total,
    loading,
    error,
    fetchLogs,
    exportLogs,
    refetch: () => fetchLogs()
  };
};
