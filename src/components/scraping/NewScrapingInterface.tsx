
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ScrapingOperations from './ScrapingOperations';

const NewScrapingInterface: React.FC = () => {
  const handleRefresh = () => {
    // Rafraîchir les données
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Interface de Scraping Moderne</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrapingOperations onRefresh={handleRefresh} />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewScrapingInterface;
