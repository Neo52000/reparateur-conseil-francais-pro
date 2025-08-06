
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { List, Copy, Download, Brain, Zap, Bot } from 'lucide-react';
import NewsItemCard from './NewsItemCard';

interface NewsItem {
  title: string;
  summary: string;
  date: string;
  source?: string;
}

interface NewsResultsProps {
  newsData: NewsItem[];
  lastUpdate: string | null;
  selectedAI: string;
  copiedIndex: number | null;
  onCopyAll: () => void;
  onExport: () => void;
  onCopyItem: (text: string, index: number) => void;
  onGenerateBlog: (item: NewsItem) => void;
}

const NewsResults: React.FC<NewsResultsProps> = ({
  newsData,
  lastUpdate,
  selectedAI,
  copiedIndex,
  onCopyAll,
  onExport,
  onCopyItem,
  onGenerateBlog
}) => {
  const getAIIcon = (aiType: string) => {
    switch (aiType) {
      case 'perplexity':
        return <Zap className="h-4 w-4" />;
      case 'openai':
        return <Brain className="h-4 w-4" />;
      case 'mistral':
        return <Bot className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  if (newsData.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Actualités récupérées ({newsData.length})
            </CardTitle>
            <CardDescription>
              Dernières actualités dans la téléphonie mobile
            </CardDescription>
            {lastUpdate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <Badge variant="outline">
                  Dernière mise à jour: {lastUpdate}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {getAIIcon(selectedAI)}
                  <span className="ml-1">{selectedAI}</span>
                </Badge>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={onCopyAll} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copier tout
            </Button>
            <Button onClick={onExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {newsData.map((item, index) => (
            <NewsItemCard
              key={index}
              item={item}
              index={index}
              copiedIndex={copiedIndex}
              onCopy={onCopyItem}
              onGenerateBlog={onGenerateBlog}
              isLast={index === newsData.length - 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsResults;
