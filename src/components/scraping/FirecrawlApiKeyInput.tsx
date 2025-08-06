
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { Key, CheckCircle, AlertTriangle } from 'lucide-react';

const FirecrawlApiKeyInput = () => {
  const [apiKey, setApiKey] = useState('fc-0b839f0e15f64016bd5865a920aa73dd');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'none' | 'valid' | 'invalid'>('none');
  const { toast } = useToast();

  useEffect(() => {
    // Auto-configure la clé API fournie
    if (apiKey && keyStatus === 'none') {
      handleTestApiKey();
    }
  }, []);

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une clé API",
        variant: "destructive"
      });
      return;
    }

    setIsTestingKey(true);
    
    try {
      const isValid = await FirecrawlService.testApiKey(apiKey.trim());
      
      if (isValid) {
        FirecrawlService.saveApiKey(apiKey.trim());
        setKeyStatus('valid');
        toast({
          title: "✅ Clé API valide",
          description: "Votre clé Firecrawl a été sauvegardée avec succès"
        });
      } else {
        setKeyStatus('invalid');
        toast({
          title: "❌ Clé API invalide",
          description: "Vérifiez votre clé API Firecrawl",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur test API:', error);
      setKeyStatus('invalid');
      toast({
        title: "Erreur de test",
        description: "Impossible de tester la clé API",
        variant: "destructive"
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const getStatusIcon = () => {
    switch (keyStatus) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'invalid':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Key className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (keyStatus) {
      case 'valid':
        return 'Clé API validée ✅';
      case 'invalid':
        return 'Clé API invalide ❌';
      default:
        return 'Clé API non configurée';
    }
  };

  const getStatusColor = () => {
    switch (keyStatus) {
      case 'valid':
        return 'text-green-600';
      case 'invalid':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Key className="h-5 w-5 mr-2" />
          Configuration Firecrawl API
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="firecrawl-key" className="text-sm font-medium">
            Clé API Firecrawl
          </label>
          <div className="flex space-x-2">
            <Input
              id="firecrawl-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="fc-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="flex-1"
            />
            <Button
              onClick={handleTestApiKey}
              disabled={isTestingKey || !apiKey.trim()}
              variant="outline"
            >
              {isTestingKey ? 'Test...' : 'Tester'}
            </Button>
          </div>
        </div>

        <div className={`flex items-center space-x-2 text-sm ${getStatusColor()}`}>
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">🌐 Scraping Réel avec Firecrawl</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Scraping des vraies pages Pages Jaunes et Google Places</li>
            <li>• Extraction automatique des coordonnées GPS précises</li>
            <li>• Géocodage avec Nominatim (gratuit, pas de clé requise)</li>
            <li>• Données réelles et à jour des réparateurs français</li>
          </ul>
          
          {keyStatus !== 'valid' && (
            <div className="mt-2 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
              ⚠️ Sans clé API, le système utilisera les données de test
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          <p>Pour obtenir votre clé API :</p>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Créez un compte sur <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">firecrawl.dev</a></li>
            <li>Obtenez votre clé API dans le dashboard</li>
            <li>Collez-la ici et testez-la</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default FirecrawlApiKeyInput;
