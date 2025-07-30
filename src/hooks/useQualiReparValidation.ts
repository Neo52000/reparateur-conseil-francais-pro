import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { QualiReparDossier } from '@/types/qualirepar';
import { toast } from 'sonner';

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  canProceed: boolean;
}

export const useQualiReparValidation = () => {
  const [validating, setValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<ValidationResult | null>(null);

  const validateDossier = useCallback(async (dossier: Partial<QualiReparDossier>): Promise<ValidationResult> => {
    setValidating(true);
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    try {
      // Validation des champs obligatoires
      if (!dossier.client_email) {
        errors.push({
          field: 'client_email',
          message: 'L\'email du client est obligatoire',
          severity: 'error'
        });
      }

      if (!dossier.client_address) {
        errors.push({
          field: 'client_address',
          message: 'L\'adresse du client est obligatoire',
          severity: 'error'
        });
      }

      if (!dossier.product_category) {
        errors.push({
          field: 'product_category',
          message: 'La catégorie de produit est obligatoire',
          severity: 'error'
        });
      }

      if (!dossier.repair_cost || dossier.repair_cost <= 0) {
        errors.push({
          field: 'repair_cost',
          message: 'Le coût de réparation doit être supérieur à 0',
          severity: 'error'
        });
      }

      if (!dossier.requested_bonus_amount || dossier.requested_bonus_amount <= 0) {
        errors.push({
          field: 'requested_bonus_amount',
          message: 'Le montant du bonus demandé doit être supérieur à 0',
          severity: 'error'
        });
      }

      // Validation des montants
      if (dossier.repair_cost && dossier.requested_bonus_amount) {
        if (dossier.requested_bonus_amount > dossier.repair_cost) {
          errors.push({
            field: 'requested_bonus_amount',
            message: 'Le bonus demandé ne peut pas être supérieur au coût de réparation',
            severity: 'error'
          });
        }
      }

      // Validation de la date de réparation
      if (dossier.repair_date) {
        const repairDate = new Date(dossier.repair_date);
        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);

        if (repairDate > now) {
          errors.push({
            field: 'repair_date',
            message: 'La date de réparation ne peut pas être dans le futur',
            severity: 'error'
          });
        }

        if (repairDate < sixMonthsAgo) {
          warnings.push({
            field: 'repair_date',
            message: 'La date de réparation est antérieure à 6 mois',
            severity: 'warning'
          });
        }
      }

      // Validation de l'email
      if (dossier.client_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dossier.client_email)) {
        errors.push({
          field: 'client_email',
          message: 'Format d\'email invalide',
          severity: 'error'
        });
      }

      // Validation du téléphone (optionnel mais si présent doit être valide)
      if (dossier.client_phone && !/^[0-9\s\-\+\(\)]{10,}$/.test(dossier.client_phone)) {
        warnings.push({
          field: 'client_phone',
          message: 'Format de téléphone potentiellement invalide',
          severity: 'warning'
        });
      }

      // Validation du code postal
      if (dossier.client_postal_code && !/^[0-9]{5}$/.test(dossier.client_postal_code)) {
        errors.push({
          field: 'client_postal_code',
          message: 'Le code postal doit contenir 5 chiffres',
          severity: 'error'
        });
      }

      // Validation croisée avec les règles d'éligibilité
      if (dossier.product_category && dossier.requested_bonus_amount) {
        const { data: eligibilityRules, error } = await supabase
          .from('qualirepar_eligibility_cache')
          .select('*')
          .eq('product_category', dossier.product_category)
          .eq('is_active', true)
          .gte('valid_until', new Date().toISOString().split('T')[0])
          .order('created_at', { ascending: false })
          .order('updated_at', { ascending: false });

        if (error) throw error;

        if (eligibilityRules && eligibilityRules.length > 0) {
          const applicableRule = eligibilityRules.find(rule => 
            (!rule.product_brand || rule.product_brand === dossier.product_brand) &&
            (!rule.product_model || rule.product_model === dossier.product_model) &&
            (!rule.min_repair_cost || dossier.repair_cost! >= rule.min_repair_cost)
          );

          if (!applicableRule) {
            warnings.push({
              field: 'product_category',
              message: 'Aucune règle d\'éligibilité trouvée pour ce produit',
              severity: 'warning'
            });
          } else if (dossier.requested_bonus_amount > applicableRule.max_bonus_amount) {
            errors.push({
              field: 'requested_bonus_amount',
              message: `Le bonus maximum pour ce produit est de ${applicableRule.max_bonus_amount}€`,
              severity: 'error'
            });
          }
        }
      }

      const result: ValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
        canProceed: errors.length === 0
      };

      setLastValidation(result);
      return result;

    } catch (error) {
      console.error('Validation error:', error);
      const result: ValidationResult = {
        isValid: false,
        errors: [{
          field: 'general',
          message: 'Erreur lors de la validation',
          severity: 'error'
        }],
        warnings: [],
        canProceed: false
      };

      setLastValidation(result);
      return result;
    } finally {
      setValidating(false);
    }
  }, []);

  const validateField = useCallback(async (field: string, value: any, context?: Partial<QualiReparDossier>): Promise<ValidationError[]> => {
    const errors: ValidationError[] = [];

    switch (field) {
      case 'client_email':
        if (!value) {
          errors.push({
            field,
            message: 'L\'email est obligatoire',
            severity: 'error'
          });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push({
            field,
            message: 'Format d\'email invalide',
            severity: 'error'
          });
        }
        break;

      case 'repair_cost':
        if (!value || value <= 0) {
          errors.push({
            field,
            message: 'Le coût de réparation doit être supérieur à 0',
            severity: 'error'
          });
        }
        break;

      case 'requested_bonus_amount':
        if (!value || value <= 0) {
          errors.push({
            field,
            message: 'Le montant du bonus doit être supérieur à 0',
            severity: 'error'
          });
        } else if (context?.repair_cost && value > context.repair_cost) {
          errors.push({
            field,
            message: 'Le bonus ne peut pas être supérieur au coût de réparation',
            severity: 'error'
          });
        }
        break;

      case 'repair_date':
        if (value) {
          const date = new Date(value);
          const now = new Date();
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(now.getMonth() - 6);

          if (date > now) {
            errors.push({
              field,
              message: 'La date ne peut pas être dans le futur',
              severity: 'error'
            });
          } else if (date < sixMonthsAgo) {
            errors.push({
              field,
              message: 'La date est antérieure à 6 mois',
              severity: 'warning'
            });
          }
        }
        break;

      case 'client_postal_code':
        if (value && !/^[0-9]{5}$/.test(value)) {
          errors.push({
            field,
            message: 'Le code postal doit contenir 5 chiffres',
            severity: 'error'
          });
        }
        break;
    }

    return errors;
  }, []);

  const checkEligibility = useCallback(async (dossier: Partial<QualiReparDossier>) => {
    if (!dossier.product_category) {
      return { isEligible: false, reason: 'Catégorie de produit manquante' };
    }

    try {
      const { data: rules, error } = await supabase
        .from('qualirepar_eligibility_cache')
        .select('*')
        .eq('product_category', dossier.product_category)
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      if (!rules || rules.length === 0) {
        return { isEligible: false, reason: 'Aucune règle d\'éligibilité trouvée' };
      }

      const applicableRule = rules.find(rule => 
        (!rule.product_brand || rule.product_brand === dossier.product_brand) &&
        (!rule.product_model || rule.product_model === dossier.product_model) &&
        (!rule.min_repair_cost || (dossier.repair_cost && dossier.repair_cost >= rule.min_repair_cost))
      );

      if (!applicableRule) {
        return { isEligible: false, reason: 'Critères d\'éligibilité non remplis' };
      }

      return {
        isEligible: true,
        rule: applicableRule,
        maxBonusAmount: applicableRule.max_bonus_amount,
        ecoOrganism: applicableRule.eco_organism
      };

    } catch (error) {
      console.error('Eligibility check error:', error);
      return { isEligible: false, reason: 'Erreur lors de la vérification' };
    }
  }, []);

  return {
    validating,
    lastValidation,
    validateDossier,
    validateField,
    checkEligibility
  };
};