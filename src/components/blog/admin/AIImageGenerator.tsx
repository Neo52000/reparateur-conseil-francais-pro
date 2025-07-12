
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Wand2, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIImageGeneratorProps {
  onImageGenerated: (imageUrl: string) => void;
  onClose: () => void;
  articleTitle?: string;
}

const AIImageGenerator: React.FC<AIImageGeneratorProps> = ({ 
  onImageGenerated, 
  onClose, 
  articleTitle = '' 
}) => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState(articleTitle ? `Create a professional blog header image for: ${articleTitle}` : '');
  const [style, setStyle] = useState('realistic');
  const [size, setSize] = useState('1792x1024');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une description pour l'image",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-image', {
        body: {
          prompt: `${prompt}. Style: ${style}. High quality, professional, clean, modern design.`,
          size,
          style
        }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setGeneratedImages(prev => [data.imageUrl, ...prev]);
        toast({
          title: "Succès",
          description: "Image générée avec succès !"
        });
      }
    } catch (error) {
      console.error('Erreur génération image:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer l'image. Vérifiez votre clé API OpenAI.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectImage = (imageUrl: string) => {
    onImageGenerated(imageUrl);
    toast({
      title: "Image sélectionnée",
      description: "L'image a été ajoutée à votre article"
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Générateur d'images IA
          </DialogTitle>
          <DialogDescription>
            Générez des images personnalisées pour votre article de blog
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prompt">Description de l'image</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Décrivez l'image que vous souhaitez générer..."
                rows={4}
              />
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="style">Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realistic">Réaliste</SelectItem>
                    <SelectItem value="digital-art">Art numérique</SelectItem>
                    <SelectItem value="illustration">Illustration</SelectItem>
                    <SelectItem value="minimalist">Minimaliste</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="size">Dimensions</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1792x1024">1792x1024 (Blog Header - Recommandé)</SelectItem>
                    <SelectItem value="1024x1024">1024x1024 (Carré)</SelectItem>
                    <SelectItem value="1024x1792">1024x1792 (Portrait)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={generateImage} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Générer l'image
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Résultats */}
          {generatedImages.length > 0 && (
            <div>
              <Label>Images générées</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                {generatedImages.map((imageUrl, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative group">
                        <img 
                          src={imageUrl} 
                          alt={`Généré ${index + 1}`}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="sm"
                            onClick={() => selectImage(imageUrl)}
                            className="mr-2"
                          >
                            Utiliser cette image
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIImageGenerator;
