import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ValidationRule {
  field: string;
  type: 'required' | 'email' | 'phone' | 'siret' | 'amount' | 'date' | 'length';
  message: string;
  params?: any;
}

interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
  warnings: { [key: string]: string };
}

export const useQualiReparValidation = () => {
  const [validating, setValidating] = useState(false);

  // Règles de validation pour les métadonnées QualiRépar
  const metadataRules: ValidationRule[] = [
    { field: 'client_name', type: 'required', message: 'Le nom du client est requis' },
    { field: 'client_name', type: 'length', message: 'Le nom doit contenir au moins 2 caractères', params: { min: 2 } },
    { field: 'client_email', type: 'required', message: 'L\'email du client est requis' },
    { field: 'client_email', type: 'email', message: 'Format d\'email invalide' },
    { field: 'client_address', type: 'required', message: 'L\'adresse du client est requise' },
    { field: 'client_postal_code', type: 'required', message: 'Le code postal est requis' },
    { field: 'client_city', type: 'required', message: 'La ville est requise' },
    { field: 'product_category', type: 'required', message: 'La catégorie de produit est requise' },
    { field: 'product_brand', type: 'required', message: 'La marque du produit est requise' },
    { field: 'product_model', type: 'required', message: 'Le modèle du produit est requis' },
    { field: 'repair_description', type: 'required', message: 'La description de la réparation est requise' },
    { field: 'repair_description', type: 'length', message: 'La description doit contenir au moins 10 caractères', params: { min: 10 } },
    { field: 'repair_cost', type: 'required', message: 'Le coût de réparation est requis' },
    { field: 'repair_cost', type: 'amount', message: 'Le coût doit être supérieur à 0', params: { min: 0.01 } },
    { field: 'repair_date', type: 'required', message: 'La date de réparation est requise' },
    { field: 'repair_date', type: 'date', message: 'La date de réparation ne peut pas être dans le futur' },
    { field: 'requested_bonus_amount', type: 'required', message: 'Le montant du bonus demandé est requis' },
    { field: 'requested_bonus_amount', type: 'amount', message: 'Le montant du bonus doit être supérieur à 0', params: { min: 0.01 } }
  ];

  const validateField = (value: any, rule: ValidationRule): string | null => {
    switch (rule.type) {
      case 'required':
        if (!value || (typeof value === 'string' && !value.trim())) {
          return rule.message;
        }
        break;

      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return rule.message;
        }
        break;

      case 'phone':
        if (value && !/^(?:\+33|0)[1-9](?:[0-9]{8})$/.test(value.replace(/\s/g, ''))) {
          return rule.message;
        }
        break;

      case 'siret':
        if (value && !validateSiret(value)) {
          return rule.message;
        }
        break;

      case 'amount':
        const numValue = parseFloat(value);
        if (value && (isNaN(numValue) || numValue < (rule.params?.min || 0))) {
          return rule.message;
        }
        break;

      case 'date':
        if (value) {
          const date = new Date(value);
          const today = new Date();
          today.setHours(23, 59, 59, 999); // Fin de journée
          if (date > today) {
            return rule.message;
          }
        }
        break;

      case 'length':
        if (value && typeof value === 'string') {
          if (rule.params?.min && value.length < rule.params.min) {
            return rule.message;
          }
          if (rule.params?.max && value.length > rule.params.max) {
            return rule.message;
          }
        }
        break;
    }

    return null;
  };

  const validateSiret = (siret: string): boolean => {
    if (!siret || siret.length !== 14) return false;
    
    const digits = siret.replace(/\s/g, '').split('').map(Number);
    if (digits.some(isNaN)) return false;

    let sum = 0;
    for (let i = 0; i < 14; i++) {
      let digit = digits[i];
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) {
          digit = Math.floor(digit / 10) + (digit % 10);
        }
      }
      sum += digit;
    }

    return sum % 10 === 0;
  };

  const validateMetadata = useCallback((data: any): ValidationResult => {
    const errors: { [key: string]: string } = {};
    const warnings: { [key: string]: string } = {};

    // Appliquer toutes les règles de validation
    metadataRules.forEach(rule => {
      const error = validateField(data[rule.field], rule);
      if (error) {
        errors[rule.field] = error;
      }
    });

    // Vérifications spéciales et avertissements
    if (data.repair_cost && data.requested_bonus_amount) {
      const repairCost = parseFloat(data.repair_cost);
      const bonusAmount = parseFloat(data.requested_bonus_amount);
      
      if (bonusAmount > repairCost) {
        warnings.requested_bonus_amount = 'Le bonus demandé est supérieur au coût de réparation';
      }
      
      if (bonusAmount > repairCost * 0.5) {
        warnings.requested_bonus_amount = 'Le bonus demandé représente plus de 50% du coût de réparation';
      }
    }

    // Vérifier la cohérence des dates
    if (data.repair_date) {
      const repairDate = new Date(data.repair_date);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      if (repairDate < sixMonthsAgo) {
        warnings.repair_date = 'La réparation date de plus de 6 mois, cela pourrait affecter l\'éligibilité';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  }, []);

  const validateEligibility = useCallback(async (data: any) => {
    setValidating(true);
    try {
      // Vérifier l'éligibilité via l'API/cache local
      const { data: eligibilityRules, error } = await supabase
        .from('qualirepar_eligibility_cache')
        .select('*')
        .eq('product_category', data.product_category)
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString().split('T')[0])
        .order('product_brand', { nullsLast: true })
        .order('product_model', { nullsLast: true });

      if (error) throw error;

      let bestMatch = null;
      let eligibilityScore = 0;

      // Trouver la règle la plus spécifique qui correspond
      eligibilityRules?.forEach(rule => {
        let score = 1; // Score de base pour la catégorie

        // Bonus pour correspondance de marque
        if (rule.product_brand && rule.product_brand.toLowerCase() === data.product_brand?.toLowerCase()) {
          score += 2;
        } else if (rule.product_brand && rule.product_brand.toLowerCase() !== data.product_brand?.toLowerCase()) {
          return; // Pas de correspondance, ignorer cette règle
        }

        // Bonus pour correspondance de modèle
        if (rule.product_model && rule.product_model.toLowerCase() === data.product_model?.toLowerCase()) {
          score += 3;
        } else if (rule.product_model && rule.product_model.toLowerCase() !== data.product_model?.toLowerCase()) {
          return; // Pas de correspondance, ignorer cette règle
        }

        // Vérifier le coût minimum
        if (rule.min_repair_cost && data.repair_cost < rule.min_repair_cost) {
          return; // Coût insuffisant
        }

        if (score > eligibilityScore) {
          eligibilityScore = score;
          bestMatch = rule;
        }
      });

      if (!bestMatch) {
        return {
          isEligible: false,
          reason: 'Aucune règle d\'éligibilité trouvée pour ce produit',
          maxBonusAmount: 0
        };
      }

      const isEligible = data.repair_cost >= (bestMatch.min_repair_cost || 0);
      const maxBonusAmount = Math.min(
        bestMatch.max_bonus_amount,
        data.repair_cost * 0.5 // Maximum 50% du coût de réparation
      );

      return {
        isEligible,
        reason: isEligible ? 'Produit éligible au bonus QualiRépar' : 'Coût de réparation insuffisant',
        maxBonusAmount,
        ecoOrganism: bestMatch.eco_organism,
        rule: bestMatch
      };

    } catch (error) {
      console.error('Error validating eligibility:', error);
      toast.error('Erreur lors de la vérification d\'éligibilité');
      return {
        isEligible: false,
        reason: 'Erreur lors de la vérification',
        maxBonusAmount: 0
      };
    } finally {
      setValidating(false);
    }
  }, []);

  const validateDocuments = useCallback((documents: any[]): ValidationResult => {
    const errors: { [key: string]: string } = {};
    const requiredDocs = ['FACTURE', 'BON_DEPOT', 'SERIALTAG'];
    
    const uploadedTypes = documents.map(doc => doc.official_document_type || doc.document_type);
    
    requiredDocs.forEach(docType => {
      if (!uploadedTypes.includes(docType)) {
        errors[docType] = `Document ${docType} requis`;
      }
    });

    // Vérifier la qualité des documents
    documents.forEach(doc => {
      if (doc.file_size && doc.file_size > 10 * 1024 * 1024) { // 10MB
        errors[doc.document_type] = 'Fichier trop volumineux (max 10MB)';
      }
      
      if (doc.ocr_confidence && doc.ocr_confidence < 0.7) {
        errors[doc.document_type] = 'Qualité du document insuffisante pour la lecture automatique';
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings: {}
    };
  }, []);

  return {
    validating,
    validateMetadata,
    validateEligibility,
    validateDocuments,
    validateSiret
  };
};