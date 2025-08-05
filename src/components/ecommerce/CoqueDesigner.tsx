import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { Palette, Save, Eye, Upload, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface CoqueDesignData {
  name: string;
  brand: string;
  model: string;
  material: string;
  color: string;
  pattern: string;
  description: string;
  customization: string;
  price: number;
  images: string[];
}

const CoqueDesigner: React.FC = () => {
  const [designData, setDesignData] = useState<CoqueDesignData>({
    name: '',
    brand: '',
    model: '',
    material: 'tpu',
    color: '#000000',
    pattern: 'uni',
    description: '',
    customization: '',
    price: 0,
    images: []
  });

  const [activeTab, setActiveTab] = useState('design');

  const materials = [
    { value: 'tpu', label: 'TPU Souple' },
    { value: 'pc', label: 'PC Rigide' },
    { value: 'cuir', label: 'Cuir' },
    { value: 'silicone', label: 'Silicone' },
    { value: 'metal', label: 'Métal' },
    { value: 'bois', label: 'Bois' }
  ];

  const patterns = [
    { value: 'uni', label: 'Uni' },
    { value: 'transparent', label: 'Transparent' },
    { value: 'marbré', label: 'Marbré' },
    { value: 'dégradé', label: 'Dégradé' },
    { value: 'paillettes', label: 'Paillettes' },
    { value: 'motif', label: 'Motif personnalisé' }
  ];

  const brands = [
    'iPhone', 'Samsung', 'Huawei', 'Xiaomi', 'OnePlus', 'Google Pixel', 'Sony', 'Oppo'
  ];

  const handleSave = () => {
    if (!designData.name || !designData.brand || !designData.model) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    toast.success('Design de coque sauvegardé avec succès!');
  };

  const handlePreview = () => {
    setActiveTab('preview');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Concepteur de Coques</h2>
          <p className="text-muted-foreground">
            Créez et personnalisez des descriptions de coques pour votre boutique
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" />
            Aperçu
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="design">
            <Palette className="w-4 h-4 mr-2" />
            Design
          </TabsTrigger>
          <TabsTrigger value="description">
            Description
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="w-4 h-4 mr-2" />
            Aperçu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="design">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations de base */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de base</CardTitle>
                <CardDescription>
                  Définissez les caractéristiques principales de la coque
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom du produit *</Label>
                    <Input
                      id="name"
                      value={designData.name}
                      onChange={(e) => setDesignData({...designData, name: e.target.value})}
                      placeholder="Coque iPhone 15 Pro Max..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Prix (€) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={designData.price}
                      onChange={(e) => setDesignData({...designData, price: parseFloat(e.target.value)})}
                      placeholder="29.99"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Marque *</Label>
                    <Select value={designData.brand} onValueChange={(value) => setDesignData({...designData, brand: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une marque" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand} value={brand.toLowerCase()}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="model">Modèle *</Label>
                    <Input
                      id="model"
                      value={designData.model}
                      onChange={(e) => setDesignData({...designData, model: e.target.value})}
                      placeholder="iPhone 15 Pro Max"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Caractéristiques visuelles */}
            <Card>
              <CardHeader>
                <CardTitle>Design et matériaux</CardTitle>
                <CardDescription>
                  Personnalisez l'apparence et les matériaux
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="material">Matériau</Label>
                    <Select value={designData.material} onValueChange={(value) => setDesignData({...designData, material: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map((material) => (
                          <SelectItem key={material.value} value={material.value}>
                            {material.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pattern">Motif</Label>
                    <Select value={designData.pattern} onValueChange={(value) => setDesignData({...designData, pattern: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {patterns.map((pattern) => (
                          <SelectItem key={pattern.value} value={pattern.value}>
                            {pattern.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="color">Couleur principale</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="color"
                      type="color"
                      value={designData.color}
                      onChange={(e) => setDesignData({...designData, color: e.target.value})}
                      className="w-12 h-10 p-1 border-2"
                    />
                    <Input
                      value={designData.color}
                      onChange={(e) => setDesignData({...designData, color: e.target.value})}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Images du produit</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Glissez vos images ici ou cliquez pour parcourir
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Ajouter des images
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="description">
          <Card>
            <CardHeader>
              <CardTitle>Description détaillée</CardTitle>
              <CardDescription>
                Rédigez une description attractive avec l'éditeur WYSIWYG
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Description du produit</Label>
                <div className="mt-2">
                  <RichTextEditor
                    content={designData.description}
                    onChange={(content) => setDesignData({...designData, description: content})}
                    placeholder="Décrivez votre coque en détail : protection, design, compatibilité..."
                    height="300px"
                  />
                </div>
              </div>

              <div>
                <Label>Options de personnalisation</Label>
                <div className="mt-2">
                  <RichTextEditor
                    content={designData.customization}
                    onChange={(content) => setDesignData({...designData, customization: content})}
                    placeholder="Décrivez les options de personnalisation disponibles : gravure, impression personnalisée..."
                    height="200px"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Aperçu du produit
              </CardTitle>
              <CardDescription>
                Visualisez comment votre coque apparaîtra dans la boutique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-2xl mx-auto">
                <div className="border rounded-lg p-6 bg-card">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                      <Smartphone className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{designData.name || 'Nom du produit'}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{designData.brand || 'Marque'}</Badge>
                        <Badge variant="outline">{designData.model || 'Modèle'}</Badge>
                      </div>
                      <p className="text-2xl font-bold text-primary">{designData.price || 0}€</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Caractéristiques</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge>{materials.find(m => m.value === designData.material)?.label || 'Matériau'}</Badge>
                        <Badge>{patterns.find(p => p.value === designData.pattern)?.label || 'Motif'}</Badge>
                        <div className="flex items-center gap-1">
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: designData.color }}
                          />
                          <span className="text-sm">{designData.color}</span>
                        </div>
                      </div>
                    </div>

                    {designData.description && (
                      <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <div 
                          className="prose prose-sm max-w-none text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: designData.description }}
                        />
                      </div>
                    )}

                    {designData.customization && (
                      <div>
                        <h4 className="font-semibold mb-2">Personnalisation</h4>
                        <div 
                          className="prose prose-sm max-w-none text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: designData.customization }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoqueDesigner;