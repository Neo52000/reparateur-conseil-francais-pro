
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Settings, Activity, BarChart3, Globe } from 'lucide-react';
import ScrapingConfigPanel from '@/components/scraping/ScrapingConfigPanel';
import MassiveScrapingControl from '@/components/scraping/MassiveScrapingControl';
import ScrapingResults from '@/components/scraping/ScrapingResults';
import ScrapingAnalytics from '@/components/scraping/ScrapingAnalytics';
import { useScrapingStatus } from '@/hooks/useScrapingStatus';

const ScrapingAIPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('execution');
  const { logs, isScrapingRunning } = useScrapingStatus();

  // Basculer automatiquement vers l'onglet résultats quand le scraping démarre
  useEffect(() => {
    if (isScrapingRunning) {
      console.log('🔄 Scraping détecté - basculement automatique vers les résultats');
      setActiveTab('results');
    }
  }, [isScrapingRunning]);

  // Surveiller la fin du scraping pour maintenir l'onglet résultats ouvert
  useEffect(() => {
    const latestLog = logs[0];
    
    if (latestLog && latestLog.status === 'completed' && !isScrapingRunning) {
      console.log('✅ Scraping terminé - maintien sur l\'onglet résultats');
      // Rester sur l'onglet résultats pour voir les données finales
      if (activeTab !== 'results') {
        setActiveTab('results');
      }
    }
  }, [logs, isScrapingRunning, activeTab]);

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
                  <Globe className="h-8 w-8 mr-3 text-red-600" />
                  Scraping Massif France
                </h1>
                <p className="text-sm text-gray-600">
                  Extraction complète des réparateurs téléphone - Tous départements
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                🚀 ILLIMITÉ
              </div>
              <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                🛡️ Anti-blocage
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                🗺️ 101 départements
              </div>
              {isScrapingRunning && (
                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium animate-pulse">
                  ⚡ EN COURS
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="execution" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Scraping Massif</span>
            </TabsTrigger>
            <TabsTrigger 
              value="results" 
              className={`flex items-center space-x-2 ${isScrapingRunning ? 'bg-blue-100 text-blue-700' : ''}`}
            >
              <Zap className="h-4 w-4" />
              <span>Résultats</span>
              {isScrapingRunning && <span className="ml-1 animate-pulse">●</span>}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="execution" className="space-y-6">
            <MassiveScrapingControl />
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <ScrapingResults />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <ScrapingAnalytics />
          </TabsContent>

          <TabsContent value="config" className="space-y-6">
            <ScrapingConfigPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ScrapingAIPage;
