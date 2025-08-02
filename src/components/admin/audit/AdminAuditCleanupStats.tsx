import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Database, AlertTriangle, CheckCircle } from 'lucide-react';

interface CleanupConfig {
  id: string;
  days_to_keep: number;
  auto_cleanup_enabled: boolean;
  last_cleanup: string | null;
  created_at: string;
  updated_at: string;
}

interface AdminAuditCleanupStatsProps {
  config: CleanupConfig | null;
}

const AdminAuditCleanupStats: React.FC<AdminAuditCleanupStatsProps> = ({ config }) => {
  if (!config) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Jamais';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNextCleanup = () => {
    if (!config.auto_cleanup_enabled || !config.last_cleanup) return 'Non programmé';
    const lastCleanup = new Date(config.last_cleanup);
    const nextCleanup = new Date(lastCleanup.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 jours
    return nextCleanup.toLocaleDateString('fr-FR');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="p-4 border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">Rétention</span>
        </div>
        <p className="text-2xl font-bold">{config.days_to_keep}</p>
        <p className="text-xs text-muted-foreground">jours</p>
      </div>

      <div className="p-4 border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">Statut</span>
        </div>
        <Badge variant={config.auto_cleanup_enabled ? 'default' : 'secondary'}>
          {config.auto_cleanup_enabled ? 'Actif' : 'Inactif'}
        </Badge>
      </div>

      <div className="p-4 border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium">Dernier nettoyage</span>
        </div>
        <p className="text-sm">{formatDate(config.last_cleanup)}</p>
      </div>

      <div className="p-4 border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium">Prochain nettoyage</span>
        </div>
        <p className="text-sm">{getNextCleanup()}</p>
      </div>
    </div>
  );
};

export default AdminAuditCleanupStats;