import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, Image, Type, Video, Trash2, Sparkles } from 'lucide-react';
import { useAICreatives, GenerateCreativeRequest } from '@/hooks/useAICreatives';

const AICreativeGenerator = () => {
  const { creatives, loading, generateCreative, deleteCreative } = useAICreatives();
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState<GenerateCreativeRequest>({
    type: 'text',
    prompt: '',
    style: 'technique',
  });

  const handleGenerate = async () => {
    if (!formData.prompt.trim()) return;
    
    try {
      setGenerating(true);
      await generateCreative(formData);
      setFormData({ ...formData, prompt: '' });
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  const styleLabels = {
    technique: 'Technique',
    proximite: 'Proximité',
    urgence: 'Urgence',
    humour: 'Humour',
    premium: 'Premium'
  };

  const typeIcons = {
    text: Type,
    image: Image,
    video: Video,
    carousel: Image
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Générateur de Créatifs IA
          </CardTitle>
          <CardDescription>
            Créez automatiquement des publicités optimisées avec l'intelligence artificielle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Type de créatif</label>
              <Select
                value={formData.type}
                onValueChange={(value: 'text' | 'image' | 'video') => 
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texte publicitaire</SelectItem>
                  <SelectItem value="image">Image créative</SelectItem>
                  <SelectItem value="video">Vidéo promotionnelle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Style</label>
              <Select
                value={formData.style}
                onValueChange={(value: typeof formData.style) => 
                  setFormData({ ...formData, style: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(styleLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Prompt de génération</label>
            <Textarea
              placeholder="Décrivez le créatif que vous souhaitez générer..."
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              rows={3}
            />
          </div>

          {formData.type === 'image' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Largeur</label>
                <Input
                  type="number"
                  placeholder="1200"
                  value={formData.dimensions?.width || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    dimensions: {
                      ...formData.dimensions,
                      width: parseInt(e.target.value) || 1200,
                      height: formData.dimensions?.height || 630
                    }
                  })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Hauteur</label>
                <Input
                  type="number"
                  placeholder="630"
                  value={formData.dimensions?.height || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    dimensions: {
                      ...formData.dimensions,
                      width: formData.dimensions?.width || 1200,
                      height: parseInt(e.target.value) || 630
                    }
                  })}
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={!formData.prompt.trim() || generating}
            className="w-full"
          >
            {generating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Générer le créatif
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Créatifs générés</CardTitle>
          <CardDescription>
            Gérez vos créatifs publicitaires générés par IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement des créatifs...
            </div>
          ) : creatives.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun créatif généré pour le moment
            </div>
          ) : (
            <div className="space-y-4">
              {creatives.map((creative) => {
                const IconComponent = typeIcons[creative.template_type];
                return (
                  <Card key={creative.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <IconComponent className="h-5 w-5 text-primary mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{creative.name}</h4>
                            <Badge variant="secondary">
                              {styleLabels[creative.creative_style]}
                            </Badge>
                            <Badge variant="outline">
                              {creative.template_type}
                            </Badge>
                          </div>
                          
                          {creative.template_data.text && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {creative.template_data.text}
                            </p>
                          )}
                          
                          {creative.template_data.image_url && (
                            <img
                              src={creative.template_data.image_url}
                              alt="Créatif généré"
                              className="max-w-xs rounded border mb-2"
                            />
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Score: {creative.performance_score}/100</span>
                            <span>Utilisé {creative.usage_count} fois</span>
                            <span>Créé le {new Date(creative.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCreative(creative.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AICreativeGenerator;