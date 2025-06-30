
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Play, RefreshCw } from 'lucide-react';

interface NewsPromptEditorProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onSave: () => void;
  onFetch: () => void;
  isLoading: boolean;
  selectedAI: string;
}

const NewsPromptEditor: React.FC<NewsPromptEditorProps> = ({
  prompt,
  onPromptChange,
  onSave,
  onFetch,
  isLoading,
  selectedAI
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="news-prompt">Prompt de recherche</Label>
        <Textarea
          id="news-prompt"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Saisir le prompt pour rechercher les actualités..."
          rows={4}
          className="mt-2"
        />
        <p className="text-sm text-muted-foreground mt-2">
          Personnalisez ce prompt pour obtenir les actualités qui vous intéressent le plus
        </p>
      </div>

      <div className="flex gap-2">
        <Button onClick={onSave} variant="outline">
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder
        </Button>
        <Button onClick={onFetch} disabled={isLoading}>
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Rechercher avec {selectedAI}
        </Button>
      </div>
    </div>
  );
};

export default NewsPromptEditor;
