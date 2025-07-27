import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Upload, Monitor, Smartphone, Eye, Save } from 'lucide-react';
import { useStoreCustomization } from '@/hooks/useStoreCustomization';

const StoreCustomizer = () => {
  const { customization, loading, updateCustomization } = useStoreCustomization();
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const handleColorChange = (colorType: 'primary_color' | 'secondary_color', value: string) => {
    updateCustomization({ [colorType]: value });
  };

  const predefinedThemes = [
    {
      name: 'Moderne',
      primary_color: '#4F46E5',
      secondary_color: '#10B981',
      font_family: 'Inter'
    },
    {
      name: 'Élégant',
      primary_color: '#7C3AED',
      secondary_color: '#F59E0B',
      font_family: 'Playfair Display'
    },
    {
      name: 'Classique',
      primary_color: '#1F2937',
      secondary_color: '#059669',
      font_family: 'Georgia'
    },
    {
      name: 'Chaleureux',
      primary_color: '#DC2626',
      secondary_color: '#EA580C',
      font_family: 'Roboto'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" />
            Personnalisation de la boutique
          </h2>
          <p className="text-muted-foreground">
            Personnalisez l'apparence de votre boutique en ligne
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={previewDevice === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewDevice('desktop')}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={previewDevice === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewDevice('mobile')}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panneau de configuration */}
        <div className="space-y-6">
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="colors">Couleurs</TabsTrigger>
              <TabsTrigger value="typography">Police</TabsTrigger>
              <TabsTrigger value="advanced">Avancé</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="store-name">Nom de la boutique</Label>
                    <Input
                      id="store-name"
                      value={customization?.store_name || ''}
                      onChange={(e) => updateCustomization({ store_name: e.target.value })}
                      placeholder="Ma Boutique de Réparation"
                    />
                  </div>

                  <div>
                    <Label htmlFor="logo-url">URL du logo</Label>
                    <div className="flex gap-2">
                      <Input
                        id="logo-url"
                        value={customization?.logo_url || ''}
                        onChange={(e) => updateCustomization({ logo_url: e.target.value })}
                        placeholder="https://example.com/logo.png"
                      />
                      <Button variant="outline" size="icon">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Thèmes prédéfinis</CardTitle>
                  <CardDescription>
                    Appliquez rapidement un style professionnel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {predefinedThemes.map((theme) => (
                      <Button
                        key={theme.name}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-start"
                        onClick={() => updateCustomization(theme)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: theme.primary_color }}
                          />
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: theme.secondary_color }}
                          />
                        </div>
                        <span className="font-medium">{theme.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {theme.font_family}
                        </span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Palette de couleurs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primary-color">Couleur primaire</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          id="primary-color"
                          value={customization?.primary_color || '#4F46E5'}
                          onChange={(e) => handleColorChange('primary_color', e.target.value)}
                          className="w-12 h-10 rounded border"
                        />
                        <Input
                          value={customization?.primary_color || '#4F46E5'}
                          onChange={(e) => handleColorChange('primary_color', e.target.value)}
                          placeholder="#4F46E5"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="secondary-color">Couleur secondaire</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          id="secondary-color"
                          value={customization?.secondary_color || '#10B981'}
                          onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                          className="w-12 h-10 rounded border"
                        />
                        <Input
                          value={customization?.secondary_color || '#10B981'}
                          onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                          placeholder="#10B981"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Aperçu des couleurs</h4>
                    <div className="flex gap-2">
                      <div 
                        className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                        style={{ backgroundColor: customization?.primary_color || '#4F46E5' }}
                      >
                        Primary
                      </div>
                      <div 
                        className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                        style={{ backgroundColor: customization?.secondary_color || '#10B981' }}
                      >
                        Secondary
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="typography" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Typographie</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="font-family">Police de caractères</Label>
                    <Select
                      value={customization?.font_family || 'Inter'}
                      onValueChange={(value) => updateCustomization({ font_family: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter (Moderne)</SelectItem>
                        <SelectItem value="Roboto">Roboto (Classique)</SelectItem>
                        <SelectItem value="Playfair Display">Playfair Display (Élégant)</SelectItem>
                        <SelectItem value="Georgia">Georgia (Serif)</SelectItem>
                        <SelectItem value="Montserrat">Montserrat (Sans-serif)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Aperçu de la police</h4>
                    <div 
                      className="p-4 border rounded-lg"
                      style={{ fontFamily: customization?.font_family || 'Inter' }}
                    >
                      <h3 className="text-lg font-bold mb-2">Titre principal</h3>
                      <p className="text-sm text-muted-foreground">
                        Ceci est un exemple de texte avec la police sélectionnée.
                        Elle s'appliquera à l'ensemble de votre boutique.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>CSS personnalisé</CardTitle>
                  <CardDescription>
                    Ajoutez votre propre CSS pour des personnalisations avancées
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={customization?.custom_css || ''}
                    onChange={(e) => updateCustomization({ custom_css: e.target.value })}
                    placeholder="/* Votre CSS personnalisé */&#10;.custom-button {&#10;  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);&#10;}"
                    rows={8}
                    className="font-mono text-sm"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Aperçu */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Aperçu en temps réel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className={`border rounded-lg overflow-hidden transition-all ${
                  previewDevice === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
                }`}
                style={{
                  fontFamily: customization?.font_family || 'Inter',
                }}
              >
                {/* Header de la boutique */}
                <div 
                  className="p-4 text-white"
                  style={{ backgroundColor: customization?.primary_color || '#4F46E5' }}
                >
                  <div className="flex items-center gap-3">
                    {customization?.logo_url && (
                      <img 
                        src={customization.logo_url} 
                        alt="Logo"
                        className="w-8 h-8 rounded"
                      />
                    )}
                    <h2 className="font-bold">
                      {customization?.store_name || 'Ma Boutique'}
                    </h2>
                  </div>
                </div>

                {/* Contenu de la boutique */}
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border rounded p-3">
                      <div className="w-full h-20 bg-gray-100 rounded mb-2"></div>
                      <h4 className="font-medium text-sm">Réparation iPhone</h4>
                      <p className="text-xs text-muted-foreground">À partir de 39€</p>
                    </div>
                    <div className="border rounded p-3">
                      <div className="w-full h-20 bg-gray-100 rounded mb-2"></div>
                      <h4 className="font-medium text-sm">Réparation Samsung</h4>
                      <p className="text-xs text-muted-foreground">À partir de 45€</p>
                    </div>
                  </div>

                  <Button 
                    className="w-full text-white"
                    style={{ backgroundColor: customization?.secondary_color || '#10B981' }}
                  >
                    Voir tous les services
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => updateCustomization({ is_active: true })}
                className="w-full"
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder et activer
              </Button>
              
              <Badge variant="outline" className="w-full justify-center py-2">
                {customization?.is_active ? 'Configuration active' : 'Configuration en brouillon'}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StoreCustomizer;