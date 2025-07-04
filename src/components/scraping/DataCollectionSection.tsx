import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Search, Globe } from 'lucide-react';
import { useDataCollection } from '@/hooks/scraping/useDataCollection';
import MultiAICollectionTab from './collection-methods/MultiAICollectionTab';
import SerperCollectionTab from './collection-methods/SerperCollectionTab';
import UnifiedScrapingTab from './collection-methods/UnifiedScrapingTab';
import ScrapingProgressViewer from './ScrapingProgressViewer';
import ResultsPreviewTable from './ResultsPreviewTable';

interface BusinessCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  search_keywords: string[];
  scraping_prompts: any;
}

interface DataCollectionSectionProps {
  category: BusinessCategory;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
}

const DataCollectionSection: React.FC<DataCollectionSectionProps> = ({
  category,
  isLoading,
  onLoadingChange
}) => {
  const [location, setLocation] = useState('');
  const [customQuery, setCustomQuery] = useState('');
  const [activeCollectionTab, setActiveCollectionTab] = useState('unified');
  const [scrapingInProgress, setScrapingInProgress] = useState(false);
  
  const {
    results,
    integrating,
    generateSerperQuery,
    handleSerperSearch,
    handleMultiAIPipeline,
    handleUnifiedScraping,
    handleIntegrateToDatabase,
    exportResults
  } = useDataCollection();

  const handleMultiAI = async () => {
    onLoadingChange(true);
    setScrapingInProgress(true);
    try {
      await handleMultiAIPipeline(category, location);
    } finally {
      onLoadingChange(false);
      setScrapingInProgress(false);
    }
  };

  const handleSerper = async () => {
    onLoadingChange(true);
    try {
      await handleSerperSearch(category, location, customQuery);
    } finally {
      onLoadingChange(false);
    }
  };

  const handleUnified = async () => {
    onLoadingChange(true);
    setScrapingInProgress(true);
    try {
      await handleUnifiedScraping(category, location);
    } finally {
      onLoadingChange(false);
      setScrapingInProgress(false);
    }
  };

  const handleIntegration = async (selectedResults: any[]) => {
    await handleIntegrateToDatabase(selectedResults, category, location);
  };

  const handleExport = () => {
    exportResults(results, category.name);
  };

  return (
    <div className="space-y-6">
      {/* Paramètres de recherche */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">Localisation</Label>
          <Input
            id="location"
            placeholder="Ex: Paris, Lyon, France..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="customQuery">Requête personnalisée (optionnel)</Label>
          <Input
            id="customQuery"
            placeholder={`Ex: ${category.search_keywords[0] || category.name}`}
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {/* Méthodes de collecte */}
      <Tabs value={activeCollectionTab} onValueChange={setActiveCollectionTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="unified" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Scraping Unifié</span>
          </TabsTrigger>
          <TabsTrigger value="multi-ai" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Pipeline Multi-IA</span>
          </TabsTrigger>
          <TabsTrigger value="serper" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Serper Search</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unified" className="space-y-4">
          <UnifiedScrapingTab
            category={category}
            isLoading={isLoading}
            onStartScraping={handleUnified}
          />
        </TabsContent>

        <TabsContent value="multi-ai" className="space-y-4">
          <MultiAICollectionTab
            category={category}
            location={location}
            isLoading={isLoading}
            results={results}
            onStartPipeline={handleMultiAI}
            onExportResults={handleExport}
          />
        </TabsContent>

        <TabsContent value="serper" className="space-y-4">
          <SerperCollectionTab
            query={generateSerperQuery(category, location, customQuery)}
            isLoading={isLoading}
            results={results}
            onStartSearch={handleSerper}
            onExportResults={handleExport}
          />
        </TabsContent>
      </Tabs>

      {/* Visualisation du scraping en temps réel */}
      <ScrapingProgressViewer 
        isActive={scrapingInProgress}
        currentStep="scraping"
      />

      {/* Prévisualisation et validation des résultats */}
      <ResultsPreviewTable
        results={results}
        onResultsChange={(newResults) => {}} // Géré par le hook maintenant
        onIntegrateToDatabase={handleIntegration}
        isIntegrating={integrating}
      />
    </div>
  );
};

export default DataCollectionSection;