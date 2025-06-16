
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Settings, 
  Filter, 
  Target, 
  Clock,
  Shield,
  Zap,
  Globe,
  HelpCircle,
  Info,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ScrapingConfigPanel = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    aiModel: 'mistral-small-latest',
    confidenceThreshold: [0.6],
    maxItemsPerSession: 100,
    enableDeduplication: true,
    enableGeoValidation: true,
    customPrompt: '',
    sources: ['pages_jaunes', 'google_places'],
    rateLimit: 5,
    retryAttempts: 3,
    enableNotifications: true,
    testMode: false
  });

  const [showPromptHelp, setShowPromptHelp] = useState(false);

  const defaultPrompts = {
    repairer: `Analyse cette entreprise et détermine s'il s'agit d'un réparateur de téléphones/électronique. 
Critères prioritaires:
- Services de réparation (écrans, batteries, etc.)
- Mots-clés: "réparation", "iPhone", "Samsung", "smartphone"
- Éviter: restaurants, coiffeurs, médecins

Réponds en JSON avec: is_repairer, services[], specialties[], price_range, confidence, is_open`,
    
    strict: `Classification stricte pour réparateurs de smartphones uniquement.
Exigences:
- Mention explicite de "réparation téléphone" ou "smartphone"
- Pas d'autres activités principales (vente uniquement, accessoires)
- Services techniques confirmés

Seuil de confiance minimum: 0.8`,

    permissive: `Classification permissive incluant services électroniques connexes.
Inclure:
- Réparation téléphones, tablettes, ordinateurs
- Services informatiques avec réparation
- Magasins avec service après-vente

Seuil de confiance minimum: 0.4`
  };

  const handleSaveConfig = () => {
    // Sauvegarder la configuration dans localStorage
    localStorage.setItem('scrapingConfig', JSON.stringify(config));
    toast({
      title: "Configuration sauvegardée",
      description: "Les paramètres ont été mis à jour avec succès."
    });
  };

  const resetConfig = () => {
    const defaultConfig = {
      aiModel: 'mistral-small-latest',
      confidenceThreshold: [0.6],
      maxItemsPerSession: 100,
      enableDeduplication: true,
      enableGeoValidation: true,
      customPrompt: '',
      sources: ['pages_jaunes', 'google_places'],
      rateLimit: 5,
      retryAttempts: 3,
      enableNotifications: true,
      testMode: false
    };
    setConfig(defaultConfig);
    localStorage.removeItem('scrapingConfig');
    toast({
      title: "Configuration réinitialisée",
      description: "Tous les paramètres ont été remis par défaut."
    });
  };

  const applyPromptTemplate = (template: keyof typeof defaultPrompts) => {
    setConfig(prev => ({ ...prev, customPrompt: defaultPrompts[template] }));
  };

  // Charger la configuration au montage
  React.useEffect(() => {
    const savedConfig = localStorage.getItem('scrapingConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
      }
    }
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Configuration IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-600" />
            Configuration IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Si les API Mistral/OpenAI ne sont pas configurées, le système utilisera une classification par mots-clés (moins précise).
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="ai-model">Modèle IA</Label>
            <Select value={config.aiModel} onValueChange={(value) => 
              setConfig(prev => ({ ...prev, aiModel: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mistral-small-latest">Mistral Small (Rapide)</SelectItem>
                <SelectItem value="mistral-medium-latest">Mistral Medium (Équilibré)</SelectItem>
                <SelectItem value="mistral-large-latest">Mistral Large (Précis)</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Seuil de confiance: {config.confidenceThreshold[0]}</Label>
            <Slider
              value={config.confidenceThreshold}
              onValueChange={(value) => setConfig(prev => ({ ...prev, confidenceThreshold: value }))}
              max={1}
              min={0.1}
              step={0.1}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.1 (Permissif)</span>
              <span>1.0 (Strict)</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="test-mode">Mode test (sans IA)</Label>
            <Switch
              id="test-mode"
              checked={config.testMode}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, testMode: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="dedup">Déduplication intelligente</Label>
            <Switch
              id="dedup"
              checked={config.enableDeduplication}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, enableDeduplication: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="geo">Validation géographique</Label>
            <Switch
              id="geo"
              checked={config.enableGeoValidation}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, enableGeoValidation: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Prompt Personnalisé */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-green-600" />
              Prompt Personnalisé
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPromptHelp(!showPromptHelp)}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showPromptHelp && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Le prompt personnalisé permet de :</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Définir des critères spécifiques de classification</li>
                    <li>Ajuster la précision selon vos besoins</li>
                    <li>Cibler des types d'entreprises particuliers</li>
                    <li>Personnaliser le format de réponse JSON</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Label>Templates prédéfinis</Label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPromptTemplate('repairer')}
                className="justify-start"
              >
                🎯 Standard - Réparateurs mobiles
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPromptTemplate('strict')}
                className="justify-start"
              >
                🔒 Strict - Smartphones uniquement
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPromptTemplate('permissive')}
                className="justify-start"
              >
                🌐 Permissif - Services électroniques
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="custom-prompt">Instructions personnalisées</Label>
            <Textarea
              id="custom-prompt"
              placeholder="Saisissez vos instructions spécifiques pour l'IA..."
              value={config.customPrompt}
              onChange={(e) => setConfig(prev => ({ ...prev, customPrompt: e.target.value }))}
              className="mt-1 h-32"
            />
            <p className="text-xs text-gray-500 mt-1">
              {config.customPrompt.length}/2000 caractères
            </p>
          </div>

          {config.customPrompt && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-1">Aperçu du prompt :</p>
              <p className="text-xs text-blue-800 line-clamp-3">
                {config.customPrompt.slice(0, 150)}...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2 text-blue-600" />
            Sources de Données
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Sources actives</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {['pages_jaunes', 'google_places', 'facebook', 'yelp'].map((source) => (
                <div key={source} className="flex items-center space-x-2">
                  <Switch
                    checked={config.sources.includes(source)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setConfig(prev => ({ ...prev, sources: [...prev.sources, source] }));
                      } else {
                        setConfig(prev => ({ ...prev, sources: prev.sources.filter(s => s !== source) }));
                      }
                    }}
                  />
                  <Label className="text-sm capitalize">{source.replace('_', ' ')}</Label>
                </div>
              ))}
            </div>
            <div className="mt-2">
              {config.sources.map((source) => (
                <Badge key={source} variant="secondary" className="mr-1">
                  {source}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <Label htmlFor="max-items">Max items par session</Label>
            <Input
              id="max-items"
              type="number"
              value={config.maxItemsPerSession}
              onChange={(e) => setConfig(prev => ({ ...prev, maxItemsPerSession: parseInt(e.target.value) }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="rate-limit">Limite de taux (req/sec)</Label>
            <Input
              id="rate-limit"
              type="number"
              value={config.rateLimit}
              onChange={(e) => setConfig(prev => ({ ...prev, rateLimit: parseInt(e.target.value) }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="retry">Tentatives de retry</Label>
            <Input
              id="retry"
              type="number"
              value={config.retryAttempts}
              onChange={(e) => setConfig(prev => ({ ...prev, retryAttempts: parseInt(e.target.value) }))}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuration Avancée */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2 text-gray-600" />
            Paramètres Avancés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Filtrer entreprises fermées</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Ignorer doublons</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Validation téléphone</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Notifications</Label>
                  <Switch 
                    checked={config.enableNotifications}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({ ...prev, enableNotifications: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Timing
              </h4>
              <div className="space-y-2">
                <Label className="text-sm">Délai entre requêtes (ms)</Label>
                <Input type="number" defaultValue="1000" />
                <Label className="text-sm">Timeout session (min)</Label>
                <Input type="number" defaultValue="30" />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t space-y-2">
            <Button onClick={handleSaveConfig} className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Sauvegarder la Configuration
            </Button>
            <Button onClick={resetConfig} variant="outline" className="w-full">
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrapingConfigPanel;
