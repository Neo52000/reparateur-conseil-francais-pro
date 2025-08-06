import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Wand2, 
  Copy, 
  Download, 
  Star, 
  RefreshCw, 
  Image, 
  Type, 
  Video,
  Sparkles,
  Plus,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const contentStyles = [
  { value: 'proximite', label: 'Proximité', description: 'Chaleureux et local' },
  { value: 'technique', label: 'Technique', description: 'Expertise et précision' },
  { value: 'urgence', label: 'Urgence', description: 'Rapide et efficace' },
  { value: 'humour', label: 'Humour', description: 'Léger et sympathique' },
  { value: 'premium', label: 'Premium', description: 'Haut de gamme et qualité' }
];

// Mock data removed - using real data from Supabase

export const AIContentGenerator = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [selectedStyle, setSelectedStyle] = useState('proximite');
  const [selectedContentType, setSelectedContentType] = useState('ad_title');
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [contentHistory, setContentHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadContentHistory();
  }, []);

  const loadContentHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('ai_generated_content')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setContentHistory(data || []);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleGenerate = async () => {
    if (!generationPrompt.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un contexte pour la génération",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { error } = await supabase.functions.invoke('generate-ai-content', {
        body: {
          content_type: selectedContentType,
          source_item: {
            id: 'manual-' + Date.now(),
            name: generationPrompt.split(' ').slice(0, 3).join(' '),
            description: generationPrompt
          },
          style: selectedStyle,
          target_audience: 'Clients locaux',
          additional_context: 'Réparation de smartphone et accessoires'
        }
      });

      if (error) throw error;

      // Recharger l'historique pour voir le nouveau contenu
      await loadContentHistory();
      
      toast({
        title: "Succès",
        description: "Contenu généré avec succès"
      });
    } catch (error) {
      console.error('Erreur génération:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le contenu",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'ad_title':
      case 'ad_description':
        return <Type className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'ad_title':
        return 'Titre publicitaire';
      case 'ad_description':
        return 'Description';
      case 'image':
        return 'Image IA';
      case 'video':
        return 'Vidéo';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Générateur de contenus IA</h2>
        <p className="text-muted-foreground">
          Créez automatiquement des contenus publicitaires adaptés à votre style
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Générer</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="templates">Modèles</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Générateur */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Configuration IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Style de contenu</label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentStyles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-xs text-muted-foreground">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Type de contenu</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'ad_title', label: 'Titre', icon: Type },
                      { value: 'ad_description', label: 'Description', icon: Type },
                      { value: 'image', label: 'Image', icon: Image },
                      { value: 'video', label: 'Vidéo', icon: Video }
                    ].map((type) => (
                      <Button key={type.value} variant="outline" className="h-12 flex-col gap-1">
                        <type.icon className="h-4 w-4" />
                        <span className="text-xs">{type.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Contexte personnalisé</label>
                  <Textarea
                    placeholder="Décrivez votre produit/service ou donnez des indications spécifiques..."
                    value={generationPrompt}
                    onChange={(e) => setGenerationPrompt(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Générer le contenu
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Aperçu */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Aperçu du contenu généré
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="h-40 flex items-center justify-center">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                      <p className="text-muted-foreground">Génération IA en cours...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">Titre publicitaire</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs">9.2</span>
                        </div>
                      </div>
                      <p className="font-medium">
                        "Réparation iPhone Express - Expert de confiance près de chez vous"
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">
                          <Copy className="h-3 w-3 mr-1" />
                          Copier
                        </Button>
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Régénérer
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">Description</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs">8.8</span>
                        </div>
                      </div>
                      <p className="text-sm">
                        "Votre iPhone ne répond plus ? Notre équipe d'experts répare tous modèles 
                        en 24h avec garantie. Devis gratuit et transparent."
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">
                          <Copy className="h-3 w-3 mr-1" />
                          Copier
                        </Button>
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Régénérer
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des contenus générés</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : contentHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucun contenu généré pour le moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contentHistory.map((content: any) => (
                    <div key={content.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getContentTypeIcon(content.content_type)}
                          <Badge variant="outline">{getContentTypeLabel(content.content_type)}</Badge>
                          <Badge variant="secondary">{content.style_used || 'N/A'}</Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs">{content.quality_score}</span>
                          </div>
                        </div>
                        <p className="text-sm font-medium mb-1">
                          {typeof content.generated_content === 'object' 
                            ? content.generated_content.content || JSON.stringify(content.generated_content) 
                            : content.generated_content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {content.ai_model} • {new Date(content.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Modèles de génération</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Modèles personnalisés
                </h3>
                <p className="text-muted-foreground mb-4">
                  Créez et sauvegardez vos propres modèles de génération IA
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un modèle
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};