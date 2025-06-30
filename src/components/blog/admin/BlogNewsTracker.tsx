
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Newspaper, Settings, Save, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NewsItem {
  title: string;
  summary: string;
  date: string;
  source?: string;
}

const BlogNewsTracker: React.FC = () => {
  const { toast } = useToast();
  const [newsPrompt, setNewsPrompt] = useState("Quelles sont les actualités du jour/semaine dans la téléphonie mobile et les réparations de smartphones ? Mentionne les nouvelles technologies, les lancements de produits, les tendances du marché et les innovations en matière de réparation.");
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  // Charger le prompt sauvegardé au démarrage
  useEffect(() => {
    loadSavedPrompt();
  }, []);

  const loadSavedPrompt = async () => {
    try {
      const savedPrompt = localStorage.getItem('blog_news_prompt');
      if (savedPrompt) {
        setNewsPrompt(savedPrompt);
      }
    } catch (error) {
      console.error('Error loading saved prompt:', error);
    }
  };

  const savePrompt = async () => {
    try {
      localStorage.setItem('blog_news_prompt', newsPrompt);
      toast({
        title: "Succès",
        description: "Prompt sauvegardé avec succès"
      });
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le prompt",
        variant: "destructive"
      });
    }
  };

  const fetchNews = async () => {
    if (!newsPrompt.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un prompt avant de lancer la recherche",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    console.log('🔍 Fetching mobile news with Perplexity...');

    try {
      const { data, error } = await supabase.functions.invoke('fetch-mobile-news', {
        body: {
          prompt: newsPrompt
        }
      });

      if (error) {
        console.error('❌ News fetch error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('❌ Response error:', data.error);
        throw new Error(data.error);
      }

      console.log('✅ News fetched successfully:', data);
      setNewsData(data.news || []);
      setLastUpdate(new Date().toLocaleString('fr-FR'));
      
      toast({
        title: "Succès",
        description: `${data.news?.length || 0} actualités récupérées`
      });
    } catch (error) {
      console.error('❌ Error fetching news:', error);
      toast({
        title: "Erreur",
        description: `Impossible de récupérer les actualités: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Suivi des actualités mobiles
          </CardTitle>
          <CardDescription>
            Surveillez les dernières actualités dans la téléphonie mobile et les réparations avec Perplexity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="news-prompt">Prompt de recherche</Label>
              <Textarea
                id="news-prompt"
                value={newsPrompt}
                onChange={(e) => setNewsPrompt(e.target.value)}
                placeholder="Saisir le prompt pour rechercher les actualités..."
                rows={4}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Personnalisez ce prompt pour obtenir les actualités qui vous intéressent le plus
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={savePrompt} variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder le prompt
              </Button>
              <Button onClick={fetchNews} disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Rechercher les actualités
              </Button>
            </div>
          </div>

          {lastUpdate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">Dernière mise à jour: {lastUpdate}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {newsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Actualités récupérées ({newsData.length})</CardTitle>
            <CardDescription>
              Dernières actualités dans la téléphonie mobile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {newsData.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    {item.source && (
                      <Badge variant="secondary" className="text-xs">
                        {item.source}
                      </Badge>
                    )}
                    <p className="text-gray-700 leading-relaxed">{item.summary}</p>
                    {item.date && (
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                    )}
                  </div>
                  {index < newsData.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BlogNewsTracker;
