import { useState, useCallback } from 'react';
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

    // Validation basique contre une liste de codes connus
    const validCodes = ['1001', '1002', '1003', '1004', '1005', '2001', '2002', '3001', '3002', '3003'];
    if (!validCodes.includes(irisCode)) {
      errors.push({
        field: 'Product.IrisCode',
        message: `Code IRIS ${irisCode} non reconnu`,
        severity: 'warning',
        code: 'IRIS_NOT_FOUND'
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

  // Validation du réparateur QualiRépar (version simplifiée)
  const validateRepairer = useCallback(async (repairerId: string): Promise<RepairerValidation> => {
    // Pour l'instant, validation basique en attendant que la base soit disponible
    if (!repairerId || repairerId.length < 5) {
      return {
        isValid: false,
        repairerId,
        isActive: false
      };
    }

    // Validation SIRET si c'est un SIRET
    if (/^[0-9]{14}$/.test(repairerId.replace(/\s/g, ''))) {
      const siretErrors = validateSiret(repairerId);
      return {
        isValid: siretErrors.length === 0,
        repairerId,
        siret: repairerId,
        isActive: siretErrors.length === 0
      };
    }

    // Sinon, validation basique de l'ID
    return {
      isValid: true,
      repairerId,
      isActive: true
    };
  }, [validateSiret]);

  // Validation des données produit (version simplifiée)
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

    // Validation du code IRIS
    if (product.IrisCode) {
      const irisErrors = await validateIrisCode(product.IrisCode);
      errors.push(...irisErrors);
    }

    // Validation basique des IDs (doivent être numériques ou alphanumériques)
    if (product.ProductID && !/^[A-Z0-9]{3,10}$/i.test(product.ProductID)) {
      errors.push({
        field: 'Product.ProductID',
        message: 'L\'identifiant produit doit contenir 3 à 10 caractères alphanumériques',
        severity: 'warning',
        code: 'PRODUCT_ID_FORMAT'
      });
    }

    if (product.BrandID && !/^[A-Z0-9]{2,5}$/i.test(product.BrandID)) {
      errors.push({
        field: 'Product.BrandID',
        message: 'L\'identifiant marque doit contenir 2 à 5 caractères alphanumériques',
        severity: 'warning',
        code: 'BRAND_ID_FORMAT'
      });
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

    // Validation des montants limites QualiRépar
    if (bill.TotalAmountInclVAT && bill.TotalAmountInclVAT.amount > 1000) {
      errors.push({
        field: 'Bill.TotalAmountInclVAT',
        message: 'Le montant de réparation semble élevé, vérifiez la cohérence',
        severity: 'warning',
        code: 'AMOUNT_HIGH'
      });
    }

    if (bill.AmountCovered && bill.AmountCovered.amount > 50) {
      errors.push({
        field: 'Bill.AmountCovered',
        message: 'Le bonus demandé semble élevé pour QualiRépar',
        severity: 'warning',
        code: 'BONUS_HIGH'
      });
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
          message: 'Réparateur non autorisé ou format invalide',
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

      if (!claimData.Customer.FirstName || claimData.Customer.FirstName.length < 2) {
        errors.push({
          field: 'Customer.FirstName',
          message: 'Le prénom client est requis (minimum 2 caractères)',
          severity: 'error',
          code: 'CUSTOMER_FIRSTNAME_INVALID'
        });
      }

      if (!claimData.Customer.LastName || claimData.Customer.LastName.length < 2) {
        errors.push({
          field: 'Customer.LastName',
          message: 'Le nom client est requis (minimum 2 caractères)',
          severity: 'error',
          code: 'CUSTOMER_LASTNAME_INVALID'
        });
      }

      // 6. Validation financière
      const financialErrors = validateFinancialData(claimData.Bill, claimData.SpareParts);
      errors.push(...financialErrors);

      // 7. Validation du téléphone client
      if (claimData.Customer.PhoneNumber && !/^[0-9\s\-\+\(\)]{10,}$/.test(claimData.Customer.PhoneNumber)) {
        warnings.push({
          field: 'Customer.PhoneNumber',
          message: 'Format de téléphone potentiellement invalide',
          severity: 'warning',
          code: 'CUSTOMER_PHONE_FORMAT'
        });
      }

      // Séparer les erreurs et warnings
      const allErrors = errors.filter(e => e.severity === 'error');
      const allWarnings = [...warnings, ...errors.filter(e => e.severity === 'warning')];

      const result: ValidationResult = {
        isValid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings,
        canProceed: allErrors.length === 0,
        validatedData: allErrors.length === 0 ? claimData : undefined
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
            message: 'Réparateur non autorisé ou format invalide',
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

      case 'RepairDate':
        if (value) {
          const date = new Date(value);
          const now = new Date();
          const maxPast = new Date();
          maxPast.setMonth(now.getMonth() - 6);

          if (date > now) {
            errors.push({
              field,
              message: 'La date ne peut pas être dans le futur',
              severity: 'error',
              code: 'DATE_FUTURE'
            });
          } else if (date < maxPast) {
            errors.push({
              field,
              message: 'Date antérieure à 6 mois',
              severity: 'warning',
              code: 'DATE_OLD'
            });
          }
        }
        break;
    }

    return errors;
  }, [validateRepairer, validateIrisCode]);

  // Nouvelle fonction de validation business simplifiée
  const validateBusinessData = useCallback(async (data: {
    siret: string;
    irisCode?: string;
    estimatedCost: number;
  }): Promise<ValidationResult> => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Validation SIRET
    const siretErrors = validateSiret(data.siret);
    errors.push(...siretErrors);

    // Validation code IRIS si fourni
    if (data.irisCode) {
      const irisErrors = await validateIrisCode(data.irisCode);
      errors.push(...irisErrors);
    }

    // Validation montant
    if (data.estimatedCost <= 0) {
      errors.push({
        field: 'estimatedCost',
        message: 'Le coût estimé doit être supérieur à 0',
        severity: 'error',
        code: 'COST_INVALID'
      });
    }

    if (data.estimatedCost > 1000) {
      warnings.push({
        field: 'estimatedCost',
        message: 'Coût élevé, vérifiez la cohérence',
        severity: 'warning',
        code: 'COST_HIGH'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      canProceed: errors.length === 0
    };
  }, [validateSiret, validateIrisCode]);

  return {
    validating,
    lastValidation,
    validateBusinessData,
    validateV3Claim,
    validateFieldV3,
    validateRepairer,
    validateProduct,
    validateIrisCode,
    validateSiret,
    validateFinancialData
  };
};