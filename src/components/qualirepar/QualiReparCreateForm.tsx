import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQualiReparDossiers } from '@/hooks/useQualiReparDossiers';
import { useQualiReparEligibility } from '@/hooks/useQualiReparEligibility';
import { DossierCreationData } from '@/types/qualirepar';
import { Recycle, Upload, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface QualiReparCreateFormProps {
  onDossierCreated?: () => void;
  prefillData?: Partial<DossierCreationData>;
}

const QualiReparCreateForm: React.FC<QualiReparCreateFormProps> = ({
  onDossierCreated,
  prefillData = {}
}) => {
  const { createDossier, saving } = useQualiReparDossiers();
  const { checkEligibility, getEligibleCategories } = useQualiReparEligibility();
  
  const [formData, setFormData] = useState<DossierCreationData>({
    clientName: prefillData.clientName || '',
    clientEmail: prefillData.clientEmail || '',
    clientPhone: prefillData.clientPhone || '',
    clientAddress: prefillData.clientAddress || '',
    clientPostalCode: prefillData.clientPostalCode || '',
    clientCity: prefillData.clientCity || '',
    productCategory: prefillData.productCategory || '',
    productBrand: prefillData.productBrand || '',
    productModel: prefillData.productModel || '',
    productSerialNumber: prefillData.productSerialNumber || '',
    repairDescription: prefillData.repairDescription || '',
    repairCost: prefillData.repairCost || 0,
    repairDate: prefillData.repairDate || new Date().toISOString().split('T')[0],
    requestedBonusAmount: prefillData.requestedBonusAmount || 0,
    repairOrderId: prefillData.repairOrderId,
    posTransactionId: prefillData.posTransactionId
  });

  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  const categories = getEligibleCategories();

  const handleFieldChange = (field: keyof DossierCreationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Vérifier l'éligibilité quand les champs clés changent
    if (['productCategory', 'productBrand', 'productModel', 'repairCost'].includes(field)) {
      const newData = { ...formData, [field]: value };
      if (newData.productCategory && newData.productBrand && newData.productModel && newData.repairCost > 0) {
        const result = checkEligibility(
          newData.productCategory,
          newData.productBrand,
          newData.productModel,
          newData.repairCost
        );
        setEligibilityResult(result);
        if (result.isEligible) {
          setFormData(prev => ({ ...prev, requestedBonusAmount: result.maxBonusAmount || 0 }));
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eligibilityResult?.isEligible) {
      toast.error('Le produit n\'est pas éligible au bonus QualiRépar');
      return;
    }

    const dossier = await createDossier(formData);
    if (dossier) {
      toast.success('Dossier QualiRépar créé avec succès');
      onDossierCreated?.();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Recycle className="h-5 w-5 text-emerald-600" />
          Créer un dossier QualiRépar
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations client */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations client</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Nom complet *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleFieldChange('clientName', e.target.value)}
                  placeholder="Jean Dupont"
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">Email *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleFieldChange('clientEmail', e.target.value)}
                  placeholder="jean@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Téléphone</Label>
                <Input
                  id="clientPhone"
                  value={formData.clientPhone}
                  onChange={(e) => handleFieldChange('clientPhone', e.target.value)}
                  placeholder="01 23 45 67 89"
                />
              </div>
              <div>
                <Label htmlFor="clientAddress">Adresse *</Label>
                <Input
                  id="clientAddress"
                  value={formData.clientAddress}
                  onChange={(e) => handleFieldChange('clientAddress', e.target.value)}
                  placeholder="123 rue de la Paix"
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientPostalCode">Code postal *</Label>
                <Input
                  id="clientPostalCode"
                  value={formData.clientPostalCode}
                  onChange={(e) => handleFieldChange('clientPostalCode', e.target.value)}
                  placeholder="75001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientCity">Ville *</Label>
                <Input
                  id="clientCity"
                  value={formData.clientCity}
                  onChange={(e) => handleFieldChange('clientCity', e.target.value)}
                  placeholder="Paris"
                  required
                />
              </div>
            </div>
          </div>

          {/* Informations produit */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations produit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productCategory">Catégorie *</Label>
                <Select 
                  value={formData.productCategory} 
                  onValueChange={(value) => handleFieldChange('productCategory', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="productBrand">Marque *</Label>
                <Input
                  id="productBrand"
                  value={formData.productBrand}
                  onChange={(e) => handleFieldChange('productBrand', e.target.value)}
                  placeholder="Apple"
                  required
                />
              </div>
              <div>
                <Label htmlFor="productModel">Modèle *</Label>
                <Input
                  id="productModel"
                  value={formData.productModel}
                  onChange={(e) => handleFieldChange('productModel', e.target.value)}
                  placeholder="iPhone 14"
                  required
                />
              </div>
              <div>
                <Label htmlFor="productSerialNumber">Numéro de série</Label>
                <Input
                  id="productSerialNumber"
                  value={formData.productSerialNumber}
                  onChange={(e) => handleFieldChange('productSerialNumber', e.target.value)}
                  placeholder="A1234567890"
                />
              </div>
            </div>
          </div>

          {/* Détails réparation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Détails de la réparation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="repairCost">Coût de la réparation (€) *</Label>
                <Input
                  id="repairCost"
                  type="number"
                  step="0.01"
                  value={formData.repairCost}
                  onChange={(e) => handleFieldChange('repairCost', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="repairDate">Date de réparation *</Label>
                <Input
                  id="repairDate"
                  type="date"
                  value={formData.repairDate}
                  onChange={(e) => handleFieldChange('repairDate', e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="repairDescription">Description de la réparation *</Label>
                <Textarea
                  id="repairDescription"
                  value={formData.repairDescription}
                  onChange={(e) => handleFieldChange('repairDescription', e.target.value)}
                  placeholder="Remplacement de l'écran, batterie défectueuse..."
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>

          {/* Résultat d'éligibilité */}
          {eligibilityResult && (
            <div className={`p-4 rounded-lg border ${
              eligibilityResult.isEligible 
                ? 'bg-emerald-50 border-emerald-200' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-center gap-2">
                {eligibilityResult.isEligible ? (
                  <>
                    <Recycle className="h-5 w-5 text-emerald-600" />
                    <span className="font-semibold text-emerald-900">
                      ✅ Produit éligible au bonus QualiRépar !
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold text-orange-900">
                      ❌ Produit non éligible
                    </span>
                  </>
                )}
              </div>
              {eligibilityResult.isEligible ? (
                <p className="text-sm text-emerald-700 mt-1">
                  Montant du bonus : {eligibilityResult.maxBonusAmount}€ - 
                  Éco-organisme : {eligibilityResult.ecoOrganism}
                </p>
              ) : (
                <p className="text-sm text-orange-700 mt-1">
                  {eligibilityResult.reason}
                </p>
              )}
            </div>
          )}

          {/* Montant bonus */}
          {eligibilityResult?.isEligible && (
            <div>
              <Label htmlFor="requestedBonusAmount">Montant du bonus demandé (€)</Label>
              <Input
                id="requestedBonusAmount"
                type="number"
                step="0.01"
                value={formData.requestedBonusAmount}
                onChange={(e) => handleFieldChange('requestedBonusAmount', parseFloat(e.target.value) || 0)}
                max={eligibilityResult.maxBonusAmount}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum autorisé : {eligibilityResult.maxBonusAmount}€
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="submit"
              disabled={saving || !eligibilityResult?.isEligible}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? (
                <>Création en cours...</>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Créer le dossier
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QualiReparCreateForm;