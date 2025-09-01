import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Wifi, WifiOff, Activity, AlertTriangle } from 'lucide-react';
import { useSystemDiagnostics } from '@/hooks/useSystemDiagnostics';

const SystemStatus: React.FC = () => {
  const { diagnostics, isHealthy } = useSystemDiagnostics();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-success text-success-foreground';
      case 'degraded': return 'bg-warning text-warning-foreground';
      case 'offline': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <Activity className="h-3 w-3" />;
      case 'degraded': return <AlertTriangle className="h-3 w-3" />;
      default: return <WifiOff className="h-3 w-3" />;
    }
  };

  const getModeDescription = (mode: string) => {
    switch (mode) {
      case 'ai': return 'IA complète disponible';
      case 'hybrid': return 'Mode hybride (IA + fallback)';
      case 'fallback': return 'Mode fallback local';
      default: return 'Mode inconnu';
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {diagnostics.isOnline ? (
              <Wifi className="h-4 w-4 text-success" />
            ) : (
              <WifiOff className="h-4 w-4 text-destructive" />
            )}
            <span className="text-sm font-medium">État du système</span>
          </div>
          <Badge variant={isHealthy ? "default" : "destructive"}>
            {getModeDescription(diagnostics.recommendedMode)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span>Routeur IA:</span>
            <Badge 
              className={`${getStatusColor(diagnostics.systemStatus.aiRouter)} flex items-center gap-1 text-xs px-2 py-1`}
            >
              {getStatusIcon(diagnostics.systemStatus.aiRouter)}
              {diagnostics.systemStatus.aiRouter}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Fallback:</span>
            <Badge 
              className={`${getStatusColor(diagnostics.systemStatus.fallback)} flex items-center gap-1 text-xs px-2 py-1`}
            >
              {getStatusIcon(diagnostics.systemStatus.fallback)}
              {diagnostics.systemStatus.fallback}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Connexion:</span>
            <Badge 
              variant={diagnostics.connectionQuality === 'good' ? 'default' : 'outline'}
              className="text-xs px-2 py-1"
            >
              {diagnostics.connectionQuality}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Dernière vérif:</span>
            <span className="text-muted-foreground">
              {diagnostics.systemStatus.lastChecked.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatus;