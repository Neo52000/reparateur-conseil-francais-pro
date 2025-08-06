import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Calculator, Wand2 } from 'lucide-react';
import { EnhancedInventoryItem, ProductCategory } from '@/hooks/useInventoryManagement';

interface EnhancedProductFormProps {
  product?: EnhancedInventoryItem;
  categories: ProductCategory[];
  onSubmit: (product: Partial<EnhancedInventoryItem>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const EnhancedProductForm: React.FC<EnhancedProductFormProps> = ({
  product,
  categories,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<Partial<EnhancedInventoryItem>>({
    name: '',
    description: '',
    custom_description: '',
    sku: '',
    external_reference: '',
    brand: '',
    model: '',
    category_id: '',
    current_stock: 0,
    minimum_stock: 0,
    purchase_price_ht: 0,
    purchase_price_ttc: 0,
    sale_price_ht: 0,
    sale_price_ttc: 0,
    margin_percentage: 0,
    tva_rate: 20,
    ecotax: 0,
    ademe_bonus: 0,
    is_ecommerce_active: false,
    requires_intervention: false,
    image_url: '',
    ...product
  });

  const handleInputChange = (field: keyof EnhancedInventoryItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateMargin = () => {
    if (formData.purchase_price_ht && formData.sale_price_ht) {
      const margin = ((formData.sale_price_ht - formData.purchase_price_ht) / formData.purchase_price_ht * 100);
      handleInputChange('margin_percentage', Math.round(margin * 100) / 100);
    }
  };

  const calculateSalePriceFromMargin = () => {
    if (formData.purchase_price_ht && formData.margin_percentage) {
      const salePrice = formData.purchase_price_ht * (1 + formData.margin_percentage / 100);
      handleInputChange('sale_price_ht', Math.round(salePrice * 100) / 100);
      handleInputChange('sale_price_ttc', Math.round(salePrice * (1 + (formData.tva_rate || 20) / 100) * 100) / 100);
    }
  };

  const calculateTTCPrices = () => {
    if (formData.purchase_price_ht && formData.tva_rate) {
      const purchaseTTC = formData.purchase_price_ht * (1 + formData.tva_rate / 100);
      handleInputChange('purchase_price_ttc', Math.round(purchaseTTC * 100) / 100);
    }
    if (formData.sale_price_ht && formData.tva_rate) {
      const saleTTC = formData.sale_price_ht * (1 + formData.tva_rate / 100);
      handleInputChange('sale_price_ttc', Math.round(saleTTC * 100) / 100);
    }
  };

  const generateSKU = () => {
    const prefix = formData.brand ? formData.brand.substring(0, 3).toUpperCase() : 'PRD';
    const timestamp = Date.now().toString().slice(-6);
    const generatedSKU = `${prefix}-${timestamp}`;
    handleInputChange('sku', generatedSKU);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  useEffect(() => {
    calculateTTCPrices();
  }, [formData.purchase_price_ht, formData.sale_price_ht, formData.tva_rate]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {product ? 'Modifier le produit' : 'Nouveau produit'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du produit *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Marque</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">Modèle</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleInputChange('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Références */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">Référence interne (SKU)</Label>
              <div className="flex gap-2">
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                />
                <Button type="button" variant="outline" onClick={generateSKU}>
                  <Wand2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="external_reference">Référence fournisseur</Label>
              <Input
                id="external_reference"
                value={formData.external_reference}
                onChange={(e) => handleInputChange('external_reference', e.target.value)}
              />
            </div>
          </div>

          {/* Prix et marges */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prix et marges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchase_price_ht">Prix d'achat HT</Label>
                  <Input
                    id="purchase_price_ht"
                    type="number"
                    step="0.01"
                    value={formData.purchase_price_ht}
                    onChange={(e) => handleInputChange('purchase_price_ht', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchase_price_ttc">Prix d'achat TTC</Label>
                  <Input
                    id="purchase_price_ttc"
                    type="number"
                    step="0.01"
                    value={formData.purchase_price_ttc}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tva_rate">TVA (%)</Label>
                  <Input
                    id="tva_rate"
                    type="number"
                    step="0.01"
                    value={formData.tva_rate}
                    onChange={(e) => handleInputChange('tva_rate', parseFloat(e.target.value) || 20)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="margin_percentage">Marge (%)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="margin_percentage"
                      type="number"
                      step="0.01"
                      value={formData.margin_percentage}
                      onChange={(e) => handleInputChange('margin_percentage', parseFloat(e.target.value) || 0)}
                    />
                    <Button type="button" variant="outline" onClick={calculateSalePriceFromMargin}>
                      <Calculator className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sale_price_ht">Prix de vente HT</Label>
                  <Input
                    id="sale_price_ht"
                    type="number"
                    step="0.01"
                    value={formData.sale_price_ht}
                    onChange={(e) => {
                      handleInputChange('sale_price_ht', parseFloat(e.target.value) || 0);
                      // Calculate margin immediately on input change
                      calculateMargin();
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale_price_ttc">Prix de vente TTC</Label>
                  <Input
                    id="sale_price_ttc"
                    type="number"
                    step="0.01"
                    value={formData.sale_price_ttc}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ecotax">Écotaxe</Label>
                  <Input
                    id="ecotax"
                    type="number"
                    step="0.01"
                    value={formData.ecotax}
                    onChange={(e) => handleInputChange('ecotax', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_stock">Stock actuel</Label>
              <Input
                id="current_stock"
                type="number"
                value={formData.current_stock}
                onChange={(e) => handleInputChange('current_stock', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimum_stock">Seuil critique</Label>
              <Input
                id="minimum_stock"
                type="number"
                value={formData.minimum_stock}
                onChange={(e) => handleInputChange('minimum_stock', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Description et image */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom_description">Description personnalisée (tickets/web)</Label>
              <Textarea
                id="custom_description"
                value={formData.custom_description}
                onChange={(e) => handleInputChange('custom_description', e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">URL de l'image</Label>
              <div className="flex gap-2">
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="https://..."
                />
                <Button type="button" variant="outline">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_ecommerce_active"
                checked={formData.is_ecommerce_active}
                onCheckedChange={(checked) => handleInputChange('is_ecommerce_active', checked)}
              />
              <Label htmlFor="is_ecommerce_active">Actif pour la boutique e-commerce</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="requires_intervention"
                checked={formData.requires_intervention}
                onCheckedChange={(checked) => handleInputChange('requires_intervention', checked)}
              />
              <Label htmlFor="requires_intervention">Vendu avec intervention</Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : product ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};