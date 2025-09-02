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
      case 'ai': return '🤖 IA complète active';
      case 'hybrid': return '🔄 Mode hybride intelligent';
      case 'fallback': return '💡 Assistant local intelligent';
      default: return '❓ Mode inconnu';
    }
  };

  const getModeExplanation = (mode: string) => {
    switch (mode) {
      case 'ai': return 'Toutes les APIs IA sont opérationnelles';
      case 'hybrid': return 'Basculement automatique entre IA et mode local';
      case 'fallback': return 'Réponses intelligentes sans connexion externe';
      default: return 'État du système indéterminé';
    }
  };

  return (
    <Card className="border-l-4 border-l-primary/20">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {diagnostics.isOnline ? (
              <Wifi className="h-4 w-4 text-success" />
            ) : (
              <WifiOff className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">Mode de fonctionnement</span>
          </div>
          <Badge 
            variant={isHealthy ? "default" : "secondary"}
            className="text-xs"
          >
            {getModeDescription(diagnostics.recommendedMode)}
          </Badge>
        </div>

        <div className="text-xs text-muted-foreground mb-3">
          {getModeExplanation(diagnostics.recommendedMode)}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span>Services IA:</span>
            <Badge 
              variant={diagnostics.systemStatus.aiRouter === 'operational' ? 'default' : 'outline'}
              className="text-xs px-1.5 py-0.5"
            >
              {diagnostics.systemStatus.aiRouter === 'operational' ? '✅' : '❌'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Mode local:</span>
            <Badge 
              variant="default"
              className="text-xs px-1.5 py-0.5"
            >
              ✅ Actif
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Réseau:</span>
            <Badge 
              variant={diagnostics.isOnline ? 'default' : 'destructive'}
              className="text-xs px-1.5 py-0.5"
            >
              {diagnostics.isOnline ? '🌐 En ligne' : '📴 Hors ligne'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Qualité:</span>
            <span className="text-muted-foreground text-xs">
              {diagnostics.connectionQuality === 'good' ? '🟢 Excellente' :
               diagnostics.connectionQuality === 'fair' ? '🟡 Correcte' : '🔴 Faible'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatus;