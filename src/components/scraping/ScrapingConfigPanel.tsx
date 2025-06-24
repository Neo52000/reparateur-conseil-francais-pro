
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Database, Globe, Brain } from 'lucide-react';
import FirecrawlApiKeyInput from './FirecrawlApiKeyInput';

const ScrapingConfigPanel = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configuration du Scraping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">API Gouvernement</span>
                <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs">GRATUIT</span>
              </div>
              <p className="text-sm text-green-800">
                Vérification automatique des entreprises via l'API gouvernementale française.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Globe className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Géocodage Nominatim</span>
                <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">GRATUIT</span>
              </div>
              <p className="text-sm text-blue-800">
                Conversion automatique des adresses en coordonnées GPS précises.
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-900">IA Mistral</span>
                <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs">CONFIGURÉ</span>
              </div>
              <p className="text-sm text-purple-800">
                Classification intelligente des réparateurs avec Mistral AI (clé déjà configurée).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <FirecrawlApiKeyInput />
    </div>
  );
};

export default ScrapingConfigPanel;
