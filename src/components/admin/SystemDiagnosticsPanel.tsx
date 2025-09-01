import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSystemDiagnostics } from '@/hooks/useSystemDiagnostics';
import { AIServicesTester } from './AIServicesTester';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Wifi,
  WifiOff,
  Server,
  Bot,
  Zap
} from 'lucide-react';

const StatusIcon = ({ status }: { status: 'operational' | 'degraded' | 'offline' }) => {
  switch (status) {
    case 'operational':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'degraded':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'offline':
      return <XCircle className="h-4 w-4 text-red-500" />;
  }
};

const StatusBadge = ({ status }: { status: 'operational' | 'degraded' | 'offline' }) => {
  const variants = {
    operational: 'default',
    degraded: 'secondary', 
    offline: 'destructive'
  } as const;
  
  const labels = {
    operational: 'Opérationnel',
    degraded: 'Dégradé',
    offline: 'Hors ligne'
  };

  return (
    <Badge variant={variants[status]} className="gap-1">
      <StatusIcon status={status} />
      {labels[status]}
    </Badge>
  );
};

const ConnectionQualityBadge = ({ quality }: { quality: 'good' | 'fair' | 'poor' }) => {
  const variants = {
    good: 'default',
    fair: 'secondary',
    poor: 'destructive'
  } as const;
  
  const labels = {
    good: 'Excellente',
    fair: 'Correcte', 
    poor: 'Faible'
  };

  return (
    <Badge variant={variants[quality]}>
      {quality === 'good' && <Wifi className="h-3 w-3 mr-1" />}
      {quality === 'fair' && <Wifi className="h-3 w-3 mr-1" />}
      {quality === 'poor' && <WifiOff className="h-3 w-3 mr-1" />}
      {labels[quality]}
    </Badge>
  );
};

const RecommendedModeBadge = ({ mode }: { mode: 'ai' | 'hybrid' | 'fallback' }) => {
  const variants = {
    ai: 'default',
    hybrid: 'secondary',
    fallback: 'outline'
  } as const;
  
  const labels = {
    ai: 'IA Complète',
    hybrid: 'Hybride',
    fallback: 'Mode Local'
  };

  const icons = {
    ai: <Bot className="h-3 w-3 mr-1" />,
    hybrid: <Zap className="h-3 w-3 mr-1" />,
    fallback: <Server className="h-3 w-3 mr-1" />
  };

  return (
    <Badge variant={variants[mode]}>
      {icons[mode]}
      {labels[mode]}
    </Badge>
  );
};

export const SystemDiagnosticsPanel: React.FC = () => {
  const { diagnostics, checkSystemHealth, isHealthy, canUseAI, shouldUseFallback } = useSystemDiagnostics();

  const getSystemHealthColor = () => {
    if (isHealthy && canUseAI) return 'text-green-600';
    if (diagnostics.systemStatus.aiRouter === 'operational') return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSystemHealthMessage = () => {
    if (isHealthy && canUseAI) {
      return "Tous les services fonctionnent normalement. Le chatbot utilise l'IA avancée.";
    }
    if (diagnostics.systemStatus.aiRouter === 'operational') {
      return "Services partiellement disponibles. Le chatbot fonctionne en mode hybride.";
    }
    return "Services IA indisponibles. Le chatbot fonctionne en mode local intelligent.";
  };

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            État Général du Système
          </CardTitle>
          <CardDescription>
            Surveillance en temps réel des services IA et chatbot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className={`font-medium ${getSystemHealthColor()}`}>
                {getSystemHealthMessage()}
              </div>
              <div className="text-sm text-muted-foreground">
                Dernière vérification : {diagnostics.systemStatus.lastChecked.toLocaleTimeString()}
              </div>
            </div>
            <Button onClick={checkSystemHealth} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm font-medium">Connectivité</div>
              <div className="flex items-center gap-2">
                {diagnostics.isOnline ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  {diagnostics.isOnline ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
              <ConnectionQualityBadge quality={diagnostics.connectionQuality} />
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Mode Recommandé</div>
              <RecommendedModeBadge mode={diagnostics.recommendedMode} />
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Router IA</div>
              <StatusBadge status={diagnostics.systemStatus.aiRouter} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Détail des services IA */}
      <Card>
        <CardHeader>
          <CardTitle>Services IA Disponibles</CardTitle>
          <CardDescription>
            État détaillé de chaque provider d'intelligence artificielle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <span className="font-medium">OpenAI</span>
              </div>
              <StatusBadge status={diagnostics.systemStatus.openai} />
              <div className="text-xs text-muted-foreground">
                GPT-4o Mini • Conversations naturelles
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <span className="font-medium">Mistral AI</span>
              </div>
              <StatusBadge status={diagnostics.systemStatus.mistral} />
              <div className="text-xs text-muted-foreground">
                Mistral Small • Français optimisé
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <span className="font-medium">DeepSeek</span>
              </div>
              <StatusBadge status={diagnostics.systemStatus.deepseek} />
              <div className="text-xs text-muted-foreground">
                DeepSeek Chat • Coût optimisé
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                <span className="font-medium">Fallback Local</span>
              </div>
              <StatusBadge status={diagnostics.systemStatus.fallback} />
              <div className="text-xs text-muted-foreground">
                Chatbot intelligent • Toujours disponible
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommandations */}
      {shouldUseFallback && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Mode Local Actif:</strong> Le chatbot fonctionne actuellement en mode local intelligent. 
            Il peut répondre aux questions courantes sur la réparation de smartphones. 
            Pour des diagnostics avancés, configurez au moins une clé API dans les paramètres.
          </AlertDescription>
        </Alert>
      )}
      
      {diagnostics.recommendedMode === 'hybrid' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Mode Hybride:</strong> Certains services IA sont disponibles mais la connexion peut être instable. 
            Le système bascule automatiquement vers le mode local si nécessaire.
          </AlertDescription>
        </Alert>
      )}
      
      {canUseAI && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Optimal:</strong> Tous les services fonctionnent correctement. 
            Le chatbot utilise l'IA avancée pour des diagnostics précis.
          </AlertDescription>
        </Alert>
      )}

      {/* Tests avancés */}
      <AIServicesTester />
    </div>
  );
};