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
import { 
  Settings, 
  Palette, 
  Type, 
  Image,
  Code,
  Save,
  Eye,
  RefreshCw
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

interface LandingPageEditorProps {
  page: LandingPage;
  isOpen: boolean;
  onClose: () => void;
}

const LandingPageEditor: React.FC<LandingPageEditorProps> = ({ page, isOpen, onClose }) => {
  const [config, setConfig] = useState(page.config || {});
  const [loading, setSaving] = useState(false);
  const [pageData, setPageData] = useState({
    name: page.name,
    template_type: page.template_type,
    is_active: page.is_active
  });
  const { toast } = useToast();

  useEffect(() => {
    setConfig(page.config || {});
    setPageData({
      name: page.name,
      template_type: page.template_type,
      is_active: page.is_active
    });
  }, [page]);

  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateNestedConfig = (section: string, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
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
        cta_text: config.hero?.cta_text || "Contactez-nous",
        cta_url: config.hero?.cta_url || "#contact"
      },
      about: {
        title: config.about?.title || "À propos de nous",
        description: config.about?.description || "Description de votre service",
        image: config.about?.image || ""
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
        keywords: config.seo?.keywords || ""
      }
    };
  };

  const defaultConfig = getDefaultConfig();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Éditer: {pageData.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
                      <SelectItem value="garage">Garage Automobile</SelectItem>
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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="about">À propos</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
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
                  <div>
                    <Label htmlFor="hero-bg">Image de fond (URL)</Label>
                    <Input
                      id="hero-bg"
                      value={defaultConfig.hero.background_image}
                      onChange={(e) => updateNestedConfig('hero', 'background_image', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* About Section */}
            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <CardTitle>Section À propos</CardTitle>
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
                  <div>
                    <Label htmlFor="about-image">Image (URL)</Label>
                    <Input
                      id="about-image"
                      value={defaultConfig.about.image}
                      onChange={(e) => updateNestedConfig('about', 'image', e.target.value)}
                      placeholder="https://example.com/about-image.jpg"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Services Section */}
            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <CardTitle>Section Services</CardTitle>
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

            {/* Style Section */}
            <TabsContent value="style">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Personnalisation du style
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primary-color">Couleur principale</Label>
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
                      <Select value={defaultConfig.style.font_family} onValueChange={(value) => updateNestedConfig('style', 'font_family', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                          <SelectItem value="Lato">Lato</SelectItem>
                          <SelectItem value="Montserrat">Montserrat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="button-style">Style des boutons</Label>
                      <Select value={defaultConfig.style.button_style} onValueChange={(value) => updateNestedConfig('style', 'button_style', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rounded">Arrondis</SelectItem>
                          <SelectItem value="square">Carrés</SelectItem>
                          <SelectItem value="pill">Pilule</SelectItem>
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
                  <CardTitle>Optimisation SEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="meta-title">Titre de la page (meta title)</Label>
                    <Input
                      id="meta-title"
                      value={defaultConfig.seo.meta_title}
                      onChange={(e) => updateNestedConfig('seo', 'meta_title', e.target.value)}
                      placeholder="Titre optimisé pour les moteurs de recherche"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommandé: 50-60 caractères
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="meta-description">Description (meta description)</Label>
                    <Textarea
                      id="meta-description"
                      value={defaultConfig.seo.meta_description}
                      onChange={(e) => updateNestedConfig('seo', 'meta_description', e.target.value)}
                      placeholder="Description claire et engageante de votre service"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommandé: 150-160 caractères
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="keywords">Mots-clés</Label>
                    <Input
                      id="keywords"
                      value={defaultConfig.seo.keywords}
                      onChange={(e) => updateNestedConfig('seo', 'keywords', e.target.value)}
                      placeholder="réparation, smartphone, garage, dépannage"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Séparez les mots-clés par des virgules
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <Separator />
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Aperçu
              </Button>
              <Button onClick={savePage} disabled={loading}>
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LandingPageEditor;