import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Download } from 'lucide-react';

interface SerperCollectionTabProps {
  query: string;
  isLoading: boolean;
  results: any[];
  onStartSearch: () => void;
  onExportResults: () => void;
}

const SerperCollectionTab: React.FC<SerperCollectionTabProps> = ({
  query,
  isLoading,
  results,
  onStartSearch,
  onExportResults
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-base">
          <Search className="h-4 w-4 mr-2 text-admin-blue" />
          Recherche Google via Serper
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-admin-blue-light rounded-lg">
          <p className="text-sm text-admin-blue">
            <strong>Requête générée:</strong> {query}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            onClick={onStartSearch}
            disabled={isLoading}
            className="bg-admin-blue hover:bg-admin-blue/90"
          >
            <Search className="h-4 w-4 mr-2" />
            Lancer la recherche
          </Button>
          
          {results.length > 0 && (
            <Button 
              onClick={onExportResults}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV ({results.length})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SerperCollectionTab;