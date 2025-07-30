import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { QualiReparV3NewClaimRequest } from '@/types/qualirepar';
import { toast } from 'sonner';

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  canProceed: boolean;
  validatedData?: Partial<QualiReparV3NewClaimRequest>;
}

interface RepairerValidation {
  isValid: boolean;
  repairerId: string;
  companyName?: string;
  siret?: string;
  isActive: boolean;
}

interface ProductCatalog {
  ProductID: string;
  BrandID: string;
  ProductName: string;
  Category: string;
  SupportedRepairTypes: string[];
  MaxBonusAmount: number;
}

export const useQualiReparV3Validation = () => {
  const [validating, setValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<ValidationResult | null>(null);

  // Validation des codes IRIS (codes de réparation)
  const validateIrisCode = useCallback(async (irisCode: string): Promise<ValidationError[]> => {
    const errors: ValidationError[] = [];
    
    if (!irisCode) return errors;

    // Format IRIS: 4 chiffres
    if (!/^[0-9]{4}$/.test(irisCode)) {
      errors.push({
        field: 'Product.IrisCode',
        message: 'Le code IRIS doit contenir exactement 4 chiffres',
        severity: 'error',
        code: 'IRIS_INVALID_FORMAT'
      });
      return errors;
    }

    try {
      // Vérifier contre le référentiel des codes IRIS
      const { data: irisData, error } = await supabase
        .from('qualirepar_iris_codes')
        .select('*')
        .eq('code', irisCode)
        .eq('is_active', true)
        .single();

      if (error || !irisData) {
        errors.push({
          field: 'Product.IrisCode',
          message: `Code IRIS ${irisCode} non reconnu dans le référentiel`,
          severity: 'error',
          code: 'IRIS_NOT_FOUND'
        });
      }
    } catch (error) {
      console.error('Erreur validation IRIS:', error);
      errors.push({
        field: 'Product.IrisCode',
        message: 'Erreur lors de la validation du code IRIS',
        severity: 'warning',
        code: 'IRIS_VALIDATION_ERROR'
      });
    }

    return errors;
  }, []);

  // Validation du SIRET réparateur
  const validateSiret = useCallback((siret: string): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    if (!siret) return errors;

    // Supprimer les espaces et vérifier le format
    const cleanSiret = siret.replace(/\s/g, '');
    
    if (!/^[0-9]{14}$/.test(cleanSiret)) {
      errors.push({
        field: 'RepairerId',
        message: 'Le SIRET doit contenir exactement 14 chiffres',
        severity: 'error',
        code: 'SIRET_INVALID_FORMAT'
      });
      return errors;
    }

    // Algorithme de validation SIRET (basé sur l'algorithme de Luhn modifié)
    const siren = cleanSiret.substring(0, 9);
    const nic = cleanSiret.substring(9, 14);
    
    // Validation Siren (9 premiers chiffres)
    let sum = 0;
    for (let i = 0; i < siren.length; i++) {
      let digit = parseInt(siren[i]);
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    
    if (sum % 10 !== 0) {
      errors.push({
        field: 'RepairerId',
        message: 'Numéro SIRET invalide (erreur de contrôle)',
        severity: 'error',
        code: 'SIRET_INVALID_CHECKSUM'
      });
    }

    return errors;
  }, []);

  // Validation du réparateur QualiRépar
  const validateRepairer = useCallback(async (repairerId: string): Promise<RepairerValidation> => {
    try {
      // Vérifier dans notre base des réparateurs autorisés
      const { data: repairerData, error } = await supabase
        .from('qualirepar_auth_repairers')
        .select('*')
        .eq('repairer_id', repairerId)
        .eq('is_active', true)
        .single();

      if (error || !repairerData) {
        return {
          isValid: false,
          repairerId,
          isActive: false
        };
      }

      // Valider le SIRET si présent
      const siretErrors = validateSiret(repairerData.siret || '');
      
      return {
        isValid: siretErrors.length === 0,
        repairerId,
        companyName: repairerData.company_name,
        siret: repairerData.siret,
        isActive: repairerData.is_active
      };

    } catch (error) {
      console.error('Erreur validation réparateur:', error);
      return {
        isValid: false,
        repairerId,
        isActive: false
      };
    }
  }, [validateSiret]);

  // Validation des données produit
  const validateProduct = useCallback(async (product: QualiReparV3NewClaimRequest['Product']): Promise<ValidationError[]> => {
    const errors: ValidationError[] = [];

    // Validation des champs obligatoires
    if (!product.ProductID) {
      errors.push({
        field: 'Product.ProductID',
        message: 'L\'identifiant produit est obligatoire',
        severity: 'error',
        code: 'PRODUCT_ID_MISSING'
      });
    }

    if (!product.BrandID) {
      errors.push({
        field: 'Product.BrandID',
        message: 'L\'identifiant marque est obligatoire',
        severity: 'error',
        code: 'BRAND_ID_MISSING'
      });
    }

    if (!product.ProductIdentificationNumber) {
      errors.push({
        field: 'Product.ProductIdentificationNumber',
        message: 'Le numéro d\'identification produit est obligatoire',
        severity: 'error',
        code: 'PRODUCT_SERIAL_MISSING'
      });
    }

    // Validation contre le catalogue produit
    if (product.ProductID && product.BrandID) {
      try {
        const { data: catalogData, error } = await supabase
          .from('qualirepar_catalog')
          .select('*')
          .eq('product_id', product.ProductID)
          .eq('brand_id', product.BrandID)
          .eq('is_active', true)
          .single();

        if (error || !catalogData) {
          errors.push({
            field: 'Product.ProductID',
            message: 'Produit non trouvé dans le catalogue QualiRépar',
            severity: 'error',
            code: 'PRODUCT_NOT_IN_CATALOG'
          });
        } else {
          // Vérifier si le type de réparation est supporté
          if (product.RepairTypeCode && catalogData.supported_repair_types) {
            const supportedTypes = catalogData.supported_repair_types as string[];
            if (!supportedTypes.includes(product.RepairTypeCode)) {
              errors.push({
                field: 'Product.RepairTypeCode',
                message: `Type de réparation ${product.RepairTypeCode} non supporté pour ce produit`,
                severity: 'error',
                code: 'REPAIR_TYPE_NOT_SUPPORTED'
              });
            }
          }
        }
      } catch (error) {
        console.error('Erreur validation catalogue:', error);
        errors.push({
          field: 'Product',
          message: 'Erreur lors de la validation du catalogue produit',
          severity: 'warning',
          code: 'CATALOG_VALIDATION_ERROR'
        });
      }
    }

    // Validation du code IRIS
    if (product.IrisCode) {
      const irisErrors = await validateIrisCode(product.IrisCode);
      errors.push(...irisErrors);
    }

    return errors;
  }, [validateIrisCode]);

  // Validation des montants et cohérence financière
  const validateFinancialData = useCallback((bill: QualiReparV3NewClaimRequest['Bill'], spareParts?: QualiReparV3NewClaimRequest['SpareParts']): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Vérification des montants obligatoires
    if (!bill.TotalAmountInclVAT || bill.TotalAmountInclVAT.amount <= 0) {
      errors.push({
        field: 'Bill.TotalAmountInclVAT',
        message: 'Le montant total TTC doit être supérieur à 0',
        severity: 'error',
        code: 'TOTAL_AMOUNT_INVALID'
      });
    }

    if (!bill.AmountCovered || bill.AmountCovered.amount < 0) {
      errors.push({
        field: 'Bill.AmountCovered',
        message: 'Le montant couvert ne peut pas être négatif',
        severity: 'error',
        code: 'COVERED_AMOUNT_INVALID'
      });
    }

    // Vérification de cohérence
    if (bill.TotalAmountInclVAT && bill.AmountCovered) {
      if (bill.AmountCovered.amount > bill.TotalAmountInclVAT.amount) {
        errors.push({
          field: 'Bill.AmountCovered',
          message: 'Le montant couvert ne peut pas être supérieur au montant total',
          severity: 'error',
          code: 'COVERED_AMOUNT_EXCEEDS_TOTAL'
        });
      }
    }

    // Validation des pièces détachées si présentes
    if (spareParts) {
      const totalSpareParts = (spareParts.NewSparePartsAmount || 0) + 
                            (spareParts.SecondHandSparePartsAmount || 0) + 
                            (spareParts.PiecSparePartsAmount || 0);

      if (bill.SparePartsCost && Math.abs(totalSpareParts - bill.SparePartsCost.amount) > 0.01) {
        errors.push({
          field: 'SpareParts',
          message: 'Incohérence entre le coût des pièces détaillé et le total',
          severity: 'warning',
          code: 'SPARE_PARTS_AMOUNT_MISMATCH'
        });
      }
    }

    // Validation des devises
    const expectedCurrency = 'EUR';
    if (bill.TotalAmountInclVAT.currency !== expectedCurrency) {
      errors.push({
        field: 'Bill.TotalAmountInclVAT.currency',
        message: `La devise doit être ${expectedCurrency}`,
        severity: 'error',
        code: 'INVALID_CURRENCY'
      });
    }

    return errors;
  }, []);

  // Validation complète d'une demande V3
  const validateV3Claim = useCallback(async (claimData: QualiReparV3NewClaimRequest): Promise<ValidationResult> => {
    setValidating(true);
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    try {
      // 1. Validation des dates
      const repairDate = new Date(claimData.RepairDate);
      const now = new Date();
      const maxPastDate = new Date();
      maxPastDate.setMonth(now.getMonth() - 6);

      if (repairDate > now) {
        errors.push({
          field: 'RepairDate',
          message: 'La date de réparation ne peut pas être dans le futur',
          severity: 'error',
          code: 'REPAIR_DATE_FUTURE'
        });
      }

      if (repairDate < maxPastDate) {
        warnings.push({
          field: 'RepairDate',
          message: 'Date de réparation antérieure à 6 mois',
          severity: 'warning',
          code: 'REPAIR_DATE_OLD'
        });
      }

      // 2. Validation du réparateur
      const repairerValidation = await validateRepairer(claimData.RepairerId);
      if (!repairerValidation.isValid) {
        errors.push({
          field: 'RepairerId',
          message: 'Réparateur non autorisé ou non actif dans QualiRépar',
          severity: 'error',
          code: 'REPAIRER_NOT_AUTHORIZED'
        });
      }

      // 3. Validation du lieu de réparation
      if (!claimData.RepairPlaceID) {
        errors.push({
          field: 'RepairPlaceID',
          message: 'L\'identifiant du lieu de réparation est obligatoire',
          severity: 'error',
          code: 'REPAIR_PLACE_MISSING'
        });
      }

      // 4. Validation du produit
      const productErrors = await validateProduct(claimData.Product);
      errors.push(...productErrors);

      // 5. Validation des données client
      if (!claimData.Customer.Email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(claimData.Customer.Email)) {
        errors.push({
          field: 'Customer.Email',
          message: 'Email client invalide',
          severity: 'error',
          code: 'CUSTOMER_EMAIL_INVALID'
        });
      }

      if (!claimData.Customer.PostalCode || !/^[0-9]{5}$/.test(claimData.Customer.PostalCode)) {
        errors.push({
          field: 'Customer.PostalCode',
          message: 'Code postal client invalide (5 chiffres requis)',
          severity: 'error',
          code: 'CUSTOMER_POSTAL_CODE_INVALID'
        });
      }

      // 6. Validation financière
      const financialErrors = validateFinancialData(claimData.Bill, claimData.SpareParts);
      errors.push(...financialErrors);

      // 7. Validation croisée éco-organisme / produit
      // (À implémenter selon les règles métier spécifiques)

      const result: ValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
        canProceed: errors.length === 0,
        validatedData: errors.length === 0 ? claimData : undefined
      };

      setLastValidation(result);
      return result;

    } catch (error) {
      console.error('Erreur validation V3:', error);
      const result: ValidationResult = {
        isValid: false,
        errors: [{
          field: 'general',
          message: 'Erreur lors de la validation complète',
          severity: 'error',
          code: 'VALIDATION_SYSTEM_ERROR'
        }],
        warnings: [],
        canProceed: false
      };

      setLastValidation(result);
      return result;
    } finally {
      setValidating(false);
    }
  }, [validateRepairer, validateProduct, validateFinancialData]);

  // Validation incrémentale par champ
  const validateFieldV3 = useCallback(async (field: string, value: any, context?: Partial<QualiReparV3NewClaimRequest>): Promise<ValidationError[]> => {
    const errors: ValidationError[] = [];

    switch (field) {
      case 'RepairerId':
        const repairerValidation = await validateRepairer(value);
        if (!repairerValidation.isValid) {
          errors.push({
            field,
            message: 'Réparateur non autorisé',
            severity: 'error',
            code: 'REPAIRER_INVALID'
          });
        }
        break;

      case 'Product.IrisCode':
        const irisErrors = await validateIrisCode(value);
        errors.push(...irisErrors);
        break;

      case 'Customer.Email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push({
            field,
            message: 'Format email invalide',
            severity: 'error',
            code: 'EMAIL_FORMAT_INVALID'
          });
        }
        break;

      case 'Customer.PostalCode':
        if (value && !/^[0-9]{5}$/.test(value)) {
          errors.push({
            field,
            message: 'Code postal invalide',
            severity: 'error',
            code: 'POSTAL_CODE_INVALID'
          });
        }
        break;
    }

    return errors;
  }, [validateRepairer, validateIrisCode]);

  return {
    validating,
    lastValidation,
    validateV3Claim,
    validateFieldV3,
    validateRepairer,
    validateProduct,
    validateIrisCode,
    validateSiret,
    validateFinancialData
  };
};