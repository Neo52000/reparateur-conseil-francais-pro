
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ModernScrapingInterface from './scraping/ModernScrapingInterface';
import CSVManager from './scraping/CSVManager';
import ScrapingOperations from './scraping/ScrapingOperations';
import { Globe, FileText, Database, BarChart3 } from 'lucide-react';

const ScrapingControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState('modern');

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        {/* Header avec badges de statut */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Système de Scraping Modernisé</h1>
            <p className="text-gray-600">Plateforme complète de collecte et gestion de données</p>
          </div>
          <div className="flex space-x-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              ✅ Phase 1-4 Actives
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              🚀 Open Source
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              🆓 Gratuit
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="modern" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Scraping Moderne</span>
            </TabsTrigger>
            <TabsTrigger value="csv" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Gestion CSV</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Données</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="modern" className="space-y-6">
            <ModernScrapingInterface />
          </TabsContent>

          <TabsContent value="csv" className="space-y-6">
            <CSVManager />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <ScrapingOperations />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Analytics en développement</h3>
              <p>Les statistiques avancées seront disponibles prochainement</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ScrapingControl;
