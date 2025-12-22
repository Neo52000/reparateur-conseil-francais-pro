import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Key,
  CreditCard,
  Zap,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIProviderStatus {
  name: string;
  key: string;
  status: 'active' | 'error' | 'warning' | 'unknown';
  message: string;
  lastCheck?: string;
  credits?: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
  docsUrl?: string;
}

const AIStatusDashboard: React.FC = () => {
  const [providers, setProviders] = useState<AIProviderStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastGlobalCheck, setLastGlobalCheck] = useState<string | null>(null);
  const { toast } = useToast();

  const checkProviderStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-ai-status');

      if (error) {
        console.error('Erreur vérification API:', error);
        // Fallback: show basic status
        setProviders([
          {
            name: 'Lovable AI',
            key: 'LOVABLE_API_KEY',
            status: 'unknown',
            message: 'Impossible de vérifier - fonction non disponible',
            docsUrl: 'https://docs.lovable.dev/features/ai'
          },
          {
            name: 'OpenAI',
            key: 'OPENAI_API_KEY',
            status: 'unknown',
            message: 'Impossible de vérifier',
            docsUrl: 'https://platform.openai.com/api-keys'
          },
          {
            name: 'Google Gemini',
            key: 'GEMINI_API_KEY',
            status: 'unknown',
            message: 'Impossible de vérifier',
            docsUrl: 'https://aistudio.google.com/apikey'
          },
          {
            name: 'Mistral AI',
            key: 'CLE_API_MISTRAL',
            status: 'unknown',
            message: 'Impossible de vérifier',
            docsUrl: 'https://console.mistral.ai/api-keys'
          }
        ]);
        return;
      }

      if (data?.providers) {
        setProviders(data.providers);
        setLastGlobalCheck(new Date().toISOString());
        
        const activeCount = data.providers.filter((p: AIProviderStatus) => p.status === 'active').length;
        const errorCount = data.providers.filter((p: AIProviderStatus) => p.status === 'error').length;
        
        toast({
          title: "Vérification terminée",
          description: `${activeCount} API(s) active(s), ${errorCount} erreur(s)`,
          variant: errorCount > 0 ? "destructive" : "default"
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur de vérification",
        description: "Impossible de vérifier le statut des APIs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkProviderStatus();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Actif</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500 text-black">Attention</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const activeProviders = providers.filter(p => p.status === 'active').length;
  const hasWorkingProvider = activeProviders > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              État des APIs IA
            </CardTitle>
            <CardDescription>
              Surveillance des fournisseurs d'IA pour l'automatisation du blog
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkProviderStatus}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Global Status */}
        <Alert className={hasWorkingProvider ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-red-500 bg-red-50 dark:bg-red-950/20'}>
          {hasWorkingProvider ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <AlertTitle>
            {hasWorkingProvider 
              ? `${activeProviders} fournisseur(s) IA actif(s)` 
              : 'Aucun fournisseur IA disponible'
            }
          </AlertTitle>
          <AlertDescription>
            {hasWorkingProvider 
              ? "L'automatisation du blog peut fonctionner normalement."
              : "L'automatisation du blog ne peut pas fonctionner. Configurez au moins une clé API valide."
            }
          </AlertDescription>
        </Alert>

        {/* Provider List */}
        <div className="space-y-3">
          {providers.map((provider) => (
            <div 
              key={provider.key} 
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(provider.status)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{provider.name}</span>
                    {getStatusBadge(provider.status)}
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Key className="h-3 w-3" />
                    {provider.key}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {provider.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Credits Display */}
                {provider.credits && !provider.credits.unlimited && (
                  <div className="text-right min-w-[120px]">
                    <div className="flex items-center gap-1 text-sm">
                      <CreditCard className="h-3 w-3" />
                      <span>{provider.credits.used} / {provider.credits.limit}</span>
                    </div>
                    <Progress 
                      value={(provider.credits.used / provider.credits.limit) * 100} 
                      className="h-2 mt-1"
                    />
                  </div>
                )}
                
                {provider.credits?.unlimited && (
                  <Badge variant="outline" className="text-green-600">
                    Illimité
                  </Badge>
                )}

                {/* Docs Link */}
                {provider.docsUrl && (
                  <a 
                    href={provider.docsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Last Check */}
        {lastGlobalCheck && (
          <p className="text-xs text-muted-foreground text-right">
            Dernière vérification : {new Date(lastGlobalCheck).toLocaleString('fr-FR')}
          </p>
        )}

        {/* Help Section */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Système de fallback intelligent</AlertTitle>
          <AlertDescription className="text-sm">
            L'automatisation essaie les APIs dans l'ordre : <strong>Lovable AI → Gemini Pro → OpenAI → Mistral</strong>. 
            Si une API échoue, la suivante est automatiquement utilisée.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default AIStatusDashboard;
