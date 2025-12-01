import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BlogSettingsService } from '@/services/blogSettingsService';

export const useBlogHeaderImage = () => {
  const { toast } = useToast();
  const [headerImageUrl, setHeaderImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHeaderImage();
  }, []);

  const loadHeaderImage = async () => {
    try {
      const settings = await BlogSettingsService.loadSettings();
      setHeaderImageUrl(settings.header_image_url || null);
    } catch (error) {
      console.error('Error loading header image:', error);
    }
  };

  const generateHeaderImage = async () => {
    setLoading(true);
    try {
      const prompt = `Modern smartphone repair workshop banner. Clean workspace with professional repair tools, smartphone components, circuit boards. Emerald green accent colors (#10B981). Tech-savvy atmosphere, soft lighting, blurred background with depth of field. Premium quality, horizontal 16:9 format, suitable for website header.`;

      const { data, error } = await supabase.functions.invoke('blog-image-generator', {
        body: {
          prompt,
          style: 'professional'
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate image');
      }

      const imageUrl = data.image_url;
      
      // Save to settings
      await BlogSettingsService.updateSetting('header_image_url', imageUrl);
      setHeaderImageUrl(imageUrl);

      toast({
        title: "Image générée",
        description: "L'image d'en-tête a été générée avec succès"
      });

      return imageUrl;
    } catch (error: any) {
      console.error('Error generating header image:', error);
      
      let errorMessage = 'Impossible de générer l\'image';
      if (error.message?.includes('Rate limit')) {
        errorMessage = 'Limite de requêtes atteinte. Veuillez réessayer plus tard.';
      } else if (error.message?.includes('Payment required')) {
        errorMessage = 'Crédits insuffisants. Veuillez ajouter des crédits.';
      }

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });

      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    headerImageUrl,
    loading,
    generateHeaderImage,
    refreshHeaderImage: loadHeaderImage
  };
};
