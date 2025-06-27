
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap } from 'lucide-react';

interface ApiKeyConfigurationProps {
  apiKey: string;
  onApiKeyChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const ApiKeyConfiguration: React.FC<ApiKeyConfigurationProps> = ({
  apiKey,
  onApiKeyChange,
  onSubmit,
  onCancel
}) => {
  return (
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
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
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
            onClick={onSubmit}
            disabled={!apiKey}
            size="sm"
          >
            Configurer
          </Button>
          <Button 
            onClick={onCancel}
            variant="outline"
            size="sm"
          >
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyConfiguration;
