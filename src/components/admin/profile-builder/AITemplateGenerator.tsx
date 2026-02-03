import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Palette, Layout, Zap } from 'lucide-react';
import { ProfileWidget, ProfileTheme, PROFILE_WIDGETS, createDefaultWidget, DEFAULT_THEME } from '@/types/profileBuilder';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AITemplateGeneratorProps {
  onGenerate: (widgets: ProfileWidget[], theme: ProfileTheme) => void;
}

interface GeneratedSuggestion {
  name: string;
  description: string;
  widgetOrder: string[];
  theme: ProfileTheme;
}

const PRESET_PROMPTS = [
  {
    label: 'Moderne & Épuré',
    icon: Layout,
    prompt: 'Crée un template moderne et épuré pour un réparateur de smartphones haut de gamme. Priorité aux photos et avis clients.',
  },
  {
    label: 'Confiance & Pro',
    icon: Zap,
    prompt: 'Crée un template qui inspire confiance avec les certifications en avant, les tarifs transparents et une carte pour localiser facilement.',
  },
  {
    label: 'Conversion Max',
    icon: Palette,
    prompt: 'Crée un template optimisé pour la conversion avec contact en premier, horaires visibles et avis clients mis en avant.',
  },
];

/**
 * Générateur de templates via IA
 */
const AITemplateGenerator: React.FC<AITemplateGeneratorProps> = ({ onGenerate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<GeneratedSuggestion[]>([]);
  const { toast } = useToast();

  const generateWithAI = async (customPrompt: string) => {
    setIsGenerating(true);
    setSuggestions([]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-profile-template', {
        body: { prompt: customPrompt },
      });

      if (error) throw error;

      if (data?.suggestions) {
        setSuggestions(data.suggestions);
      } else {
        // Fallback si l'edge function n'existe pas encore
        const fallbackSuggestions: GeneratedSuggestion[] = [
          {
            name: 'Template Optimisé',
            description: 'Généré par IA basé sur votre demande',
            widgetOrder: ['header', 'about', 'contact', 'photos', 'services', 'pricing', 'hours', 'reviews', 'certifications', 'map'],
            theme: {
              primaryColor: '217 91% 60%',
              accentColor: '142 76% 36%',
              fontFamily: 'Inter',
              spacing: 'normal',
            },
          },
          {
            name: 'Alternative Compacte',
            description: 'Version plus condensée',
            widgetOrder: ['header', 'contact', 'services', 'pricing', 'reviews'],
            theme: {
              primaryColor: '262 83% 58%',
              accentColor: '24 95% 53%',
              fontFamily: 'Poppins',
              spacing: 'compact',
            },
          },
        ];
        setSuggestions(fallbackSuggestions);
      }
    } catch (err: any) {
      console.error('AI generation error:', err);
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer le template. Réessayez plus tard.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const applySuggestion = (suggestion: GeneratedSuggestion) => {
    const widgets = suggestion.widgetOrder
      .filter(type => PROFILE_WIDGETS.find(w => w.type === type))
      .map((type, index) => createDefaultWidget(type as any, index));

    onGenerate(widgets, suggestion.theme);
    setIsOpen(false);
    
    toast({
      title: "Template appliqué",
      description: `Le template "${suggestion.name}" a été chargé.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Générer avec l'IA
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Générateur de Templates IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Presets rapides */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Suggestions rapides</Label>
            <div className="grid gap-2">
              {PRESET_PROMPTS.map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => {
                    setPrompt(preset.prompt);
                    generateWithAI(preset.prompt);
                  }}
                  disabled={isGenerating}
                >
                  <preset.icon className="h-4 w-4 mr-3 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{preset.label}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-md">
                      {preset.prompt}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Prompt personnalisé */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Ou décrivez votre template idéal</Label>
            <Textarea
              placeholder="Ex: Je veux un template qui met en avant les certifications et la proximité géographique, avec des couleurs vertes pour un aspect écologique..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <Button
              onClick={() => generateWithAI(prompt)}
              disabled={!prompt.trim() || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Générer
                </>
              )}
            </Button>
          </div>

          {/* Suggestions générées */}
          {suggestions.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Templates générés</Label>
              <div className="grid gap-3">
                {suggestions.map((suggestion, index) => (
                  <Card 
                    key={index}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{suggestion.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {suggestion.description}
                          </p>
                        </div>
                        <div 
                          className="w-8 h-8 rounded-full"
                          style={{ 
                            background: `linear-gradient(135deg, hsl(${suggestion.theme.primaryColor}), hsl(${suggestion.theme.accentColor}))` 
                          }}
                        />
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-3">
                        {suggestion.widgetOrder.slice(0, 5).map(type => (
                          <Badge key={type} variant="secondary" className="text-xs">
                            {PROFILE_WIDGETS.find(w => w.type === type)?.name || type}
                          </Badge>
                        ))}
                        {suggestion.widgetOrder.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{suggestion.widgetOrder.length - 5}
                          </Badge>
                        )}
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

export default AITemplateGenerator;
