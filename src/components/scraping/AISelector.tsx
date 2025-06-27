
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Star, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AISelectorProps {
  selectedAI: string;
  onAIChange: (ai: string) => void;
  onApiKeyChange: (apiKey: string) => void;
}

const AISelector: React.FC<AISelectorProps> = ({ 
  selectedAI, 
  onAIChange, 
  onApiKeyChange 
}) => {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyStatuses, setApiKeyStatuses] = useState<Record<string, 'configured' | 'needs_config'>>({
    mistral: 'configured',
    deepseek: 'needs_config',
    openai: 'configured'
  });
  const { toast } = useToast();

  // Vérifier la disponibilité des clés API au chargement
  useEffect(() => {
    const checkApiKeyAvailability = async () => {
      try {
        // Test DeepSeek API availability
        const { data: deepseekTest, error: deepseekError } = await supabase.functions.invoke('deepseek-classify', {
          body: { 
            repairersData: [{ name: 'test', address: 'test' }], 
            prompt: 'test' 
          }
        });

        // Si pas d'erreur de clé API, alors DeepSeek est configuré
        if (!deepseekError || !deepseekError.message?.includes('API key')) {
          setApiKeyStatuses(prev => ({
            ...prev,
            deepseek: 'configured'
          }));
        }
      } catch (error) {
        console.log('DeepSeek API key check:', error);
        // Garder le statut par défaut si erreur
      }
    };

    checkApiKeyAvailability();
  }, []);

  const AI_OPTIONS = [
    {
      id: 'mistral',
      name: 'Mistral AI',
      icon: Brain,
      description: 'IA française, rapide et efficace',
      capabilities: ['Classification', 'Nettoyage', 'Géolocalisation'],
      pricing: 'Gratuit (limite)',
      status: apiKeyStatuses.mistral
    },
    {
      id: 'deepseek',
      name: 'DeepSeek',
      icon: Zap,
      description: 'IA performante pour l\'analyse de données',
      capabilities: ['Classification avancée', 'Enrichissement', 'Validation'],
      pricing: 'API payante',
      status: apiKeyStatuses.deepseek
    },
    {
      id: 'openai',
      name: 'OpenAI GPT',
      icon: Star,
      description: 'IA de référence, très précise',
      capabilities: ['Classification experte', 'Analyse complexe', 'Géocodage'],
      pricing: 'API payante',
      status: apiKeyStatuses.openai
    }
  ];

  const handleAISelect = (aiId: string) => {
    onAIChange(aiId);
    
    const selectedOption = AI_OPTIONS.find(ai => ai.id === aiId);
    if (selectedOption?.status === 'needs_config') {
      setShowApiKeyInput(true);
    }
    
    toast({
      title: "IA sélectionnée",
      description: `${selectedOption?.name} sera utilisée pour le scraping`,
    });
  };

  const handleApiKeySubmit = (aiId: string) => {
    const apiKey = apiKeys[aiId];
    if (apiKey) {
      onApiKeyChange(apiKey);
      setShowApiKeyInput(false);
      toast({
        title: "Clé API configurée",
        description: `${AI_OPTIONS.find(ai => ai.id === aiId)?.name} est maintenant configurée`,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'configured':
        return <Badge className="bg-green-100 text-green-800">Configuré</Badge>;
      case 'needs_config':
        return <Badge className="bg-orange-100 text-orange-800">Configuration requise</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Non disponible</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Sélection de l'IA pour le scraping
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {AI_OPTIONS.map((ai) => {
            const Icon = ai.icon;
            const isSelected = selectedAI === ai.id;
            
            return (
              <div
                key={ai.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => handleAISelect(ai.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-2 text-blue-600" />
                    <h3 className="font-semibold">{ai.name}</h3>
                  </div>
                  {getStatusBadge(ai.status)}
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{ai.description}</p>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Capacités:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ai.capabilities.map((cap, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-gray-500">Tarif:</p>
                    <p className="text-xs text-gray-600">{ai.pricing}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Configuration API Key pour DeepSeek */}
        {showApiKeyInput && selectedAI === 'deepseek' && apiKeyStatuses.deepseek === 'needs_config' && (
          <div className="mt-6 p-4 border rounded-lg bg-orange-50">
            <h4 className="font-semibold mb-3 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Configuration DeepSeek
            </h4>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="deepseek-api-key">Clé API DeepSeek</Label>
                <Input
                  id="deepseek-api-key"
                  type="password"
                  placeholder="sk-..."
                  value={apiKeys.deepseek || ''}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, deepseek: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Obtenez votre clé API sur{' '}
                  <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    platform.deepseek.com
                  </a>
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleApiKeySubmit('deepseek')}
                  disabled={!apiKeys.deepseek}
                  size="sm"
                >
                  Configurer
                </Button>
                <Button 
                  onClick={() => setShowApiKeyInput(false)}
                  variant="outline"
                  size="sm"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Informations sur l'IA sélectionnée */}
        {selectedAI && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-1">
              IA sélectionnée: {AI_OPTIONS.find(ai => ai.id === selectedAI)?.name}
            </h4>
            <p className="text-sm text-blue-700">
              Cette IA sera utilisée pour classifier et nettoyer les données lors du scraping.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AISelector;
