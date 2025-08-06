import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  created_at: string;
}

export const useAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchLogs = async (limit = 50) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setLogs(data as AuditLog[] || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les logs d'audit",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const logAction = async (
    action: string,
    resourceType: string,
    resourceId?: string,
    oldValues?: any,
    newValues?: any
  ) => {
    try {
      // Récupérer les informations de la session
      const sessionInfo = {
        ip_address: null, // À implémenter côté client si nécessaire
        user_agent: navigator.userAgent,
        session_id: Date.now().toString(), // Simple session ID
      };

      const { error } = await supabase
        .from('audit_logs')
        .insert({
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          old_values: oldValues,
          new_values: newValues,
          ...sessionInfo,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  const filterLogs = async (filters: {
    action?: string;
    resourceType?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    try {
      setLoading(true);
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.resourceType) {
        query = query.eq('resource_type', filters.resourceType);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      setLogs(data as AuditLog[] || []);
    } catch (error) {
      console.error('Error filtering logs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de filtrer les logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return {
    logs,
    loading,
    logAction,
    filterLogs,
    refetch: fetchLogs,
  };
};