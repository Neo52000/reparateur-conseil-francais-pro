
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Newspaper, Settings, Save, Play, Copy, Download, List, FileText, CheckCircle } from 'lucide-react';
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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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

  const copyToClipboard = async (text: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (typeof index === 'number') {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      }
      toast({
        title: "Copié !",
        description: "Le contenu a été copié dans le presse-papiers"
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Erreur",
        description: "Impossible de copier le contenu",
        variant: "destructive"
      });
    }
  };

  const copyAllNews = async () => {
    if (newsData.length === 0) {
      toast({
        title: "Aucune actualité",
        description: "Il n'y a pas d'actualités à copier",
        variant: "destructive"
      });
      return;
    }

    const allNewsText = newsData.map((item, index) => 
      `${index + 1}. **${item.title}**\n\n${item.summary}\n\n**Date:** ${item.date || 'Non spécifiée'}\n**Source:** ${item.source || 'Non spécifiée'}\n\n---\n`
    ).join('\n');
    
    await copyToClipboard(allNewsText);
  };

  const exportNews = () => {
    if (newsData.length === 0) {
      toast({
        title: "Aucune actualité",
        description: "Il n'y a pas d'actualités à exporter",
        variant: "destructive"
      });
      return;
    }

    try {
      const exportText = `# Actualités Mobiles - ${new Date().toLocaleDateString('fr-FR')}\n\n${newsData.map((item, index) => 
        `## ${index + 1}. ${item.title}\n\n${item.summary}\n\n**Date:** ${item.date || 'Non spécifiée'}\n**Source:** ${item.source || 'Non spécifiée'}\n\n---\n`
      ).join('\n')}`;

      const blob = new Blob([exportText], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `actualites-mobiles-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: "Les actualités ont été exportées en fichier Markdown"
      });
    } catch (error) {
      console.error('Error exporting news:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les actualités",
        variant: "destructive"
      });
    }
  };

  const generateBlogPost = async (newsItem: NewsItem) => {
    try {
      const blogPrompt = `Écris un article de blog professionnel en français basé sur cette actualité mobile :

Titre: ${newsItem.title}
Contenu: ${newsItem.summary}
Date: ${newsItem.date}
Source: ${newsItem.source || 'Non spécifiée'}

Structure l'article avec une introduction engageante, un développement détaillé et une conclusion. Ajoute des conseils pratiques pour les utilisateurs et réparateurs de smartphones si pertinent. L'article doit faire environ 800-1200 mots.`;

      console.log('🔄 Generating blog post from news item...');

      const { data, error } = await supabase.functions.invoke('generate-blog-content', {
        body: {
          prompt: blogPrompt,
          ai_model: 'perplexity',
          visibility: 'public'
        }
      });

      if (error) {
        console.error('❌ Blog generation error:', error);
        throw error;
      }

      console.log('✅ Blog post generated successfully:', data);
      
      toast({
        title: "Article généré !",
        description: "Un article de blog a été créé à partir de cette actualité"
      });
    } catch (error) {
      console.error('Error generating blog post:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer l'article de blog",
        variant: "destructive"
      });
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  Actualités récupérées ({newsData.length})
                </CardTitle>
                <CardDescription>
                  Dernières actualités dans la téléphonie mobile
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyAllNews} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copier tout
                </Button>
                <Button onClick={exportNews} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {newsData.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            #{index + 1}
                          </span>
                          {item.source && (
                            <Badge variant="secondary" className="text-xs">
                              {item.source}
                            </Badge>
                          )}
                          {item.date && (
                            <span className="text-xs text-muted-foreground">
                              {item.date}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg mb-2 text-gray-900">
                          {item.title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-sm">
                          {item.summary}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          onClick={() => copyToClipboard(`**${item.title}**\n\n${item.summary}\n\nDate: ${item.date || 'Non spécifiée'}\nSource: ${item.source || 'Non spécifiée'}`, index)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Copier cette actualité"
                        >
                          {copiedIndex === index ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          onClick={() => generateBlogPost(item)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Générer un article de blog"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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
