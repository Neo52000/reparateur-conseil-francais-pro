import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddressData {
  street: string;
  city: string;
  postal_code: string;
  country: string;
}

interface DeliveryData {
  standard: string;
  express: string;
  zones: string[];
  cost: string;
}

interface SupplierFormData {
  name: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  brands_sold: string;
  product_types: string;
  specialties: string;
  certifications: string;
  payment_terms: string;
  minimum_order: string;
  address: AddressData;
  delivery_info: DeliveryData;
  is_verified: boolean;
  is_featured: boolean;
  status: string;
}

interface SupplierFormProps {
  formData: SupplierFormData;
  onFormDataChange: (data: SupplierFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const SupplierForm: React.FC<SupplierFormProps> = ({
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  isEditing,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (formData.phone && !/^[\d\s\+\-\(\)\.]+$/.test(formData.phone)) {
      newErrors.phone = 'Numéro de téléphone invalide';
    }
    
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'URL invalide (doit commencer par http:// ou https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(e);
    }
  };

  const updateFormData = (updates: Partial<SupplierFormData>) => {
    onFormDataChange({ ...formData, ...updates });
  };

  const updateAddress = (updates: Partial<AddressData>) => {
    updateFormData({
      address: { ...formData.address, ...updates }
    });
  };

  const updateDeliveryInfo = (updates: Partial<DeliveryData>) => {
    updateFormData({
      delivery_info: { ...formData.delivery_info, ...updates }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom du fournisseur *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                className={errors.name ? 'border-destructive' : ''}
                required
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={(value) => updateFormData({ status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              rows={3}
              placeholder="Description des services et produits..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateFormData({ phone: e.target.value })}
                className={errors.phone ? 'border-destructive' : ''}
                placeholder="+33 1 23 45 67 89"
              />
              {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
            </div>
            <div>
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => updateFormData({ website: e.target.value })}
                className={errors.website ? 'border-destructive' : ''}
                placeholder="https://example.com"
              />
              {errors.website && <p className="text-sm text-destructive mt-1">{errors.website}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adresse structurée */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Adresse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="street">Rue</Label>
              <Input
                id="street"
                value={formData.address?.street || ''}
                onChange={(e) => updateAddress({ street: e.target.value })}
                placeholder="123 rue de l'Exemple"
              />
            </div>
            <div>
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={formData.address?.city || ''}
                onChange={(e) => updateAddress({ city: e.target.value })}
                placeholder="Paris"
              />
            </div>
            <div>
              <Label htmlFor="postal_code">Code postal</Label>
              <Input
                id="postal_code"
                value={formData.address?.postal_code || ''}
                onChange={(e) => updateAddress({ postal_code: e.target.value })}
                placeholder="75001"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="country">Pays</Label>
              <Input
                id="country"
                value={formData.address?.country || ''}
                onChange={(e) => updateAddress({ country: e.target.value })}
                placeholder="France"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Produits et services */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Produits et services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brands_sold">Marques vendues</Label>
              <Input
                id="brands_sold"
                value={formData.brands_sold}
                onChange={(e) => updateFormData({ brands_sold: e.target.value })}
                placeholder="Apple, Samsung, Huawei (séparées par des virgules)"
              />
            </div>
            <div>
              <Label htmlFor="product_types">Types de produits</Label>
              <Input
                id="product_types"
                value={formData.product_types}
                onChange={(e) => updateFormData({ product_types: e.target.value })}
                placeholder="Écrans, Batteries, Connecteurs (séparés par des virgules)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="specialties">Spécialités</Label>
              <Input
                id="specialties"
                value={formData.specialties}
                onChange={(e) => updateFormData({ specialties: e.target.value })}
                placeholder="Réparation iPhone, Livraison express"
              />
            </div>
            <div>
              <Label htmlFor="certifications">Certifications</Label>
              <Input
                id="certifications"
                value={formData.certifications}
                onChange={(e) => updateFormData({ certifications: e.target.value })}
                placeholder="ISO 9001, Certification Apple"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conditions commerciales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conditions commerciales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment_terms">Conditions de paiement</Label>
              <Input
                id="payment_terms"
                value={formData.payment_terms}
                onChange={(e) => updateFormData({ payment_terms: e.target.value })}
                placeholder="30 jours fin de mois"
              />
            </div>
            <div>
              <Label htmlFor="minimum_order">Commande minimum (€)</Label>
              <Input
                id="minimum_order"
                type="number"
                step="0.01"
                value={formData.minimum_order}
                onChange={(e) => updateFormData({ minimum_order: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Informations de livraison structurées */}
          <div className="space-y-3">
            <Label>Informations de livraison</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="delivery_standard">Livraison standard</Label>
                <Input
                  id="delivery_standard"
                  value={formData.delivery_info?.standard || ''}
                  onChange={(e) => updateDeliveryInfo({ standard: e.target.value })}
                  placeholder="24-48h"
                />
              </div>
              <div>
                <Label htmlFor="delivery_express">Livraison express</Label>
                <Input
                  id="delivery_express"
                  value={formData.delivery_info?.express || ''}
                  onChange={(e) => updateDeliveryInfo({ express: e.target.value })}
                  placeholder="Même jour"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="delivery_zones">Zones de livraison</Label>
                <Input
                  id="delivery_zones"
                  value={formData.delivery_info?.zones?.join(', ') || ''}
                  onChange={(e) => updateDeliveryInfo({ 
                    zones: e.target.value.split(',').map(z => z.trim()).filter(Boolean)
                  })}
                  placeholder="France, Europe (séparées par des virgules)"
                />
              </div>
              <div>
                <Label htmlFor="delivery_cost">Frais de livraison</Label>
                <Input
                  id="delivery_cost"
                  value={formData.delivery_info?.cost || ''}
                  onChange={(e) => updateDeliveryInfo({ cost: e.target.value })}
                  placeholder="Gratuit dès 100€"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_verified}
                onChange={(e) => updateFormData({ is_verified: e.target.checked })}
                className="rounded border-input"
              />
              <span>Fournisseur vérifié</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => updateFormData({ is_featured: e.target.checked })}
                className="rounded border-input"
              />
              <span>Mettre en vedette</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Annuler
        </Button>
        <Button type="submit">
          {isEditing ? 'Mettre à jour' : 'Créer le fournisseur'}
        </Button>
      </div>
    </form>
  );
};

export default SupplierForm;