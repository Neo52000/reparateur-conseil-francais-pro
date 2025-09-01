import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Play, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Zap,
  Bot,
  MessageSquare,
  Timer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  provider: string;
  success: boolean;
  responseTime: number;
  response?: string;
  error?: string;
  timestamp: string;
}

export const AIServicesTester: React.FC = () => {
  const [testMessage, setTestMessage] = useState("Mon iPhone ne s'allume plus après être tombé dans l'eau. Que puis-je faire ?");
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [isConnectivityTesting, setIsConnectivityTesting] = useState(false);
  const [isChatTesting, setIsChatTesting] = useState(false);
  const [connectivityResults, setConnectivityResults] = useState<any>(null);
  const [chatResults, setChatResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  const testConnectivity = async () => {
    setIsConnectivityTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-ai-status', {
        body: { fullTest: true }
      });
      
      if (error) throw error;
      
      setConnectivityResults(data);
      toast({
        title: "Test de connectivité terminé",
        description: `${data.summary.available}/${data.summary.total} services disponibles`,
        variant: data.summary.available > 0 ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Erreur lors du test",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsConnectivityTesting(false);
    }
  };

  const testChatCapabilities = async () => {
    setIsChatTesting(true);
    setChatResults([]);
    
    try {
      // Test avec différents providers via ai-router
      const providers = ['openai', 'mistral', 'deepseek', 'local'];
      const results: TestResult[] = [];
      
      for (const provider of providers) {
        const startTime = Date.now();
        try {
          const { data, error } = await supabase.functions.invoke('ai-router', {
            body: {
              action: 'send_message',
              text: testMessage,
              language_hint: language,
              provider_override: provider === 'local' ? null : provider
            }
          });
          
          if (error) throw error;
          
          results.push({
            provider: data.provider || provider,
            success: true,
            responseTime: Date.now() - startTime,
            response: data.response,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          results.push({
            provider,
            success: false,
            responseTime: Date.now() - startTime,
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      setChatResults(results);
      
      const successCount = results.filter(r => r.success).length;
      toast({
        title: "Test du chatbot terminé",
        description: `${successCount}/${results.length} providers fonctionnels`,
        variant: successCount > 0 ? "default" : "destructive"
      });
      
    } catch (error) {
      toast({
        title: "Erreur lors du test du chatbot",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsChatTesting(false);
    }
  };

  const getProviderBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Disponible</Badge>;
      case 'configured':
        return <Badge variant="secondary" className="gap-1"><AlertTriangle className="h-3 w-3" />Configuré</Badge>;
      case 'needs_config':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Non configuré</Badge>;
      case 'error':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Erreur</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Test de connectivité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Test de Connectivité API
          </CardTitle>
          <CardDescription>
            Test en temps réel de la connectivité avec les services IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testConnectivity} 
            disabled={isConnectivityTesting}
            className="w-full"
          >
            {isConnectivityTesting ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isConnectivityTesting ? 'Test en cours...' : 'Tester la connectivité'}
          </Button>
          
          {connectivityResults && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Résultat du test</span>
                <Badge variant={connectivityResults.healthy ? "default" : "destructive"}>
                  {connectivityResults.recommendedMode}
                </Badge>
              </div>
              
              <div className="grid gap-3 md:grid-cols-2">
                {connectivityResults.providers.map((provider: any) => (
                  <div key={provider.name} className="flex items-center justify-between p-3 border rounded">
                    <div className="space-y-1">
                      <div className="font-medium">{provider.name}</div>
                      {provider.responseTime && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {provider.responseTime}ms
                        </div>
                      )}
                      {provider.error && (
                        <div className="text-xs text-red-500">{provider.error}</div>
                      )}
                    </div>
                    {getProviderBadge(provider.status)}
                  </div>
                ))}
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Mode recommandé:</strong> {connectivityResults.recommendedMode} • 
                  {connectivityResults.message}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test du chatbot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Test du Chatbot
          </CardTitle>
          <CardDescription>
            Test complet des capacités de réponse du chatbot avec différents providers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="test-message">Message de test</Label>
              <Textarea
                id="test-message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Entrez votre message de test..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language">Langue</Label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
                className="w-full p-2 border rounded"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
          
          <Button 
            onClick={testChatCapabilities}
            disabled={isChatTesting || !testMessage.trim()}
            className="w-full"
          >
            {isChatTesting ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Bot className="h-4 w-4 mr-2" />
            )}
            {isChatTesting ? 'Test en cours...' : 'Tester le chatbot'}
          </Button>
          
          {chatResults.length > 0 && (
            <div className="space-y-3">
              <div className="font-medium">Résultats des tests</div>
              {chatResults.map((result, index) => (
                <Card key={index} className={result.success ? 'border-green-200' : 'border-red-200'}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="space-y-1">
                        <div className="font-medium flex items-center gap-2">
                          {result.provider}
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {result.responseTime}ms
                        </div>
                      </div>
                    </div>
                    
                    {result.success && result.response && (
                      <div className="mt-3 p-3 bg-muted rounded text-sm">
                        <strong>Réponse:</strong> {result.response}
                      </div>
                    )}
                    
                    {!result.success && result.error && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <strong>Erreur:</strong> {result.error}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};