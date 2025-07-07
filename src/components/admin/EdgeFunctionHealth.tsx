import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Activity,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface EdgeFunctionStatus {
  name: string;
  displayName: string;
  status: 'healthy' | 'error' | 'timeout' | 'unknown';
  lastChecked: string;
  responseTime?: number;
  error?: string;
  description: string;
}

const EdgeFunctionHealth: React.FC = () => {
  const { toast } = useToast();
  const [functions, setFunctions] = useState<EdgeFunctionStatus[]>([]);
  const [checking, setChecking] = useState(false);

  const edgeFunctions = [
    {
      name: 'apify-scraping',
      displayName: 'Apify Scraping',
      description: 'Service de scraping premium avec Apify',
      testPayload: { action: 'status', jobId: 'test' }
    },
    {
      name: 'serper-search',
      displayName: 'Serper Search',
      description: 'Recherche avec l\'API Serper',
      testPayload: { query: 'test', num: 1 }
    },
    {
      name: 'unified-scraping',
      displayName: 'Scraping Unifié',
      description: 'Pipeline de scraping unifié',
      testPayload: { searchTerm: 'test', location: 'France', sources: [], previewMode: true }
    },
    {
      name: 'multi-ai-pipeline',
      displayName: 'Pipeline Multi-IA',
      description: 'Pipeline de collecte et enrichissement IA',
      testPayload: { searchTerm: 'test', location: 'France', testMode: true }
    }
  ];

  const checkFunctionHealth = async (func: typeof edgeFunctions[0]): Promise<EdgeFunctionStatus> => {
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.functions.invoke(func.name, {
        body: func.testPayload
      });
      
      const responseTime = Date.now() - startTime;
      
      if (error) {
        logger.error(`Edge function ${func.name} error:`, error);
        return {
          name: func.name,
          displayName: func.displayName,
          description: func.description,
          status: responseTime > 10000 ? 'timeout' : 'error',
          lastChecked: new Date().toLocaleString('fr-FR'),
          responseTime,
          error: error.message || 'Erreur inconnue'
        };
      }
      
      return {
        name: func.name,
        displayName: func.displayName,
        description: func.description,
        status: 'healthy',
        lastChecked: new Date().toLocaleString('fr-FR'),
        responseTime
      };
    } catch (error) {
      logger.error(`Edge function ${func.name} exception:`, error);
      return {
        name: func.name,
        displayName: func.displayName,
        description: func.description,
        status: 'error',
        lastChecked: new Date().toLocaleString('fr-FR'),
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  };

  const checkAllFunctions = async () => {
    setChecking(true);
    
    try {
      const results = await Promise.all(
        edgeFunctions.map(func => checkFunctionHealth(func))
      );
      
      setFunctions(results);
      
      const healthyCount = results.filter(f => f.status === 'healthy').length;
      toast({
        title: "Vérification terminée",
        description: `${healthyCount}/${results.length} Edge Functions opérationnelles`,
        variant: healthyCount === results.length ? "default" : "destructive"
      });
      
    } catch (error) {
      logger.error('EdgeFunctionHealth.checkAll error:', error);
      toast({
        title: "Erreur de vérification",
        description: error instanceof Error ? error.message : 'Erreur inconnue',
        variant: "destructive"
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkAllFunctions();
  }, []);

  const getStatusIcon = (status: EdgeFunctionStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'timeout':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: EdgeFunctionStatus['status']) => {
    const variants = {
      healthy: 'default',
      error: 'destructive',
      timeout: 'secondary',
      unknown: 'outline'
    } as const;

    const labels = {
      healthy: 'Opérationnel',
      error: 'Erreur',
      timeout: 'Timeout',
      unknown: 'Inconnu'
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2 text-primary" />
          État des Edge Functions
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkAllFunctions}
          disabled={checking}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
          Vérifier
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {functions.length === 0 && !checking && (
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              Cliquez sur "Vérifier" pour tester l'état des Edge Functions
            </AlertDescription>
          </Alert>
        )}

        {checking && (
          <div className="text-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Vérification en cours...</p>
          </div>
        )}

        {functions.map((func) => (
          <div key={func.name} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                {getStatusIcon(func.status)}
                <div>
                  <h4 className="font-medium">{func.displayName}</h4>
                  <p className="text-sm text-muted-foreground">{func.description}</p>
                </div>
              </div>
              {getStatusBadge(func.status)}
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Dernière vérification:</span>
                <span>{func.lastChecked}</span>
              </div>
              
              {func.responseTime && (
                <div className="flex justify-between">
                  <span>Temps de réponse:</span>
                  <span className={func.responseTime > 5000 ? 'text-orange-500' : 'text-green-600'}>
                    {func.responseTime}ms
                  </span>
                </div>
              )}
              
              {func.error && (
                <div className="text-red-500 text-xs mt-2 p-2 bg-red-50 rounded">
                  <strong>Erreur:</strong> {func.error}
                </div>
              )}
            </div>
          </div>
        ))}

        {functions.length > 0 && (
          <div className="text-center pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-green-600">
                  {functions.filter(f => f.status === 'healthy').length}
                </span>
                <span className="text-muted-foreground ml-1">Opérationnels</span>
              </div>
              <div>
                <span className="font-medium text-red-600">
                  {functions.filter(f => f.status === 'error' || f.status === 'timeout').length}
                </span>
                <span className="text-muted-foreground ml-1">En erreur</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EdgeFunctionHealth;