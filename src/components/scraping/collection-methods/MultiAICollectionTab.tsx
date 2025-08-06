import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Download } from 'lucide-react';

interface MultiAICollectionTabProps {
  category: {
    name: string;
    search_keywords: string[];
  };
  location: string;
  isLoading: boolean;
  results: any[];
  onStartPipeline: () => void;
  onExportResults: () => void;
}

const MultiAICollectionTab: React.FC<MultiAICollectionTabProps> = ({
  category,
  location,
  isLoading,
  results,
  onStartPipeline,
  onExportResults
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-base">
          <Brain className="h-4 w-4 mr-2 text-admin-purple" />
          Pipeline Multi-IA Intelligent
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-admin-purple/10 to-admin-blue/10 rounded-lg border border-admin-purple/20">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-4 w-4 text-admin-purple" />
            <span className="font-medium text-admin-purple">Pipeline IA Avancé</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Orchestration intelligente : Serper → DeepSeek → Mistral → Perplexity → Géocodage
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">🔍 Serper Search</Badge>
            <Badge variant="secondary" className="text-xs">🧠 DeepSeek Classification</Badge>
            <Badge variant="secondary" className="text-xs">✨ Mistral Enrichissement</Badge>
            <Badge variant="secondary" className="text-xs">🔍 Perplexity Validation</Badge>
            <Badge variant="secondary" className="text-xs">📍 Géocodage Auto</Badge>
          </div>
        </div>
        
        <Button 
          onClick={onStartPipeline}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-admin-purple to-admin-blue hover:from-admin-purple/90 hover:to-admin-blue/90 text-white"
        >
          <Brain className="h-4 w-4 mr-2" />
          Lancer le Pipeline Multi-IA
        </Button>
        
        {results.length > 0 && (
          <div className="flex space-x-2">
            <Button 
              onClick={onExportResults}
              variant="outline"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV ({results.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiAICollectionTab;