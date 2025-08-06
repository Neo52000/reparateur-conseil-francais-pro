import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useQualiReparV3Validation } from '@/hooks/useQualiReparV3Validation';
import { QualiReparV3NewClaimRequest } from '@/types/qualirepar';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

const QualiReparV3ValidatorDemo: React.FC = () => {
  const { validating, validateV3Claim, validateFieldV3 } = useQualiReparV3Validation();
  const [validationResult, setValidationResult] = useState<any>(null);
  const [fieldValidation, setFieldValidation] = useState<any>({});
  
  // Données d'exemple pour la validation
  const [claimData, setClaimData] = useState<QualiReparV3NewClaimRequest>({
    RepairDate: '2024-01-15',
    RepairPlaceID: 'PLACE001',
    RepairerId: '12345678901234', // SIRET example
    Product: {
      ProductID: 'IPH001',
      BrandID: 'APPLE',
      ProductIdentificationNumber: 'ABC123456789',
      IrisCode: '1001', // Remplacement écran smartphone
      RepairTypeCode: 'SCREEN_REPAIR'
    },
    Customer: {
      Title: 'Mr',
      FirstName: 'Jean',
      LastName: 'Dupont',
      Email: 'jean.dupont@example.com',
      PhoneNumber: '0123456789',
      StreetLine1: '123 Rue de la Paix',
      PostalCode: '75001',
      City: 'Paris',
      Country: 'FR'
    },
    Bill: {
      TotalAmountInclVAT: {
        amount: 150.00,
        currency: 'EUR'
      },
      AmountCovered: {
        amount: 25.00,
        currency: 'EUR'
      }
    }
  });

  const handleValidateComplete = async () => {
    const result = await validateV3Claim(claimData);
    setValidationResult(result);
  };

  const handleValidateField = async (field: string, value: any) => {
    const errors = await validateFieldV3(field, value, claimData);
    setFieldValidation(prev => ({
      ...prev,
      [field]: errors
    }));
  };

  const updateClaimData = (path: string, value: any) => {
    const keys = path.split('.');
    const newData = { ...claimData };
    let current: any = newData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setClaimData(newData);
    
    // Validation en temps réel
    handleValidateField(path, value);
  };

  const getFieldValidationIcon = (field: string) => {
    const errors = fieldValidation[field];
    if (!errors) return null;
    
    if (errors.length === 0) return <CheckCircle className="h-4 w-4 text-green-500" />;
    
    const hasErrors = errors.some((e: any) => e.severity === 'error');
    const hasWarnings = errors.some((e: any) => e.severity === 'warning');
    
    if (hasErrors) return <XCircle className="h-4 w-4 text-red-500" />;
    if (hasWarnings) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Démo Validation QualiRépar V3</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informations réparateur */}
          <div className="space-y-2">
            <Label>Réparateur (SIRET)</Label>
            <div className="flex items-center gap-2">
              <Input
                value={claimData.RepairerId}
                onChange={(e) => updateClaimData('RepairerId', e.target.value)}
                placeholder="14 chiffres SIRET"
              />
              {getFieldValidationIcon('RepairerId')}
            </div>
          </div>

          {/* Date de réparation */}
          <div className="space-y-2">
            <Label>Date de réparation</Label>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={claimData.RepairDate}
                onChange={(e) => updateClaimData('RepairDate', e.target.value)}
              />
              {getFieldValidationIcon('RepairDate')}
            </div>
          </div>

          {/* Code IRIS */}
          <div className="space-y-2">
            <Label>Code IRIS</Label>
            <div className="flex items-center gap-2">
              <Input
                value={claimData.Product.IrisCode || ''}
                onChange={(e) => updateClaimData('Product.IrisCode', e.target.value)}
                placeholder="4 chiffres (ex: 1001)"
              />
              {getFieldValidationIcon('Product.IrisCode')}
            </div>
          </div>

          {/* Email client */}
          <div className="space-y-2">
            <Label>Email client</Label>
            <div className="flex items-center gap-2">
              <Input
                type="email"
                value={claimData.Customer.Email}
                onChange={(e) => updateClaimData('Customer.Email', e.target.value)}
                placeholder="email@example.com"
              />
              {getFieldValidationIcon('Customer.Email')}
            </div>
          </div>

          {/* Code postal */}
          <div className="space-y-2">
            <Label>Code postal</Label>
            <div className="flex items-center gap-2">
              <Input
                value={claimData.Customer.PostalCode}
                onChange={(e) => updateClaimData('Customer.PostalCode', e.target.value)}
                placeholder="75001"
              />
              {getFieldValidationIcon('Customer.PostalCode')}
            </div>
          </div>

          {/* Montants */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Montant total (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={claimData.Bill.TotalAmountInclVAT.amount}
                onChange={(e) => updateClaimData('Bill.TotalAmountInclVAT.amount', parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Bonus demandé (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={claimData.Bill.AmountCovered.amount}
                onChange={(e) => updateClaimData('Bill.AmountCovered.amount', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <Button 
            onClick={handleValidateComplete} 
            disabled={validating} 
            className="w-full"
          >
            {validating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Valider la demande complète
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📊 Résultats de validation</CardTitle>
        </CardHeader>
        <CardContent>
          {validationResult ? (
            <div className="space-y-4">
              {/* Statut global */}
              <div className="flex items-center gap-2">
                {validationResult.isValid ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Validation réussie
                    </Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <Badge variant="destructive">
                      Validation échouée
                    </Badge>
                  </>
                )}
              </div>

              {/* Erreurs */}
              {validationResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-700">❌ Erreurs ({validationResult.errors.length})</h4>
                  <div className="space-y-1">
                    {validationResult.errors.map((error: any, index: number) => (
                      <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                        <div className="font-medium">{error.field}</div>
                        <div className="text-red-700">{error.message}</div>
                        {error.code && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {error.code}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Avertissements */}
              {validationResult.warnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-yellow-700">⚠️ Avertissements ({validationResult.warnings.length})</h4>
                  <div className="space-y-1">
                    {validationResult.warnings.map((warning: any, index: number) => (
                      <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                        <div className="font-medium">{warning.field}</div>
                        <div className="text-yellow-700">{warning.message}</div>
                        {warning.code && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {warning.code}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Données validées */}
              {validationResult.isValid && validationResult.validatedData && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-700">✅ Données validées</h4>
                  <Textarea
                    readOnly
                    value={JSON.stringify(validationResult.validatedData, null, 2)}
                    className="h-32 text-xs"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Lancez une validation pour voir les résultats
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QualiReparV3ValidatorDemo;