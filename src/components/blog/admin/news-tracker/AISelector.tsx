
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Brain, Zap, Bot, Sparkles, Search } from 'lucide-react';

// Ordre de priorité: Lovable AI → OpenAI → Gemini → Mistral → Perplexity
type AIProvider = 'lovable' | 'openai' | 'gemini' | 'mistral' | 'perplexity';

interface AISelectorProps {
  selectedAI: AIProvider;
  onAIChange: (ai: AIProvider) => void;
}

const AISelector: React.FC<AISelectorProps> = ({ selectedAI, onAIChange }) => {
  const aiOptions: { id: AIProvider; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'lovable', label: 'Lovable AI', icon: <Sparkles className="h-4 w-4 mr-2" />, color: 'bg-primary hover:bg-primary/90' },
    { id: 'openai', label: 'OpenAI', icon: <Brain className="h-4 w-4 mr-2" />, color: 'bg-green-500 hover:bg-green-600' },
    { id: 'gemini', label: 'Gemini', icon: <Bot className="h-4 w-4 mr-2" />, color: 'bg-blue-500 hover:bg-blue-600' },
    { id: 'mistral', label: 'Mistral', icon: <Zap className="h-4 w-4 mr-2" />, color: 'bg-orange-500 hover:bg-orange-600' },
    { id: 'perplexity', label: 'Perplexity', icon: <Search className="h-4 w-4 mr-2" />, color: 'bg-purple-500 hover:bg-purple-600' },
  ];

  return (
    <div>
      <Label>Sélection de l'IA (ordre de priorité)</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {aiOptions.map((option) => (
          <Button
            key={option.id}
            onClick={() => onAIChange(option.id)}
            variant={selectedAI === option.id ? 'default' : 'outline'}
            className={selectedAI === option.id ? `${option.color} text-white` : ''}
            size="sm"
          >
            {option.icon}
            {option.label}
          </Button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        IA sélectionnée : <span className="font-medium capitalize">{selectedAI}</span>
      </p>
    </div>
  );
};

export default AISelector;
