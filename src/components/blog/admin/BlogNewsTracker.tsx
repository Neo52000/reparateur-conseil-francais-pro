
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AISelector from './news-tracker/AISelector';
import NewsPromptEditor from './news-tracker/NewsPromptEditor';
import NewsResults from './news-tracker/NewsResults';

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
  const [selectedAI, setSelectedAI] = useState<'perplexity' | 'openai' | 'mistral'>('perplexity');

  // Auto-reset copiedIndex
  useEffect(() => {
    if (copiedIndex !== null) {
      const timer = setTimeout(() => setCopiedIndex(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedIndex]);

  useEffect(() => {
    loadSavedPrompt();
  }, []);

  const loadSavedPrompt = async () => {
    try {
      const savedPrompt = localStorage.getItem('blog_news_prompt');
      const savedAI = localStorage.getItem('blog_news_ai') as 'perplexity' | 'openai' | 'mistral';
      if (savedPrompt) {
        setNewsPrompt(savedPrompt);
      }
      if (savedAI) {
        setSelectedAI(savedAI);
      }
    } catch (error) {
      console.error('Error loading saved prompt:', error);
    }
  };

  const savePrompt = async () => {
    try {
      localStorage.setItem('blog_news_prompt', newsPrompt);
      localStorage.setItem('blog_news_ai', selectedAI);
      toast({
        title: "Succès",
        description: "Prompt et IA sauvegardés avec succès"
      });
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
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
    console.log(`🔍 Fetching mobile news with ${selectedAI}...`);

    try {
      const { data, error } = await supabase.functions.invoke('fetch-mobile-news', {
        body: {
          prompt: newsPrompt,
          ai_model: selectedAI
        }
      });

      if (error) {
        console.error('❌ News fetch error:', error);
        // Afficher un message d'erreur plus informatif
        let errorMessage = 'Erreur inconnue';
        if (error.message?.includes('insufficient_quota')) {
          errorMessage = `Quota ${selectedAI.toUpperCase()} dépassé. Essayez avec une autre IA.`;
        } else if (error.message?.includes('Unauthorized')) {
          errorMessage = `Clé API ${selectedAI.toUpperCase()} non configurée ou invalide.`;
        } else if (error.message?.includes('non-2xx status code')) {
          errorMessage = `Erreur API ${selectedAI.toUpperCase()}. Vérifiez la configuration.`;
        }
        throw new Error(errorMessage);
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
        description: `${data.news?.length || 0} actualités récupérées avec ${selectedAI}`
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
        // Auto-reset handled by useEffect
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
          ai_model: selectedAI,
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
        description: `Un article de blog a été créé à partir de cette actualité avec ${selectedAI}`
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
            Surveillez les dernières actualités dans la téléphonie mobile et les réparations avec l'IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AISelector 
            selectedAI={selectedAI} 
            onAIChange={setSelectedAI} 
          />
          
          <NewsPromptEditor
            prompt={newsPrompt}
            onPromptChange={setNewsPrompt}
            onSave={savePrompt}
            onFetch={fetchNews}
            isLoading={isLoading}
            selectedAI={selectedAI}
          />
        </CardContent>
      </Card>

      <NewsResults
        newsData={newsData}
        lastUpdate={lastUpdate}
        selectedAI={selectedAI}
        copiedIndex={copiedIndex}
        onCopyAll={copyAllNews}
        onExport={exportNews}
        onCopyItem={copyToClipboard}
        onGenerateBlog={generateBlogPost}
      />
    </div>
  );
};

export default BlogNewsTracker;
