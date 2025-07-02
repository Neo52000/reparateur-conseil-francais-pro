/**
 * Utilitaires de validation pour l'application
 */

import { logger } from './logger';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validation des emails
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('L\'email est requis');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Format d\'email invalide');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validation des numéros de téléphone français
 */
export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!phone) {
    errors.push('Le numéro de téléphone est requis');
  } else {
    // Nettoyage du numéro
    const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
    
    // Formats acceptés: 0123456789, +33123456789, etc.
    if (!/^(\+33[1-9]\d{8}|0[1-9]\d{8})$/.test(cleanPhone)) {
      errors.push('Format de téléphone français invalide');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validation des codes postaux français
 */
export const validatePostalCode = (postalCode: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!postalCode) {
    errors.push('Le code postal est requis');
  } else if (!/^\d{5}$/.test(postalCode)) {
    errors.push('Le code postal doit contenir 5 chiffres');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validation des coordonnées géographiques
 */
export const validateCoordinates = (lat?: number, lng?: number): ValidationResult => {
  const errors: string[] = [];
  
  if (lat === undefined || lng === undefined) {
    errors.push('Les coordonnées sont requises');
  } else {
    if (lat < -90 || lat > 90) {
      errors.push('Latitude invalide (doit être entre -90 et 90)');
    }
    if (lng < -180 || lng > 180) {
      errors.push('Longitude invalide (doit être entre -180 et 180)');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validation des données de réparateur
 */
export interface RepairerData {
  name: string;
  email: string;
  phone: string;
  city: string;
  postal_code: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export const validateRepairerData = (data: Partial<RepairerData>): ValidationResult => {
  const errors: string[] = [];
  
  // Validation du nom
  if (!data.name?.trim()) {
    errors.push('Le nom est requis');
  } else if (data.name.trim().length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }
  
  // Validation de l'email
  const emailValidation = validateEmail(data.email || '');
  errors.push(...emailValidation.errors);
  
  // Validation du téléphone
  const phoneValidation = validatePhone(data.phone || '');
  errors.push(...phoneValidation.errors);
  
  // Validation de la ville
  if (!data.city?.trim()) {
    errors.push('La ville est requise');
  }
  
  // Validation du code postal
  const postalValidation = validatePostalCode(data.postal_code || '');
  errors.push(...postalValidation.errors);
  
  // Validation de l'adresse
  if (!data.address?.trim()) {
    errors.push('L\'adresse est requise');
  }
  
  // Validation des coordonnées si présentes
  if (data.latitude !== undefined || data.longitude !== undefined) {
    const coordsValidation = validateCoordinates(data.latitude, data.longitude);
    errors.push(...coordsValidation.errors);
  }
  
  const result = {
    isValid: errors.length === 0,
    errors
  };
  
  if (!result.isValid) {
    logger.warn('Validation des données réparateur échouée:', { errors, data });
  }
  
  return result;
};

/**
 * Validation des filtres de recherche
 */
export interface SearchFilters {
  services?: string[];
  brands?: string[];
  priceRange?: [number, number];
  distance?: number;
  minRating?: number;
  city?: string;
  postalCode?: string;
}

export const validateSearchFilters = (filters: SearchFilters): ValidationResult => {
  const errors: string[] = [];
  
  // Validation de la fourchette de prix
  if (filters.priceRange) {
    const [min, max] = filters.priceRange;
    if (min < 0 || max < 0) {
      errors.push('Les prix ne peuvent pas être négatifs');
    }
    if (min > max) {
      errors.push('Le prix minimum ne peut pas être supérieur au prix maximum');
    }
  }
  
  // Validation de la distance
  if (filters.distance !== undefined) {
    if (filters.distance < 0 || filters.distance > 100) {
      errors.push('La distance doit être entre 0 et 100 km');
    }
  }
  
  // Validation de la note minimale
  if (filters.minRating !== undefined) {
    if (filters.minRating < 0 || filters.minRating > 5) {
      errors.push('La note doit être entre 0 et 5');
    }
  }
  
  // Validation du code postal si présent
  if (filters.postalCode) {
    const postalValidation = validatePostalCode(filters.postalCode);
    errors.push(...postalValidation.errors);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize les données d'entrée
 */
export const sanitizeString = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Supprime les balises HTML basiques
    .replace(/\s+/g, ' '); // Normalise les espaces
};

/**
 * Validation générique d'un objet avec des règles personnalisées
 */
export type ValidationRule<T> = {
  field: keyof T;
  validate: (value: any) => string | null;
  required?: boolean;
};

export const validateWithRules = <T>(
  data: T,
  rules: ValidationRule<T>[]
): ValidationResult => {
  const errors: string[] = [];
  
  for (const rule of rules) {
    const value = data[rule.field];
    
    // Vérification des champs requis
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${String(rule.field)} est requis`);
      continue;
    }
    
    // Application de la règle de validation
    if (value !== undefined && value !== null && value !== '') {
      const error = rule.validate(value);
      if (error) {
        errors.push(error);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};