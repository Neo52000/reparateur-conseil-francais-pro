import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Search, Globe } from 'lucide-react';
import { useDataCollection } from '@/hooks/scraping/useDataCollection';
import MultiAICollectionTab from './collection-methods/MultiAICollectionTab';
import SerperCollectionTab from './collection-methods/SerperCollectionTab';

import ApifyCollectionTab from './collection-methods/ApifyCollectionTab';
import ScrapingProgressViewer from './ScrapingProgressViewer';
import ResultsPreviewTable from './ResultsPreviewTable';
import RedirectionCountdown from './RedirectionCountdown';
import EnhancementPanel from './EnhancementPanel';
import ScrapingDebugPanel from './ScrapingDebugPanel';
import EdgeFunctionHealth from '../admin/EdgeFunctionHealth';

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
  const [activeCollectionTab, setActiveCollectionTab] = useState('apify');
  const [scrapingInProgress, setScrapingInProgress] = useState(false);
  
  const {
    results,
    setResults,
    integrating,
    showRedirection,
    generateSerperQuery,
    handleSerperSearch,
    handleMultiAIPipeline,
    
    handleIntegrateToDatabase,
    handleRedirectToRepairers,
    handleCancelRedirection,
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
      const { data, error } = await handleSerperSearch(category, location, customQuery);
      if (error) {
        throw error;
      }
    } finally {
      onLoadingChange(false);
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
      {/* Redirection countdown après scraping */}
      {showRedirection && (
        <RedirectionCountdown
          onRedirect={handleRedirectToRepairers}
          onCancel={handleCancelRedirection}
          duration={3}
        />
      )}

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
          <TabsTrigger value="apify" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Apify Premium</span>
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

        <TabsContent value="apify" className="space-y-4">
          <ApifyCollectionTab
            category={category}
            isLoading={isLoading}
            onLoadingChange={onLoadingChange}
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

      {/* Monitoring des Edge Functions */}
      <EdgeFunctionHealth />

      {/* Panel d'améliorations IA */}
      <EnhancementPanel
        results={results}
        onResultsUpdated={setResults}
      />

      {/* Prévisualisation et validation des résultats */}
      <ResultsPreviewTable
        results={results}
        onResultsChange={setResults}
        onIntegrateToDatabase={handleIntegration}
        isIntegrating={integrating}
      />

      {/* Panneau de debug */}
      <ScrapingDebugPanel 
        results={results}
        isIntegrating={integrating}
      />
    </div>
  );
};

export default DataCollectionSection;