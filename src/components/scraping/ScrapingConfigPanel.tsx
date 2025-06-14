
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
import { 
  Brain, 
  Settings, 
  Filter, 
  Target, 
  Clock,
  Shield,
  Zap,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ScrapingConfigPanel = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    aiModel: 'mistral-small-latest',
    confidenceThreshold: [0.8],
    maxItemsPerSession: 100,
    enableDeduplication: true,
    enableGeoValidation: true,
    customPrompt: '',
    sources: ['pages_jaunes', 'google_places'],
    rateLimit: 5,
    retryAttempts: 3,
    enableNotifications: true
  });

  const handleSaveConfig = () => {
    // Sauvegarder la configuration
    toast({
      title: "Configuration sauvegardée",
      description: "Les paramètres ont été mis à jour avec succès."
    });
  };

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

          <div>
            <Label htmlFor="custom-prompt">Prompt personnalisé</Label>
            <Textarea
              id="custom-prompt"
              placeholder="Instructions spécifiques pour l'IA..."
              value={config.customPrompt}
              onChange={(e) => setConfig(prev => ({ ...prev, customPrompt: e.target.value }))}
              className="mt-1"
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
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2 text-gray-600" />
            Paramètres Avancés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <div className="space-y-4">
              <h4 className="font-medium flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Sécurité
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Rotation User-Agent</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Proxy aléatoire</Label>
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
          </div>

          <div className="mt-6 pt-4 border-t">
            <Button onClick={handleSaveConfig} className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Sauvegarder la Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrapingConfigPanel;
