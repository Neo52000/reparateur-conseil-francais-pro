import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Target, Database } from 'lucide-react';

interface UnifiedScrapingTabProps {
  category: {
    name: string;
    description: string;
  };
  isLoading: boolean;
  onStartScraping: () => void;
}

const UnifiedScrapingTab: React.FC<UnifiedScrapingTabProps> = ({
  category,
  isLoading,
  onStartScraping
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-base">
          <Zap className="h-4 w-4 mr-2 text-admin-purple" />
          Scraping Unifié Ultra-Performant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-admin-purple/10 to-admin-orange/10 rounded-lg border border-admin-purple/20">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="h-4 w-4 text-admin-purple" />
            <span className="font-medium text-admin-purple">Pipeline Optimisé Multi-Sources</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Combine Google Maps Enhanced + Serper + Multi-IA avec pipelines Scrapy-like
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">🗺️ Google Maps Enhanced</Badge>
            <Badge variant="secondary" className="text-xs">🔍 Serper API</Badge>
            <Badge variant="secondary" className="text-xs">🧠 Multi-IA</Badge>
            <Badge variant="secondary" className="text-xs">🔄 Pipelines Scrapy</Badge>
            <Badge variant="secondary" className="text-xs">📍 Géocodage Auto</Badge>
            <Badge variant="secondary" className="text-xs">🛡️ Anti-doublons</Badge>
          </div>
        </div>
        
        <div className="p-3 bg-admin-green-light rounded-lg">
          <p className="text-sm text-admin-green">
            <strong>Cible:</strong> {category.description}
          </p>
        </div>
        
        <Button 
          onClick={onStartScraping}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-admin-purple to-admin-orange hover:from-admin-purple/90 hover:to-admin-orange/90 text-white"
        >
          <Database className="h-4 w-4 mr-2" />
          Lancer le Scraping Unifié
        </Button>
      </CardContent>
    </Card>
  );
};

export default UnifiedScrapingTab;