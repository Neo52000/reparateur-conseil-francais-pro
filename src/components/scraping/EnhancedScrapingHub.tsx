import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ScrapingControlPanelEnhanced from './ScrapingControlPanelEnhanced';
import CSVImportWithGeocoding from './CSVImportWithGeocoding';
import MassiveScrapingControl from './MassiveScrapingControl';
import AIPromptScraping from './AIPromptScraping';
import SerperScraping from './SerperScraping';
import { Globe, Upload, Zap, Database, Brain, Search } from 'lucide-react';

const EnhancedScrapingHub = () => {
  const [activeTab, setActiveTab] = useState('ai-scraping');

  return (
    <div className="space-y-6">
      {/* Header avec statut */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Hub de Scraping Intelligent</h2>
          <p className="text-gray-600">Collecte automatisée avec IA, géocodage et validation</p>
        </div>
        <div className="flex space-x-2">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            🧠 DeepSeek Configuré
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            🗺️ Géocodage Auto
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            ✅ Prêt
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ai-prompt" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Prompt IA</span>
          </TabsTrigger>
          <TabsTrigger value="ai-scraping" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Scraping IA</span>
          </TabsTrigger>
          <TabsTrigger value="csv-import" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Import CSV+</span>
          </TabsTrigger>
          <TabsTrigger value="massive-scraping" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Scraping Massif</span>
          </TabsTrigger>
          <TabsTrigger value="serper-search" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Serper Search</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-prompt" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-600" />
                Scraping via Prompt IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">🚀 Nouvelle fonctionnalité intelligente</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• <strong>Langage naturel:</strong> Décrivez simplement ce que vous cherchez</li>
                  <li>• <strong>Multi-IA:</strong> DeepSeek, Mistral, OpenAI pour l'analyse</li>
                  <li>• <strong>Auto-configuration:</strong> Paramètres automatiquement détectés</li>
                  <li>• <strong>Multi-format:</strong> Tableau, CSV, JSON selon vos besoins</li>
                </ul>
              </div>
              <AIPromptScraping />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-scraping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-purple-600" />
                Scraping avec Classification IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">🤖 Fonctionnalités IA activées</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• <strong>DeepSeek:</strong> Classification et validation automatique des réparateurs</li>
                  <li>• <strong>Mistral:</strong> Amélioration des descriptions et services</li>
                  <li>• <strong>Géocodage:</strong> Coordonnées GPS automatiques via Nominatim</li>
                  <li>• <strong>Nettoyage:</strong> Correction de l'encodage et standardisation</li>
                </ul>
              </div>
              <ScrapingControlPanelEnhanced />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="csv-import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2 text-blue-600" />
                Import CSV avec Améliorations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">📈 Améliorations automatiques</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>IDs uniques:</strong> Génération automatique d'identifiants uniques</li>
                  <li>• <strong>Géocodage:</strong> Conversion adresses → coordonnées GPS</li>
                  <li>• <strong>Classification IA:</strong> Validation avec DeepSeek (optionnel)</li>
                  <li>• <strong>Fallback intelligent:</strong> Coordonnées par ville si géocodage échoue</li>
                </ul>
              </div>
              <CSVImportWithGeocoding />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="massive-scraping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2 text-green-600" />
                Scraping Massif par Département
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">🌍 Scraping à grande échelle</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• <strong>Pages Jaunes + Google Places:</strong> Sources multiples</li>
                  <li>• <strong>Par département:</strong> Ciblage géographique précis</li>
                  <li>• <strong>Firecrawl:</strong> Scraping fiable et continu</li>
                  <li>• <strong>Déduplication:</strong> Éviter les doublons automatiquement</li>
                </ul>
              </div>
              <MassiveScrapingControl />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="serper-search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2 text-orange-600" />
                Recherche avec API Serper
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">🎯 Recherche Google avancée</h4>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• <strong>Multi-types:</strong> Web, Images, News, Shopping, Vidéos, Local</li>
                  <li>• <strong>Géolocalisation:</strong> Recherches par pays et ville</li>
                  <li>• <strong>Export CSV:</strong> Sauvegarde des résultats structurés</li>
                  <li>• <strong>API officielle:</strong> Résultats Google en temps réel</li>
                </ul>
              </div>
              <SerperScraping />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedScrapingHub;
