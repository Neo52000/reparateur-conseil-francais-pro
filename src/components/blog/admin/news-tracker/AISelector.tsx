
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Brain, Zap, Bot } from 'lucide-react';

interface AISelectorProps {
  selectedAI: 'perplexity' | 'openai' | 'mistral';
  onAIChange: (ai: 'perplexity' | 'openai' | 'mistral') => void;
}

const AISelector: React.FC<AISelectorProps> = ({ selectedAI, onAIChange }) => {
  return (
    <div>
      <Label>Sélection de l'IA</Label>
      <div className="flex gap-2 mt-2">
        <Button
          onClick={() => onAIChange('perplexity')}
          variant={selectedAI === 'perplexity' ? 'default' : 'outline'}
          className={selectedAI === 'perplexity' ? 'bg-purple-500 hover:bg-purple-600 text-white' : ''}
          size="sm"
        >
          <Zap className="h-4 w-4 mr-2" />
          Perplexity
        </Button>
        <Button
          onClick={() => onAIChange('openai')}
          variant={selectedAI === 'openai' ? 'default' : 'outline'}
          className={selectedAI === 'openai' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
          size="sm"
        >
          <Brain className="h-4 w-4 mr-2" />
          OpenAI
        </Button>
        <Button
          onClick={() => onAIChange('mistral')}
          variant={selectedAI === 'mistral' ? 'default' : 'outline'}
          className={selectedAI === 'mistral' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
          size="sm"
        >
          <Bot className="h-4 w-4 mr-2" />
          Mistral
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        IA sélectionnée : <span className="font-medium capitalize">{selectedAI}</span>
      </p>
    </div>
  );
};

export default AISelector;
