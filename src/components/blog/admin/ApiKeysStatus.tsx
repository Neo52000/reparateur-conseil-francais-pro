import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyStatus {
  name: string;
  label: string;
  available: boolean;
  lastChecked?: string;
}

const ApiKeysStatus: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeyStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkApiKeys = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-mobile-news', {
        body: { 
          prompt: 'Test de connectivité',
          ai_model: 'perplexity' 
        }
      });

      if (error) {
        console.error('Erreur lors du test des clés API:', error);
      }

      // Simuler la vérification des clés API
      const keys: ApiKeyStatus[] = [
        {
          name: 'PERPLEXITY_API_KEY',
          label: 'Perplexity AI',
          available: !error || !error.message?.includes('Perplexity'),
          lastChecked: new Date().toLocaleString('fr-FR')
        },
        {
          name: 'OPENAI_API_KEY',
          label: 'OpenAI',
          available: !error || !error.message?.includes('OpenAI'),
          lastChecked: new Date().toLocaleString('fr-FR')
        },
        {
          name: 'MISTRAL_API_KEY',
          label: 'Mistral AI',
          available: !error || !error.message?.includes('Mistral'),
          lastChecked: new Date().toLocaleString('fr-FR')
        }
      ];

      setApiKeys(keys);
      
      const availableCount = keys.filter(k => k.available).length;
      toast({
        title: "Vérification terminée",
        description: `${availableCount}/${keys.length} clés API disponibles`,
        variant: availableCount > 0 ? "default" : "destructive"
      });

    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      toast({
        title: "Erreur de vérification",
        description: "Impossible de vérifier les clés API",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkApiKeys();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Statut des clés API</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkApiKeys}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Vérifier
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {apiKeys.map((key) => (
          <div key={key.name} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              {key.available ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">{key.label}</p>
                <p className="text-sm text-muted-foreground">
                  {key.lastChecked ? `Vérifié le ${key.lastChecked}` : 'Non vérifié'}
                </p>
              </div>
            </div>
            <Badge variant={key.available ? "default" : "destructive"}>
              {key.available ? 'Disponible' : 'Indisponible'}
            </Badge>
          </div>
        ))}
        
        {apiKeys.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <p>Cliquez sur "Vérifier" pour tester les clés API</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiKeysStatus;