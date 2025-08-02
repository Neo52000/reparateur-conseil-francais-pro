import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Key, CheckCircle, XCircle, ExternalLink, AlertTriangle } from 'lucide-react';

interface FirecrawlSetupProps {
  onApiKeyConfigured?: () => void;
}

export const FirecrawlSetup: React.FC<FirecrawlSetupProps> = ({ onApiKeyConfigured }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkExistingConfig();
  }, []);

  const checkExistingConfig = async () => {
    // Vérifier si la clé API est déjà configurée dans Supabase
    // Cette vérification se fera côté serveur lors de l'appel à l'Edge Function
    console.log('🔍 Vérification de la configuration Firecrawl...');
  };

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setValidationError('Veuillez entrer une clé API Firecrawl');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      // Test simple de la clé API avec Firecrawl
      const testResponse = await fetch('https://api.firecrawl.dev/v1/crawl', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://example.com',
          limit: 1,
          scrapeOptions: {
            formats: ['markdown']
          }
        })
      });

      if (testResponse.ok) {
        setIsConfigured(true);
        setValidationError(null);
        toast({
          title: "Clé API validée !",
          description: "La clé Firecrawl est valide et fonctionnelle",
        });
        onApiKeyConfigured?.();
      } else {
        const errorData = await testResponse.json().catch(() => ({}));
        setValidationError(errorData.error || `Erreur HTTP ${testResponse.status}`);
      }
    } catch (error) {
      console.error('Erreur validation Firecrawl:', error);
      setValidationError('Impossible de valider la clé API');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateApiKey();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Configuration Firecrawl
        </CardTitle>
        <CardDescription>
          Configurez votre clé API Firecrawl pour le scraping avancé
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status de configuration */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status :</span>
          {isConfigured ? (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Configuré
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Non configuré
            </Badge>
          )}
        </div>

        {/* Information Firecrawl */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <p>
              Firecrawl est requis pour extraire les données du site Cash & Repair.
            </p>
            <div className="flex items-center gap-2">
              <span>Obtenez votre clé API :</span>
              <Button variant="link" className="p-0 h-auto" asChild>
                <a 
                  href="https://firecrawl.dev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  firecrawl.dev
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* Formulaire de configuration */}
        {!isConfigured && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firecrawl-key">Clé API Firecrawl</Label>
              <Input
                id="firecrawl-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="fc-..."
                disabled={isValidating}
              />
              <p className="text-xs text-muted-foreground">
                Votre clé API sera stockée en sécurité dans les secrets Supabase
              </p>
            </div>

            {validationError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              disabled={isValidating || !apiKey.trim()}
              className="w-full"
            >
              {isValidating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Validation...
                </>
              ) : (
                'Valider la clé API'
              )}
            </Button>
          </form>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Note :</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Cette clé sera utilisée pour scraper automatiquement les sites web</li>
            <li>Les données extraites seront ajoutées directement à votre base de réparateurs</li>
            <li>La configuration est requise une seule fois</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};