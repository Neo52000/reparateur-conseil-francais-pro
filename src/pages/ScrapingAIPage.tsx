
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Settings, Activity, BarChart3 } from 'lucide-react';
import ScrapingConfigPanel from '@/components/scraping/ScrapingConfigPanel';
import ScrapingExecution from '@/components/scraping/ScrapingExecution';
import ScrapingResults from '@/components/scraping/ScrapingResults';
import ScrapingAnalytics from '@/components/scraping/ScrapingAnalytics';

const ScrapingAIPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('execution');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/admin')} 
                variant="ghost" 
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour Admin
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Brain className="h-8 w-8 mr-3 text-blue-600" />
                  Scraping IA Avancé
                </h1>
                <p className="text-sm text-gray-600">
                  Plateforme intelligente d'extraction et d'analyse de données
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                🤖 IA Active
              </div>
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                📊 Analytics ON
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="execution" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Exécution</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Configuration</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Résultats</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="execution" className="space-y-6">
            <ScrapingExecution />
          </TabsContent>

          <TabsContent value="config" className="space-y-6">
            <ScrapingConfigPanel />
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <ScrapingResults />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <ScrapingAnalytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ScrapingAIPage;
