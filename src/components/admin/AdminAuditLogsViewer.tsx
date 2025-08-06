
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAdminAuditLogs } from '@/hooks/useAdminAudit';
import { useToast } from '@/hooks/use-toast';
import AdminAuditFilters from './audit/AdminAuditFilters';
import AdminAuditLogsTable from './audit/AdminAuditLogsTable';
import AdminAuditCleanupConfig from './AdminAuditCleanupConfig';

const AdminAuditLogsViewer: React.FC = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    action_type: '',
    resource_type: '',
    severity_level: '',
    start_date: '',
    end_date: '',
    search: ''
  });
  const [showCleanupConfig, setShowCleanupConfig] = useState(false);

  const { logs, total, loading, error, fetchLogs, exportLogs } = useAdminAuditLogs(filters);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchLogs(newFilters);
  };

  const handleExport = async () => {
    try {
      await exportLogs(filters);
      toast({
        title: "Export réussi",
        description: "Les logs ont été exportés en CSV",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les logs",
        variant: "destructive"
      });
    }
  };

  if (error) {
    return (
      <div className="text-center text-red-600 p-6">
        <p>Erreur lors du chargement des logs : {error}</p>
        <Button onClick={() => fetchLogs()} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  if (showCleanupConfig) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Configuration du nettoyage</h3>
          <Button 
            onClick={() => setShowCleanupConfig(false)}
            variant="outline"
          >
            Retour aux logs
          </Button>
        </div>
        <AdminAuditCleanupConfig />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminAuditFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onExport={handleExport}
        onShowCleanupConfig={() => setShowCleanupConfig(true)}
      />
      
      <AdminAuditLogsTable
        logs={logs}
        total={total}
        loading={loading}
        onRefresh={() => fetchLogs()}
      />
    </div>
  );
};

export default AdminAuditLogsViewer;
