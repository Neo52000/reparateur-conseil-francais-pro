import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Sparkles, RefreshCw, Database, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProcessResult {
  success: boolean;
  message: string;
  details?: any;
}

interface SeoPage {
  id: string;
  city: string;
  service_type: string;
  slug: string;
}

export default function SeoToolsPanel() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [geocodingProgress, setGeocodingProgress] = useState(0);
  const [results, setResults] = useState<ProcessResult[]>([]);

  // Créer un client Supabase local avec types simples
  const supabase = createClient(
    'https://nbugpbakfkyvvjzgfjmw.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idWdwYmFrZmt5dnZqemdmam13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTgyMjQsImV4cCI6MjA2NTQ3NDIyNH0.3D_IxWcSNpA2Xk5PtsJVyfjAk9kC1KbMG2n1FJ32tWc'
  );

  const regenerateAllSeoPages = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setResults([]);

    try {
      // Récupérer toutes les pages SEO publiées
      const { data: pages, error } = await supabase
        .from('local_seo_pages')
        .select('id, city, service_type, slug')
        .eq('status', 'published')
        .returns<SeoPage[]>();

      if (error) throw error;

      if (!pages || pages.length === 0) {
        toast({
          title: "Aucune page à régénérer",
          description: "Aucune page SEO publiée trouvée",
          variant: "destructive"
        });
        return;
      }

      const totalPages = pages.length;
      let successCount = 0;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        
        try {
          // Récupérer les stats des réparateurs pour cette ville
          const { data: repairers } = await supabase
            .from('repairers')
            .select('rating')
            .eq('city', page.city)
            .eq('is_verified', true)
            .not('rating', 'is', null);

          const repairerCount = repairers?.length || 0;
          const avgRating = repairers && repairers.length > 0
            ? parseFloat((repairers.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / repairers.length).toFixed(1))
            : 4.8;

          // Appeler l'edge function pour régénérer le contenu
          const { data, error: funcError } = await supabase.functions.invoke('generate-local-seo-v3', {
            body: {
              city: page.city,
              serviceType: page.service_type,
              repairerCount,
              averageRating: avgRating,
              regenerate: true
            }
          });

          if (funcError) throw funcError;

          if (data.success && data.content) {
            // Mettre à jour la page avec le nouveau contenu
            const { error: updateError } = await supabase
              .from('local_seo_pages')
              .update({
                title: data.content.title,
                meta_description: data.content.metaDescription,
                h1_title: data.content.h1,
                content_paragraph_1: data.content.paragraph1,
                content_paragraph_2: data.content.paragraph2,
                services: data.content.services,
                sample_testimonials: data.content.testimonials,
                faq: data.content.faq,
                last_updated_content: new Date().toISOString()
              })
              .eq('id', page.id);

            if (updateError) throw updateError;

            successCount++;
            setResults(prev => [...prev, {
              success: true,
              message: `✅ ${page.city} (${page.service_type}) - Contenu régénéré`
            }]);
          }

        } catch (error: any) {
          setResults(prev => [...prev, {
            success: false,
            message: `❌ ${page.city} - Erreur: ${error.message}`
          }]);
        }

        setGenerationProgress(((i + 1) / totalPages) * 100);
        
        // Délai entre les requêtes pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      toast({
        title: "Régénération terminée",
        description: `${successCount}/${totalPages} pages mises à jour avec succès`,
        variant: successCount === totalPages ? "default" : "destructive"
      });

    } catch (error: any) {
      console.error('Erreur régénération:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const geocodeAllRepairers = async () => {
    setIsGeocoding(true);
    setGeocodingProgress(0);
    setResults([]);

    try {
      toast({
        title: "Géocodage lancé",
        description: "Le processus peut prendre plusieurs minutes...",
      });

      // Appeler l'edge function pour géocoder tous les réparateurs
      const { data, error } = await supabase.functions.invoke('geocode-repairers', {
        body: { forceUpdate: false }
      });

      if (error) throw error;

      if (data.success) {
        const { summary, results: geocodeResults } = data;
        
        setResults(geocodeResults.map((r: any) => ({
          success: r.success,
          message: r.success 
            ? `✅ ${r.name} - Géocodé (${r.latitude}, ${r.longitude})`
            : `❌ ${r.name} - ${r.error}`
        })));

        toast({
          title: "Géocodage terminé",
          description: `${summary.success}/${summary.total} réparateurs géocodés avec succès`,
          variant: summary.success === summary.total ? "default" : "destructive"
        });
      }

    } catch (error: any) {
      console.error('Erreur géocodage:', error);
      toast({
        title: "Erreur géocodage",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Outils de maintenance SEO
          </CardTitle>
          <CardDescription>
            Régénération du contenu et géocodage des réparateurs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Régénération contenu SEO */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-blue-500" />
                  Régénération du contenu SEO
                </h3>
                <p className="text-sm text-muted-foreground">
                  Régénère le contenu IA de toutes les pages SEO locales publiées
                </p>
              </div>
              <Button 
                onClick={regenerateAllSeoPages}
                disabled={isGenerating}
                className="min-w-[140px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    En cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Régénérer tout
                  </>
                )}
              </Button>
            </div>

            {isGenerating && (
              <div className="space-y-2">
                <Progress value={generationProgress} className="h-2" />
                <p className="text-sm text-muted-foreground text-center">
                  {generationProgress.toFixed(0)}% complété
                </p>
              </div>
            )}
          </div>

          <div className="border-t pt-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                  Géocodage des réparateurs
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ajoute les coordonnées GPS pour tous les réparateurs sans coordonnées
                </p>
              </div>
              <Button 
                onClick={geocodeAllRepairers}
                disabled={isGeocoding}
                variant="outline"
                className="min-w-[140px]"
              >
                {isGeocoding ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    En cours...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Géocoder tout
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Résultats */}
          {results.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="font-semibold mb-3">Résultats ({results.length})</h4>
              <div className="max-h-[300px] overflow-y-auto space-y-2 p-4 bg-muted rounded-lg">
                {results.map((result, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={result.success ? "text-green-700" : "text-red-700"}>
                      {result.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions Mapbox */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-amber-900 text-lg">
            ⚠️ Configuration Mapbox requise
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-800 space-y-3">
          <p><strong>Pour que les cartes fonctionnent, vous devez :</strong></p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Créer un compte gratuit sur <a href="https://www.mapbox.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">mapbox.com</a></li>
            <li>Copier votre <strong>Public Token</strong> depuis le dashboard</li>
            <li>
              Ajouter le token dans <strong>Supabase Edge Functions Secrets</strong>:
              <code className="block mt-1 p-2 bg-white rounded text-xs">
                MAPBOX_PUBLIC_TOKEN = pk.eyJ...
              </code>
            </li>
            <li>
              Mettre à jour le fichier <code>.env</code> local:
              <code className="block mt-1 p-2 bg-white rounded text-xs">
                VITE_MAPBOX_PUBLIC_TOKEN=pk.eyJ...
              </code>
            </li>
          </ol>
          <Badge variant="outline" className="bg-white mt-3">
            Gratuit jusqu'à 50 000 vues/mois
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
