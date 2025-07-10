import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Settings, 
  Palette, 
  Type, 
  Image,
  Video,
  Upload,
  Wand2,
  Save,
  Eye,
  RefreshCw,
  Sparkles,
  Search,
  Camera,
  Film,
  Brain,
  Lightbulb,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LandingPage {
  id: string;
  name: string;
  template_type: string;
  config: any;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface AILandingPageEditorProps {
  page: LandingPage;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
  size: number;
}

const AILandingPageEditor: React.FC<AILandingPageEditorProps> = ({ 
  page, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [config, setConfig] = useState(page.config || {});
  const [loading, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [pageData, setPageData] = useState({
    name: page.name,
    template_type: page.template_type,
    is_active: page.is_active
  });
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [seoScore, setSeoScore] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setConfig(page.config || {});
    setPageData({
      name: page.name,
      template_type: page.template_type,
      is_active: page.is_active
    });
    calculateSeoScore();
    loadMediaFiles();
  }, [page]);

  const loadMediaFiles = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('landing-page-media')
        .list('');
      
      if (error) throw error;
      
      const files = data?.map(file => ({
        id: file.id || file.name,
        url: supabase.storage.from('landing-page-media').getPublicUrl(file.name).data.publicUrl,
        type: file.name.match(/\.(mp4|avi|mov|wmv)$/i) ? 'video' as const : 'image' as const,
        name: file.name,
        size: file.metadata?.size || 0
      })) || [];
      
      setMediaFiles(files);
    } catch (error) {
      console.error('Error loading media files:', error);
    }
  };

  const calculateSeoScore = () => {
    const currentConfig = config;
    let score = 0;
    
    // Titre SEO (25 points)
    if (currentConfig.seo?.meta_title?.length >= 30 && currentConfig.seo?.meta_title?.length <= 60) {
      score += 25;
    } else if (currentConfig.seo?.meta_title) {
      score += 10;
    }
    
    // Description SEO (25 points)
    if (currentConfig.seo?.meta_description?.length >= 120 && currentConfig.seo?.meta_description?.length <= 160) {
      score += 25;
    } else if (currentConfig.seo?.meta_description) {
      score += 10;
    }
    
    // Mots-clés (15 points)
    if (currentConfig.seo?.keywords?.split(',').length >= 3) {
      score += 15;
    } else if (currentConfig.seo?.keywords) {
      score += 5;
    }
    
    // Titre H1 (10 points)
    if (currentConfig.hero?.title) {
      score += 10;
    }
    
    // Images avec alt (10 points)
    if (currentConfig.hero?.background_image || currentConfig.about?.image) {
      score += 10;
    }
    
    // Structure de contenu (15 points)
    if (currentConfig.about?.description && currentConfig.services?.items?.length > 0) {
      score += 15;
    }
    
    setSeoScore(score);
  };

  const updateConfig = (key: string, value: any) => {
    const newConfig = {
      ...config,
      [key]: value
    };
    setConfig(newConfig);
    calculateSeoScore();
  };

  const updateNestedConfig = (section: string, key: string, value: any) => {
    const newConfig = {
      ...config,
      [section]: {
        ...config[section],
        [key]: value
      }
    };
    setConfig(newConfig);
    calculateSeoScore();
  };

  const generateAIContent = async (contentType: string, context: string) => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-landing-content', {
        body: {
          contentType,
          context,
          currentConfig: config,
          businessType: pageData.template_type
        }
      });

      if (error) {
        console.error('❌ Erreur fonction edge generate-landing-content:', error);
        throw error;
      }

      if (!data || !data.content) {
        throw new Error('Aucun contenu généré par l\'IA');
      }

      console.log('✅ Contenu IA généré avec succès:', data.content);
      return data.content;
    } catch (error: any) {
      console.error('❌ Erreur génération contenu IA:', error);
      
      // Messages d'erreur améliorés et spécifiques
      let errorMessage = "Impossible de générer le contenu automatiquement";
      let errorDescription = "Une erreur s'est produite lors de la génération IA";
      
      if (error?.message?.includes("401") || error?.message?.includes("unauthorized")) {
        errorMessage = "Clé API Mistral manquante ou invalide";
        errorDescription = "Configurez MISTRAL_API_KEY dans les secrets Supabase";
      } else if (error?.message?.includes("429")) {
        errorMessage = "Limite de requêtes Mistral dépassée";
        errorDescription = "Veuillez réessayer dans quelques minutes";
      } else if (error?.message?.includes("quota")) {
        errorMessage = "Quota Mistral AI épuisé";
        errorDescription = "Vérifiez votre plan et facturation Mistral AI";
      } else if (error?.message?.includes("fetch") || error?.message?.includes("connexion")) {
        errorMessage = "Erreur de connexion à l'API";
        errorDescription = "Vérifiez votre connexion internet";
      } else if (error?.message?.includes("JSON") || error?.message?.includes("format")) {
        errorMessage = "Réponse IA invalide";
        errorDescription = "L'IA n'a pas retourné un format valide, réessayez";
      }
      
      toast({
        title: errorMessage,
        description: errorDescription,
        variant: "destructive"
      });
      return null;
    } finally {
      setAiLoading(false);
    }
  };

  const generateAISuggestions = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-landing-suggestions', {
        body: {
          currentConfig: config,
          businessType: pageData.template_type,
          seoScore
        }
      });

      if (error) {
        console.error('❌ Erreur fonction edge generate-landing-suggestions:', error);
        throw error;
      }

      setAiSuggestions(data.suggestions || []);
      
      // Afficher un message si c'est un fallback
      if (data.fallback) {
        toast({
          title: "Suggestions par défaut",
          description: "L'IA n'est pas disponible, suggestions génériques affichées",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('❌ Erreur génération suggestions:', error);
      
      // Suggestions de secours en cas d'erreur complète
      setAiSuggestions([
        "❌ Service IA indisponible",
        "Vérifiez la configuration Mistral API",
        "Optimisez manuellement le titre principal",
        "Améliorez la description SEO",
        "Ajoutez des témoignages clients"
      ]);
      
      toast({
        title: "Erreur suggestions IA",
        description: error.message || "Impossible de générer des suggestions",
        variant: "destructive"
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploadProgress(0);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('landing-page-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('landing-page-media')
        .getPublicUrl(fileName);

      const newFile: MediaFile = {
        id: fileName,
        url: urlData.publicUrl,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        name: fileName,
        size: file.size
      };

      setMediaFiles(prev => [...prev, newFile]);
      setUploadProgress(0);

      toast({
        title: "Fichier uploadé",
        description: "Le fichier a été uploadé avec succès"
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'uploader le fichier",
        variant: "destructive"
      });
    }
  };

  const savePage = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('landing_pages')
        .update({
          name: pageData.name,
          template_type: pageData.template_type,
          config: config,
          is_active: pageData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', page.id);

      if (error) throw error;

      toast({
        title: "Page sauvegardée",
        description: "Les modifications ont été enregistrées avec succès"
      });

      onSave?.();
      onClose();
    } catch (error: any) {
      console.error('Error saving page:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder la page",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getDefaultConfig = () => {
    return {
      hero: {
        title: config.hero?.title || "Votre titre principal",
        subtitle: config.hero?.subtitle || "Votre sous-titre accrocheur",
        background_image: config.hero?.background_image || "",
        background_video: config.hero?.background_video || "",
        cta_text: config.hero?.cta_text || "Contactez-nous",
        cta_url: config.hero?.cta_url || "#contact"
      },
      about: {
        title: config.about?.title || "À propos de nous",
        description: config.about?.description || "Description de votre service",
        image: config.about?.image || "",
        video: config.about?.video || ""
      },
      services: {
        title: config.services?.title || "Nos services",
        items: config.services?.items || [
          { name: "Service 1", description: "Description du service", price: "À partir de 50€" }
        ]
      },
      contact: {
        title: config.contact?.title || "Nous contacter",
        phone: config.contact?.phone || "",
        email: config.contact?.email || "",
        address: config.contact?.address || "",
        hours: config.contact?.hours || ""
      },
      style: {
        primary_color: config.style?.primary_color || "#2563eb",
        secondary_color: config.style?.secondary_color || "#64748b",
        font_family: config.style?.font_family || "Inter",
        button_style: config.style?.button_style || "rounded"
      },
      seo: {
        meta_title: config.seo?.meta_title || pageData.name,
        meta_description: config.seo?.meta_description || "",
        keywords: config.seo?.keywords || "",
        structured_data: config.seo?.structured_data || "",
        open_graph_image: config.seo?.open_graph_image || ""
      }
    };
  };

  const defaultConfig = getDefaultConfig();

  const getSeoScoreColor = () => {
    if (seoScore >= 80) return "text-green-600";
    if (seoScore >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Éditeur IA: {pageData.name}
            <Badge variant="outline" className="ml-2">
              <Sparkles className="w-3 h-3 mr-1" />
              Optimisé IA
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI Suggestions Panel */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="w-5 h-5 text-purple-600" />
                Assistant IA
                <Button 
                  onClick={generateAISuggestions}
                  disabled={aiLoading}
                  size="sm"
                  variant="outline"
                  className="ml-auto"
                >
                  {aiLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4" />
                  )}
                  Générer des suggestions
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiSuggestions.length > 0 ? (
                <div className="space-y-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-white rounded border">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{suggestion}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Cliquez sur "Générer des suggestions" pour obtenir des recommandations personnalisées.
                </p>
              )}
            </CardContent>
          </Card>

          {/* SEO Score */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Score SEO
                <span className={`text-lg font-bold ${getSeoScoreColor()}`}>
                  {seoScore}/100
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={seoScore} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                {seoScore >= 80 ? "Excellent! Votre page est bien optimisée." :
                 seoScore >= 60 ? "Bon travail! Quelques améliorations possibles." :
                 "Des améliorations sont nécessaires pour optimiser le SEO."}
              </p>
            </CardContent>
          </Card>

          {/* Page Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Paramètres de la page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="page-name">Nom de la page</Label>
                  <Input
                    id="page-name"
                    value={pageData.name}
                    onChange={(e) => setPageData({...pageData, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="template-type">Type de template</Label>
                  <Select value={pageData.template_type} onValueChange={(value) => setPageData({...pageData, template_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Template par défaut</SelectItem>
                      <SelectItem value="smartphone">Réparation Smartphone</SelectItem>
                      <SelectItem value="electronics">Service Électronique</SelectItem>
                      <SelectItem value="custom">Template personnalisé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={pageData.is_active}
                  onCheckedChange={(checked) => setPageData({...pageData, is_active: checked})}
                />
                <Label>Page active</Label>
                <Badge variant={pageData.is_active ? "default" : "secondary"}>
                  {pageData.is_active ? "Publié" : "Brouillon"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Tabs defaultValue="hero" className="space-y-4">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="about">À propos</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="media">Médias</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            {/* Hero Section */}
            <TabsContent value="hero">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Section Hero
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const content = await generateAIContent('hero', pageData.template_type);
                        if (content) {
                          updateConfig('hero', { ...defaultConfig.hero, ...content });
                        }
                      }}
                      disabled={aiLoading}
                    >
                      <Wand2 className="w-3 h-3 mr-1" />
                      IA
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="hero-title">Titre principal</Label>
                    <Input
                      id="hero-title"
                      value={defaultConfig.hero.title}
                      onChange={(e) => updateNestedConfig('hero', 'title', e.target.value)}
                      placeholder="Votre titre accrocheur"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hero-subtitle">Sous-titre</Label>
                    <Textarea
                      id="hero-subtitle"
                      value={defaultConfig.hero.subtitle}
                      onChange={(e) => updateNestedConfig('hero', 'subtitle', e.target.value)}
                      placeholder="Votre sous-titre explicatif"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hero-cta">Texte du bouton</Label>
                      <Input
                        id="hero-cta"
                        value={defaultConfig.hero.cta_text}
                        onChange={(e) => updateNestedConfig('hero', 'cta_text', e.target.value)}
                        placeholder="Contactez-nous"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hero-cta-url">URL du bouton</Label>
                      <Input
                        id="hero-cta-url"
                        value={defaultConfig.hero.cta_url}
                        onChange={(e) => updateNestedConfig('hero', 'cta_url', e.target.value)}
                        placeholder="#contact"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hero-bg">Image de fond (URL)</Label>
                      <Input
                        id="hero-bg"
                        value={defaultConfig.hero.background_image}
                        onChange={(e) => updateNestedConfig('hero', 'background_image', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hero-video">Vidéo de fond (URL)</Label>
                      <Input
                        id="hero-video"
                        value={defaultConfig.hero.background_video}
                        onChange={(e) => updateNestedConfig('hero', 'background_video', e.target.value)}
                        placeholder="https://example.com/video.mp4"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* About Section */}
            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Section À propos
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const content = await generateAIContent('about', pageData.template_type);
                        if (content) {
                          updateConfig('about', { ...defaultConfig.about, ...content });
                        }
                      }}
                      disabled={aiLoading}
                    >
                      <Wand2 className="w-3 h-3 mr-1" />
                      IA
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="about-title">Titre de la section</Label>
                    <Input
                      id="about-title"
                      value={defaultConfig.about.title}
                      onChange={(e) => updateNestedConfig('about', 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="about-description">Description</Label>
                    <Textarea
                      id="about-description"
                      value={defaultConfig.about.description}
                      onChange={(e) => updateNestedConfig('about', 'description', e.target.value)}
                      rows={5}
                      placeholder="Décrivez votre entreprise et vos valeurs..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="about-image">Image (URL)</Label>
                      <Input
                        id="about-image"
                        value={defaultConfig.about.image}
                        onChange={(e) => updateNestedConfig('about', 'image', e.target.value)}
                        placeholder="https://example.com/about-image.jpg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="about-video">Vidéo (URL)</Label>
                      <Input
                        id="about-video"
                        value={defaultConfig.about.video}
                        onChange={(e) => updateNestedConfig('about', 'video', e.target.value)}
                        placeholder="https://example.com/about-video.mp4"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Services Section */}
            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Section Services
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const content = await generateAIContent('services', pageData.template_type);
                        if (content) {
                          updateConfig('services', { ...defaultConfig.services, ...content });
                        }
                      }}
                      disabled={aiLoading}
                    >
                      <Wand2 className="w-3 h-3 mr-1" />
                      IA
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="services-title">Titre de la section</Label>
                    <Input
                      id="services-title"
                      value={defaultConfig.services.title}
                      onChange={(e) => updateNestedConfig('services', 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Services proposés</Label>
                    <div className="space-y-2">
                      {defaultConfig.services.items.map((service, index) => (
                        <div key={index} className="border rounded-lg p-3 space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <Input
                              value={service.name}
                              onChange={(e) => {
                                const newServices = [...defaultConfig.services.items];
                                newServices[index].name = e.target.value;
                                updateNestedConfig('services', 'items', newServices);
                              }}
                              placeholder="Nom du service"
                            />
                            <Input
                              value={service.description}
                              onChange={(e) => {
                                const newServices = [...defaultConfig.services.items];
                                newServices[index].description = e.target.value;
                                updateNestedConfig('services', 'items', newServices);
                              }}
                              placeholder="Description"
                            />
                            <Input
                              value={service.price}
                              onChange={(e) => {
                                const newServices = [...defaultConfig.services.items];
                                newServices[index].price = e.target.value;
                                updateNestedConfig('services', 'items', newServices);
                              }}
                              placeholder="Prix"
                            />
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newServices = [...defaultConfig.services.items, { name: "", description: "", price: "" }];
                          updateNestedConfig('services', 'items', newServices);
                        }}
                      >
                        Ajouter un service
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Section */}
            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>Section Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="contact-title">Titre de la section</Label>
                    <Input
                      id="contact-title"
                      value={defaultConfig.contact.title}
                      onChange={(e) => updateNestedConfig('contact', 'title', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact-phone">Téléphone</Label>
                      <Input
                        id="contact-phone"
                        value={defaultConfig.contact.phone}
                        onChange={(e) => updateNestedConfig('contact', 'phone', e.target.value)}
                        placeholder="01 23 45 67 89"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Email</Label>
                      <Input
                        id="contact-email"
                        value={defaultConfig.contact.email}
                        onChange={(e) => updateNestedConfig('contact', 'email', e.target.value)}
                        placeholder="contact@exemple.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="contact-address">Adresse</Label>
                    <Textarea
                      id="contact-address"
                      value={defaultConfig.contact.address}
                      onChange={(e) => updateNestedConfig('contact', 'address', e.target.value)}
                      placeholder="123 Rue de la République, 75001 Paris"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-hours">Horaires</Label>
                    <Textarea
                      id="contact-hours"
                      value={defaultConfig.contact.hours}
                      onChange={(e) => updateNestedConfig('contact', 'hours', e.target.value)}
                      placeholder="Lun-Ven: 9h-18h, Sam: 9h-12h"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Media Section */}
            <TabsContent value="media">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Gestion des médias
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <div className="text-sm text-gray-600 mb-2">
                        Glissez vos fichiers ici ou
                      </div>
                      <Button variant="outline" size="sm">
                        <input
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          accept="image/*,video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file);
                          }}
                        />
                        Choisir un fichier
                      </Button>
                    </div>
                    {uploadProgress > 0 && (
                      <div className="mt-4">
                        <Progress value={uploadProgress} />
                        <p className="text-sm text-center mt-1">Upload en cours... {Math.round(uploadProgress)}%</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {mediaFiles.map((file) => (
                      <div key={file.id} className="border rounded-lg p-2">
                        {file.type === 'image' ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-20 object-cover rounded mb-2"
                          />
                        ) : (
                          <div className="w-full h-20 bg-gray-100 rounded mb-2 flex items-center justify-center">
                            <Film className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <p className="text-xs text-gray-600 truncate">{file.name}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-1 text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(file.url);
                            toast({
                              title: "Copié",
                              description: "URL copiée dans le presse-papier"
                            });
                          }}
                        >
                          Copier URL
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Style Section */}
            <TabsContent value="style">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Style et Design
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primary-color">Couleur primaire</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primary-color"
                          type="color"
                          value={defaultConfig.style.primary_color}
                          onChange={(e) => updateNestedConfig('style', 'primary_color', e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input
                          value={defaultConfig.style.primary_color}
                          onChange={(e) => updateNestedConfig('style', 'primary_color', e.target.value)}
                          placeholder="#2563eb"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="secondary-color">Couleur secondaire</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondary-color"
                          type="color"
                          value={defaultConfig.style.secondary_color}
                          onChange={(e) => updateNestedConfig('style', 'secondary_color', e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input
                          value={defaultConfig.style.secondary_color}
                          onChange={(e) => updateNestedConfig('style', 'secondary_color', e.target.value)}
                          placeholder="#64748b"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="font-family">Police de caractères</Label>
                      <Select 
                        value={defaultConfig.style.font_family} 
                        onValueChange={(value) => updateNestedConfig('style', 'font_family', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                          <SelectItem value="Montserrat">Montserrat</SelectItem>
                          <SelectItem value="Poppins">Poppins</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="button-style">Style des boutons</Label>
                      <Select 
                        value={defaultConfig.style.button_style} 
                        onValueChange={(value) => updateNestedConfig('style', 'button_style', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rounded">Arrondis</SelectItem>
                          <SelectItem value="pill">Pilule</SelectItem>
                          <SelectItem value="square">Carré</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Section */}
            <TabsContent value="seo">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Optimisation SEO
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const content = await generateAIContent('seo', pageData.template_type);
                        if (content) {
                          updateConfig('seo', { ...defaultConfig.seo, ...content });
                        }
                      }}
                      disabled={aiLoading}
                    >
                      <Wand2 className="w-3 h-3 mr-1" />
                      IA
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="meta-title">Titre SEO (max 60 caractères)</Label>
                    <Input
                      id="meta-title"
                      value={defaultConfig.seo.meta_title}
                      onChange={(e) => updateNestedConfig('seo', 'meta_title', e.target.value)}
                      placeholder="Titre pour les moteurs de recherche"
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {defaultConfig.seo.meta_title?.length || 0}/60 caractères
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="meta-description">Description SEO (max 160 caractères)</Label>
                    <Textarea
                      id="meta-description"
                      value={defaultConfig.seo.meta_description}
                      onChange={(e) => updateNestedConfig('seo', 'meta_description', e.target.value)}
                      placeholder="Description pour les moteurs de recherche"
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {defaultConfig.seo.meta_description?.length || 0}/160 caractères
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="keywords">Mots-clés SEO</Label>
                    <Input
                      id="keywords"
                      value={defaultConfig.seo.keywords}
                      onChange={(e) => updateNestedConfig('seo', 'keywords', e.target.value)}
                      placeholder="réparation, smartphone, conseil"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Séparez les mots-clés par des virgules
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="og-image">Image Open Graph</Label>
                    <Input
                      id="og-image"
                      value={defaultConfig.seo.open_graph_image}
                      onChange={(e) => updateNestedConfig('seo', 'open_graph_image', e.target.value)}
                      placeholder="https://example.com/og-image.jpg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="structured-data">Données structurées (JSON-LD)</Label>
                    <Textarea
                      id="structured-data"
                      value={defaultConfig.seo.structured_data}
                      onChange={(e) => updateNestedConfig('seo', 'structured_data', e.target.value)}
                      placeholder='{"@context": "https://schema.org", "@type": "LocalBusiness", ...}'
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={savePage} disabled={loading}>
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Sauvegarder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AILandingPageEditor;