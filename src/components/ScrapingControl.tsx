
import React from 'react';
import ScrapingOperations from './scraping/ScrapingOperations';

const ScrapingControl: React.FC = () => {
  const handleRefresh = () => {
    // Rafraîchir les données de scraping
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <ScrapingOperations onRefresh={handleRefresh} />
    </div>
  );
};

export default ScrapingControl;
