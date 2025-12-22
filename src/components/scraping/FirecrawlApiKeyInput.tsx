
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Search, Bot, MapPin } from 'lucide-react';

const FirecrawlApiKeyInput = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
          Sources de Données Configurées
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-900 mb-2">✅ Configuration Active</h4>
          <p className="text-sm text-green-800">
            Les sources de données sont configurées côté serveur via les Edge Functions Supabase.
          </p>
        </div>

        <div className="grid gap-3">
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Search className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Serper API (Google Places)</h4>
              <p className="text-xs text-muted-foreground">
                Recherche réelle via Google Maps - Données vérifiées avec téléphones et adresses
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Bot className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Génération IA Multi-Provider</h4>
              <p className="text-xs text-muted-foreground">
                Lovable AI, Gemini Pro, OpenAI GPT-4o, Mistral AI - Données réalistes générées
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Géocodage Nominatim</h4>
              <p className="text-xs text-muted-foreground">
                Service gratuit OpenStreetMap - Coordonnées GPS automatiques
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-3">
          <p className="font-medium mb-1">Secrets requis (Supabase) :</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>SERPER_API_KEY - Pour Google Places via Serper</li>
            <li>LOVABLE_API_KEY - Auto-configuré pour Lovable AI</li>
            <li>OPENAI_API_KEY - (Optionnel) Pour fallback OpenAI</li>
            <li>CLE_API_MISTRAL - (Optionnel) Pour fallback Mistral</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default FirecrawlApiKeyInput;
