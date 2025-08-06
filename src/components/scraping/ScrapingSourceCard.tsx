
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TestTube, Zap } from 'lucide-react';

interface ScrapingSourceCardProps {
  title: string;
  estimatedCount: string;
  description: string;
  source: string;
  isScrapingRunning: boolean;
  onTest: () => void;
  onMassiveScraping: () => void;
}

const ScrapingSourceCard = ({
  title,
  estimatedCount,
  description,
  source,
  isScrapingRunning,
  onTest,
  onMassiveScraping,
}: ScrapingSourceCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{title}</h3>
            <Badge variant="outline" className="bg-red-50 text-red-700">
              {estimatedCount}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
          <div className="flex space-x-2">
            <Button
              onClick={onTest}
              disabled={isScrapingRunning}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Test (3 items)
            </Button>
            <Button
              onClick={onMassiveScraping}
              disabled={isScrapingRunning}
              size="sm"
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              Scraping MASSIF
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScrapingSourceCard;
