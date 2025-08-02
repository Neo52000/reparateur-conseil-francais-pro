import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface APIKey {
  id: string;
  key_name: string;
  api_key_hash: string;
  permissions: string[];
  last_used: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface APIEndpoint {
  id: string;
  endpoint_name: string;
  endpoint_url: string;
  method: string;
  is_active: boolean;
  rate_limit: number;
}

interface Integration {
  id: string;
  integration_name: string;
  provider: string;
  status: string;
  config: any;
  last_sync: string | null;
}

export const useAPIManager = () => {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    
    try {
      // Charger les clés API
      const { data: keysData } = await supabase
        .from('api_keys')
        .select('*')
        .eq('repairer_id', user.id);

      // Charger les endpoints
      const { data: endpointsData } = await supabase
        .from('api_endpoints')
        .select('*');

      // Charger les intégrations
      const { data: integrationsData } = await supabase
        .from('integrations')
        .select('*')
        .eq('repairer_id', user.id);

      setApiKeys(keysData?.map(key => ({
        ...key,
        permissions: Array.isArray(key.permissions) ? key.permissions.map(String) : []
      })) || []);
      setEndpoints(endpointsData || []);
      setIntegrations(integrationsData || []);
    } catch (error) {
      console.error('Erreur chargement API:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  return { apiKeys, endpoints, integrations, loading, loadData };
};

export const useAuditTrail = () => {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [complianceReports, setComplianceReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAuditData = async () => {
    try {
      const { data: logsData } = await supabase
        .from('detailed_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: reportsData } = await supabase
        .from('compliance_reports')
        .select('*')
        .order('created_at', { ascending: false });

      setAuditLogs(logsData || []);
      setComplianceReports(reportsData || []);
    } catch (error) {
      console.error('Erreur chargement audit:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditData();
  }, []);

  return { auditLogs, complianceReports, loading, loadAuditData };
};