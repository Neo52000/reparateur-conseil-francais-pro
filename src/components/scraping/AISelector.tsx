
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AISelectorProps, AIOption } from './ai-selector/types';
import { AI_BASE_OPTIONS } from './ai-selector/constants';
import { useApiKeyStatus } from './ai-selector/useApiKeyStatus';
import AIOptionCard from './ai-selector/AIOptionCard';
import ApiKeyConfiguration from './ai-selector/ApiKeyConfiguration';
import SelectedAIInfo from './ai-selector/SelectedAIInfo';

const AISelector: React.FC<AISelectorProps> = ({ 
  selectedAI, 
  onAIChange, 
  onApiKeyChange 
}) => {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const apiKeyStatuses = useApiKeyStatus();
  const { toast } = useToast();

  const AI_OPTIONS: AIOption[] = AI_BASE_OPTIONS.map(baseOption => ({
    ...baseOption,
    status: apiKeyStatuses[baseOption.id]
  }));

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
          {AI_OPTIONS.map((ai) => (
            <AIOptionCard
              key={ai.id}
              ai={ai}
              isSelected={selectedAI === ai.id}
              onSelect={handleAISelect}
            />
          ))}
        </div>

        {/* Configuration API Key pour DeepSeek */}
        {showApiKeyInput && selectedAI === 'deepseek' && apiKeyStatuses.deepseek === 'needs_config' && (
          <ApiKeyConfiguration
            apiKey={apiKeys.deepseek || ''}
            onApiKeyChange={(value) => setApiKeys(prev => ({ ...prev, deepseek: value }))}
            onSubmit={() => handleApiKeySubmit('deepseek')}
            onCancel={() => setShowApiKeyInput(false)}
          />
        )}

        {/* Informations sur l'IA sélectionnée */}
        <SelectedAIInfo selectedAI={selectedAI} aiOptions={AI_OPTIONS} />
      </CardContent>
    </Card>
  );
};

export default AISelector;
