
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Wand2 } from 'lucide-react';
import { PreprocessOptions } from '@/services/blog/contentPreprocessor';

interface PreprocessingOptionsProps {
  options: PreprocessOptions;
  onOptionsChange: (options: PreprocessOptions) => void;
  onReprocess: () => void;
}

const PreprocessingOptions: React.FC<PreprocessingOptionsProps> = ({
  options,
  onOptionsChange,
  onReprocess
}) => {
  const updateOption = (key: keyof PreprocessOptions, value: boolean) => {
    onOptionsChange({
      ...options,
      [key]: value
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Options de traitement
          {options.conservative && (
            <Badge variant="secondary">Mode conservateur</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={options.conservative || false}
              onChange={(e) => updateOption('conservative', e.target.checked)}
            />
            <span>Mode conservateur (recommandé)</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={options.preserveTables || false}
              onChange={(e) => updateOption('preserveTables', e.target.checked)}
            />
            <span>Préserver les tableaux</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={options.cleanMetadata || false}
              onChange={(e) => updateOption('cleanMetadata', e.target.checked)}
            />
            <span>Nettoyer les métadonnées</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={options.convertCallouts || false}
              onChange={(e) => updateOption('convertCallouts', e.target.checked)}
            />
            <span>Convertir les callouts</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={options.normalizeLineBreaks || false}
              onChange={(e) => updateOption('normalizeLineBreaks', e.target.checked)}
            />
            <span>Normaliser les sauts</span>
          </label>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onReprocess}
          className="w-full"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          Retraiter avec ces options
        </Button>
      </CardContent>
    </Card>
  );
};

export default PreprocessingOptions;
