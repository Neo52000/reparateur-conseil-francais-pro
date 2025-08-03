import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wand2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Supplier } from '@/hooks/useSuppliersDirectory';

interface SupplierFormManagerProps {
  supplier?: Supplier | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const SupplierFormManager = ({ supplier, onSubmit, onCancel }: SupplierFormManagerProps) => {
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    description: supplier?.description || '',
    brands: supplier?.brands_sold?.join(', ') || '',
    product_types: supplier?.product_types?.join(', ') || '',
    website: supplier?.website || '',
    phone: supplier?.phone || '',
    email: supplier?.email || '',
    address: supplier?.address?.street || '',
    city: supplier?.address?.city || '',
    postal_code: supplier?.address?.postal_code || '',
    specialties: supplier?.specialties?.join(', ') || '',
    certification_labels: supplier?.certifications?.join(', ') || '',
    logo_url: supplier?.logo_url || '',
    payment_terms: supplier?.payment_terms || '',
    minimum_order: supplier?.minimum_order || '',
    delivery_zones: supplier?.delivery_info?.zones?.join(', ') || '',
    delivery_times: supplier?.delivery_info?.time || '',
    delivery_costs: supplier?.delivery_info?.cost || ''
  });

  const [isAutoCompleting, setIsAutoCompleting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [urlToExtract, setUrlToExtract] = useState('');

  const formatFieldValue = (value: any, fieldName: string): string | string[] => {
    console.log(`Formatting ${fieldName}:`, value, typeof value);
    
    const arrayFields = ['brands', 'product_types', 'specialties', 'certification_labels', 'delivery_zones'];
    const isArrayField = arrayFields.some(field => fieldName.includes(field));
    
    if (!value) {
      return isArrayField ? [] : '';
    }
    
    if (isArrayField) {
      if (Array.isArray(value)) {
        return value.filter(Boolean).map(String);
      }
      if (typeof value === 'string') {
        return value.split(',').map(item => item.trim()).filter(Boolean);
      }
      return [];
    }
    
    return String(value).trim();
  };

  const handleAutoComplete = (data: any) => {
    console.log('Auto-completing with data:', data);
    const updates: Record<string, any> = {};
    
    // Direct field mappings with enhanced logging
    const fieldMappings = {
      name: 'name',
      description: 'description',
      email: 'email',
      phone: 'phone',
      website: 'website',
      address: 'address_street',
      city: 'address_city',
      postal_code: 'address_postal',
      brands: 'brands_sold',
      product_types: 'product_types',
      minimum_order: 'minimum_order',
      specialties: 'specialties',
      payment_terms: 'payment_terms',
      delivery_zones: 'delivery_zones',
      delivery_times: 'delivery_time',
      delivery_costs: 'delivery_cost',
      logo_url: 'logo_url',
      certification_labels: 'certifications'
    };

    let filledFields = 0;
    let totalFields = Object.keys(fieldMappings).length;

    Object.entries(fieldMappings).forEach(([formField, dataField]) => {
      if (data[dataField] !== undefined && data[dataField] !== null && data[dataField] !== '') {
        const formattedValue = formatFieldValue(data[dataField], formField);
        updates[formField] = formattedValue;
        filledFields++;
        console.log(`✓ ${formField}: ${Array.isArray(formattedValue) ? formattedValue.join(', ') : formattedValue}`);
      } else {
        console.log(`✗ ${formField}: missing or empty`);
      }
    });

    console.log(`Integration summary: ${filledFields}/${totalFields} fields filled`);
    setFormData(prev => ({ ...prev, ...updates }));
    setShowPreview(false);
    toast.success(`Données intégrées avec succès! ${filledFields}/${totalFields} champs remplis.`);
  };

  const handleAutoExtract = async () => {
    if (!formData.website) {
      toast.error('Veuillez saisir un site web avant d\'utiliser l\'auto-complétion');
      return;
    }

    setIsAutoCompleting(true);
    setUrlToExtract(formData.website);
    
    try {
      console.log('Starting AI extraction for URL:', formData.website);
      toast.info("Analyse IA en cours...", { duration: 3000 });
      
      const { data: aiData, error: aiError } = await supabase.functions.invoke('extract-supplier-info-ai', {
        body: { 
          url: formData.website,
          content: null 
        }
      });
      
      console.log('AI extraction response:', { aiData, aiError });
      
      if (aiData && aiData.success && aiData.data) {
        setExtractedData(aiData.data);
        setShowPreview(true);
        console.log('AI extraction successful:', aiData.data);
      } else {
        toast.error("Impossible d'extraire les informations du site web.");
      }
    } catch (error) {
      console.error('Auto-completion error:', error);
      toast.error("Une erreur est survenue lors de l'extraction des données.");
    } finally {
      setIsAutoCompleting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du fournisseur *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Site web</Label>
            <div className="flex gap-2">
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://exemple.com"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoExtract}
                disabled={!formData.website || isAutoCompleting}
                className="shrink-0"
              >
                {isAutoCompleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                {isAutoCompleting ? 'Analyse...' : 'Auto-compléter'}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="brands">Marques vendues (séparées par des virgules)</Label>
          <Input
            id="brands"
            value={formData.brands}
            onChange={(e) => setFormData({ ...formData, brands: e.target.value })}
            placeholder="Apple, Samsung, Huawei..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product_types">Types de produits (séparés par des virgules)</Label>
          <Input
            id="product_types"
            value={formData.product_types}
            onChange={(e) => setFormData({ ...formData, product_types: e.target.value })}
            placeholder="Écrans, Batteries, Coques..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ville</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="postal_code">Code postal</Label>
            <Input
              id="postal_code"
              value={formData.postal_code}
              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minimum_order">Commande minimum (€)</Label>
            <Input
              id="minimum_order"
              type="number"
              value={formData.minimum_order}
              onChange={(e) => setFormData({ ...formData, minimum_order: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialties">Spécialités (séparées par des virgules)</Label>
          <Input
            id="specialties"
            value={formData.specialties}
            onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
            placeholder="Réparation, Formation, B2B..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_terms">Conditions de paiement</Label>
          <Input
            id="payment_terms"
            value={formData.payment_terms}
            onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
            placeholder="Comptant, 30 jours..."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="delivery_zones">Zones de livraison</Label>
            <Input
              id="delivery_zones"
              value={formData.delivery_zones}
              onChange={(e) => setFormData({ ...formData, delivery_zones: e.target.value })}
              placeholder="France, Europe..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery_times">Délais de livraison</Label>
            <Input
              id="delivery_times"
              value={formData.delivery_times}
              onChange={(e) => setFormData({ ...formData, delivery_times: e.target.value })}
              placeholder="24-48h..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery_costs">Coûts de livraison</Label>
            <Input
              id="delivery_costs"
              value={formData.delivery_costs}
              onChange={(e) => setFormData({ ...formData, delivery_costs: e.target.value })}
              placeholder="Gratuit dès 250€..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo_url">URL du logo</Label>
          <Input
            id="logo_url"
            value={formData.logo_url}
            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
            placeholder="https://exemple.com/logo.png"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="certification_labels">Certifications (séparées par des virgules)</Label>
          <Input
            id="certification_labels"
            value={formData.certification_labels}
            onChange={(e) => setFormData({ ...formData, certification_labels: e.target.value })}
            placeholder="ISO 9001, CE..."
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            {supplier ? 'Mettre à jour' : 'Créer'} le fournisseur
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      </form>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aperçu des données extraites</DialogTitle>
          </DialogHeader>
          
          {extractedData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Aperçu des données extraites</h3>
                <div className="text-sm text-muted-foreground">
                  Source : {urlToExtract || 'Contenu fourni'}
                </div>
              </div>
              
              {/* Logo preview */}
              {extractedData.logo_url && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <img 
                    src={extractedData.logo_url} 
                    alt="Logo" 
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="text-sm">✓ Logo trouvé</span>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={extractedData.name ? "text-green-600" : "text-red-500"}>
                  <strong>Nom:</strong> {extractedData.name || '❌ Non trouvé'}
                </div>
                <div className={extractedData.email ? "text-green-600" : "text-red-500"}>
                  <strong>Email:</strong> {extractedData.email || '❌ Non trouvé'}
                </div>
                <div className={extractedData.phone ? "text-green-600" : "text-red-500"}>
                  <strong>Téléphone:</strong> {extractedData.phone || '❌ Non trouvé'}
                </div>
                <div className={extractedData.website ? "text-green-600" : "text-red-500"}>
                  <strong>Site web:</strong> {extractedData.website || '❌ Non trouvé'}
                </div>
                <div className={extractedData.address_city ? "text-green-600" : "text-red-500"}>
                  <strong>Ville:</strong> {extractedData.address_city || '❌ Non trouvé'}
                </div>
                <div className={extractedData.minimum_order ? "text-green-600" : "text-orange-500"}>
                  <strong>Commande minimum:</strong> {extractedData.minimum_order ? `${extractedData.minimum_order}€` : '⚠️ Non spécifié'}
                </div>
              </div>
              
              {/* Delivery information */}
              {(extractedData.delivery_zones || extractedData.delivery_time || extractedData.delivery_cost) && (
                <div className="bg-blue-50 p-3 rounded">
                  <strong>Informations de livraison:</strong>
                  <ul className="mt-1 text-sm">
                    {extractedData.delivery_zones && (
                      <li>• Zones: {extractedData.delivery_zones}</li>
                    )}
                    {extractedData.delivery_time && (
                      <li>• Délais: {extractedData.delivery_time}</li>
                    )}
                    {extractedData.delivery_cost && (
                      <li>• Coûts: {extractedData.delivery_cost}</li>
                    )}
                  </ul>
                </div>
              )}
              
              {extractedData.description && (
                <div>
                  <strong>Description:</strong>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{extractedData.description}</p>
                </div>
              )}
              
              {extractedData.brands_sold && extractedData.brands_sold.length > 0 && (
                <div>
                  <strong>Marques ({extractedData.brands_sold.length}):</strong> 
                  <span className="text-sm text-muted-foreground ml-2">
                    {Array.isArray(extractedData.brands_sold) ? extractedData.brands_sold.slice(0, 5).join(', ') : extractedData.brands_sold}
                    {extractedData.brands_sold.length > 5 && '...'}
                  </span>
                </div>
              )}
              
              {extractedData.product_types && extractedData.product_types.length > 0 && (
                <div>
                  <strong>Types de produits ({extractedData.product_types.length}):</strong>
                  <span className="text-sm text-muted-foreground ml-2">
                    {Array.isArray(extractedData.product_types) ? extractedData.product_types.slice(0, 5).join(', ') : extractedData.product_types}
                    {extractedData.product_types.length > 5 && '...'}
                  </span>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleAutoComplete(extractedData)} className="flex-1">
                  Confirmer et intégrer les données
                </Button>
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};