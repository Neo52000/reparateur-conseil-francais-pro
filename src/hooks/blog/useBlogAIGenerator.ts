import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '@/types/blog';

interface GenerateArticleParams {
  topic?: string;
  category_id?: string;
  keywords?: string[];
  target_audience?: 'public' | 'repairers' | 'both';
  tone?: 'professional' | 'casual' | 'technical' | 'educational';
  auto_publish?: boolean;
  scheduled_at?: string;
}

export const useBlogAIGenerator = () => {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const generateArticle = async (params: GenerateArticleParams): Promise<BlogPost | null> => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('blog-ai-generator', {
        body: params
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate article');
      }

      toast({
        title: "Succès",
        description: data.message || "Article généré avec succès"
      });

      return data.post;
    } catch (error: any) {
      console.error('Error generating article:', error);
      
      let errorMessage = 'Impossible de générer l\'article';
      if (error.message?.includes('Rate limit')) {
        errorMessage = 'Limite de requêtes atteinte. Veuillez réessayer plus tard.';
      } else if (error.message?.includes('Payment required')) {
        errorMessage = 'Crédits insuffisants. Veuillez ajouter des crédits à votre workspace Lovable AI.';
      }

      toast({
        title: "Erreur de génération",
        description: errorMessage,
        variant: "destructive"
      });

      return null;
    } finally {
      setGenerating(false);
    }
  };

  const generateImage = async (prompt: string, style?: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('blog-image-generator', {
        body: { prompt, style }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate image');
      }

      return data.image_url;
    } catch (error: any) {
      console.error('Error generating image:', error);
      
      let errorMessage = 'Impossible de générer l\'image';
      if (error.message?.includes('Rate limit')) {
        errorMessage = 'Limite de requêtes atteinte pour la génération d\'images.';
      } else if (error.message?.includes('Payment required')) {
        errorMessage = 'Crédits insuffisants pour la génération d\'images.';
      }

      toast({
        title: "Erreur de génération d'image",
        description: errorMessage,
        variant: "destructive"
      });

      return null;
    }
  };

  return {
    generating,
    generateArticle,
    generateImage
  };
};
