import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

interface FirecrawlCollectionTabProps {
  category: {
    name: string;
    description: string;
  };
  isLoading: boolean;
  onStartScraping: () => void;
}

const FirecrawlCollectionTab: React.FC<FirecrawlCollectionTabProps> = ({
  category,
  isLoading,
  onStartScraping
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-base">
          <Globe className="h-4 w-4 mr-2 text-admin-green" />
          Scraping Web via Firecrawl
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-admin-green-light rounded-lg">
          <p className="text-sm text-admin-green">
            <strong>Scraping ciblé:</strong> {category.description}
          </p>
        </div>
        
        <Button 
          onClick={onStartScraping}
          disabled={isLoading}
          className="bg-admin-green hover:bg-admin-green/90"
        >
          <Globe className="h-4 w-4 mr-2" />
          Démarrer le scraping
        </Button>
      </CardContent>
    </Card>
  );
};

export default FirecrawlCollectionTab;