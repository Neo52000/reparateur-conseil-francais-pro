
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { Key, CheckCircle, AlertTriangle } from 'lucide-react';

const FirecrawlApiKeyInput = () => {
  const { toast } = useToast();

  useEffect(() => {
    // SECURITY: API keys are now stored server-side only
    toast({
      title: "🔒 Configuration serveur sécurisée",
      description: "Les clés API Firecrawl sont maintenant stockées de manière sécurisée côté serveur"
    });
  }, []);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Key className="h-5 w-5 mr-2" />
          Configuration Firecrawl API
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="font-medium text-green-900">Configuration Sécurisée Active</h4>
          </div>
          <p className="text-sm text-green-800">
            Les clés API Firecrawl sont maintenant stockées de manière sécurisée côté serveur via Supabase Edge Functions.
          </p>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">🔒 Améliorations de Sécurité</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>✅ Clés API stockées uniquement côté serveur</li>
            <li>✅ Protection contre les attaques XSS</li>
            <li>✅ Authentification requise pour les appels API</li>
            <li>✅ Pas d'exposition des secrets dans le code client</li>
          </ul>
        </div>

        <div className="p-3 bg-amber-50 rounded-lg">
          <h4 className="font-medium text-amber-900 mb-2">🌐 Fonctionnalités Firecrawl</h4>
          <ul className="text-xs text-amber-800 space-y-1">
            <li>• Scraping des vraies pages Pages Jaunes et Google Places</li>
            <li>• Extraction automatique des coordonnées GPS précises</li>
            <li>• Géocodage avec Nominatim (gratuit, pas de clé requise)</li>
            <li>• Données réelles et à jour des réparateurs français</li>
          </ul>
        </div>

        <div className="text-xs text-gray-500">
          <p className="font-medium mb-1">Configuration Admin :</p>
          <p>La clé API Firecrawl doit être configurée dans les secrets Supabase (FIRECRAWL_API_KEY).</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FirecrawlApiKeyInput;
