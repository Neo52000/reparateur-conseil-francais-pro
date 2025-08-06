
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ScrapingOperations from './ScrapingOperations';

interface ScrapingResultsProps {
  results?: any[];
  loading?: boolean;
}

const ScrapingResults: React.FC<ScrapingResultsProps> = ({ 
  results = [], 
  loading = false 
}) => {
  const handleRefresh = () => {
    // Rafraîchir les résultats
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Résultats du Scraping</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Chargement des résultats...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {results.length} résultats trouvés
              </p>
              
              <ScrapingOperations onRefresh={handleRefresh} />
              
              {results.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Derniers résultats :</h3>
                  <div className="space-y-2">
                    {results.slice(0, 5).map((result, index) => (
                      <div key={index} className="p-3 border rounded">
                        <p className="text-sm">{JSON.stringify(result)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrapingResults;
