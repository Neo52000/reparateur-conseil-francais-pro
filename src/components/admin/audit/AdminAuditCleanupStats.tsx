
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';

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
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Jamais';
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const getNextCleanupTime = () => {
    // Le cron s'exécute tous les jours à 2h00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(2, 0, 0, 0);
    return tomorrow.toLocaleString('fr-FR');
  };

  if (!config) return null;

  return (
    <>
      {/* Statut du nettoyage automatique */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-medium">Nettoyage automatique</p>
            <p className="text-sm text-gray-600">
              {config.auto_cleanup_enabled ? 'Activé - Tous les jours à 2h00' : 'Désactivé'}
            </p>
          </div>
        </div>
        <Badge variant={config.auto_cleanup_enabled ? 'default' : 'secondary'}>
          {config.auto_cleanup_enabled ? 'Actif' : 'Inactif'}
        </Badge>
      </div>

      {/* Informations sur le dernier nettoyage */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium mb-2">Informations de nettoyage</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Dernier nettoyage :</span>
            <br />
            <span className="text-gray-600">{formatDate(config.last_cleanup)}</span>
          </div>
          {config.auto_cleanup_enabled && (
            <div>
              <span className="font-medium">Prochain nettoyage :</span>
              <br />
              <span className="text-gray-600">{getNextCleanupTime()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Avertissement */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-amber-800">Attention</p>
          <p className="text-amber-700">
            La suppression des logs d'audit est irréversible. Assurez-vous d'avoir configuré 
            une période de rétention appropriée selon vos besoins de conformité.
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminAuditCleanupStats;
