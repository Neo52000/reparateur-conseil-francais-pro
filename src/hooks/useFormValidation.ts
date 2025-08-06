import { useState, useEffect, useCallback } from 'react';

interface UseFormValidationOptions<T> {
  validationRules: Record<keyof T, (value: any) => string | null>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface FormValidationReturn<T> {
  errors: Record<keyof T, string | null>;
  isValid: boolean;
  validate: (field?: keyof T) => boolean;
  clearErrors: (field?: keyof T) => void;
  setFieldError: (field: keyof T, error: string | null) => void;
}

/**
 * Hook pour la validation de formulaires en temps réel
 * Optimisé pour les performances avec validation granulaire
 */
export function useFormValidation<T extends Record<string, any>>(
  formData: T,
  options: UseFormValidationOptions<T>
): FormValidationReturn<T> {
  const [errors, setErrors] = useState<Record<keyof T, string | null>>({} as Record<keyof T, string | null>);
  const { validationRules, validateOnChange = false, validateOnBlur = true } = options;

  // Validation d'un champ spécifique
  const validateField = useCallback((field: keyof T): boolean => {
    const rule = validationRules[field];
    if (!rule) return true;

    const error = rule(formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  }, [formData, validationRules]);

  // Validation de tous les champs
  const validateAll = useCallback((): boolean => {
    const newErrors: Record<keyof T, string | null> = {} as Record<keyof T, string | null>;
    let isFormValid = true;

    for (const field in validationRules) {
      const rule = validationRules[field];
      const error = rule(formData[field]);
      newErrors[field] = error;
      if (error) isFormValid = false;
    }

    setErrors(newErrors);
    return isFormValid;
  }, [formData, validationRules]);

  // Fonction de validation générale
  const validate = useCallback((field?: keyof T): boolean => {
    if (field) {
      return validateField(field);
    }
    return validateAll();
  }, [validateField, validateAll]);

  // Effacer les erreurs
  const clearErrors = useCallback((field?: keyof T) => {
    if (field) {
      setErrors(prev => ({ ...prev, [field]: null }));
    } else {
      setErrors({} as Record<keyof T, string | null>);
    }
  }, []);

  // Définir une erreur spécifique
  const setFieldError = useCallback((field: keyof T, error: string | null) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  // Validation automatique lors du changement
  useEffect(() => {
    if (validateOnChange) {
      validateAll();
    }
  }, [formData, validateOnChange, validateAll]);

  // Calculer si le formulaire est valide
  const isValid = Object.values(errors).every(error => !error);

  return {
    errors,
    isValid,
    validate,
    clearErrors,
    setFieldError
  };
}