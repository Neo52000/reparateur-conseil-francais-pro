/**
 * Service centralisé pour la gestion des erreurs
 * Fournit des messages d'erreur contextuels et utiles
 */

interface ErrorDetail {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

/**
 * Service de gestion d'erreurs pour l'application
 * Centralise le formatage et la traduction des erreurs
 */
export class ErrorHandlingService {
  /**
   * Formate une erreur en message utilisateur compréhensible
   * @param error - L'erreur à formater (peut être de n'importe quel type)
   * @param context - Contexte optionnel pour personnaliser le message
   * @returns Message d'erreur formaté pour l'utilisateur
   */
  static formatError(error: any, context?: string): string {
    console.log('🔍 [ErrorHandlingService] Formatting error:', { 
      error, 
      context, 
      type: typeof error,
      errorKeys: error && typeof error === 'object' ? Object.keys(error) : 'N/A'
    });
    
    // Cas 1: Erreur null ou undefined
    if (!error) {
      return context ? `Erreur inconnue lors de ${context}` : 'Erreur inconnue';
    }

    // Cas 2: Erreur de type string
    if (typeof error === 'string') {
      return error;
    }

    // Cas 3: Erreur Supabase avec structure complète
    if (error && typeof error === 'object') {
      // Vérifier d'abord les erreurs HTTP spécifiques
      if (error.status === 404) {
        return 'Table ou ressource non trouvée. Vérifiez que la table existe et que vous avez les permissions nécessaires.';
      }
      
      if (error.status === 403 || error.status === 401) {
        return 'Accès refusé. Vous n\'avez pas les permissions nécessaires pour cette action.';
      }

      if (error.status >= 500) {
        return 'Erreur serveur temporaire. Veuillez réessayer dans quelques instants.';
      }

      // Erreur Supabase avec code PostgreSQL
      if (error.code) {
        const postgresError = this.handlePostgresError(error);
        if (postgresError) return postgresError;
      }

      // Erreur avec message
      if (error.message) {
        const messageError = this.handleMessageError(error.message, context);
        if (messageError) return messageError;
      }

      // Erreur de validation Supabase
      if (error.details) {
        return `Erreur de validation: ${error.details}`;
      }

      // Erreur réseau ou de connexion
      if (error.name === 'NetworkError' || error.name === 'TypeError') {
        return 'Problème de connexion. Veuillez vérifier votre connexion internet.';
      }

      // Erreur de fetch ou de réseau
      if (error.name === 'FetchError') {
        return 'Erreur de communication avec le serveur. Vérifiez votre connexion.';
      }
    }

    // Cas 4: Tentative de sérialisation sécurisée et logging détaillé
    try {
      if (typeof error === 'object' && error !== null) {
        // Log détaillé de l'erreur pour debugging
        console.group('🐛 [ErrorHandlingService] Detailed Error Analysis');
        console.log('Error type:', typeof error);
        console.log('Error constructor:', error.constructor?.name);
        console.log('Error prototype:', Object.getPrototypeOf(error));
        console.log('Own properties:', Object.getOwnPropertyNames(error));
        console.log('Enumerable properties:', Object.keys(error));
        
        // Essayer d'extraire toutes les propriétés
        const allProps: Record<string, any> = {};
        for (const prop of Object.getOwnPropertyNames(error)) {
          try {
            allProps[prop] = error[prop];
          } catch (e) {
            allProps[prop] = '[Propriété non accessible]';
          }
        }
        console.log('All properties:', allProps);
        console.groupEnd();

        // Si l'objet a une méthode toString personnalisée
        if (error.toString && error.toString !== Object.prototype.toString) {
          const stringified = error.toString();
          if (stringified !== '[object Object]') {
            return stringified;
          }
        }

        // Essayer de sérialiser en JSON avec replacer pour gérer les propriétés non énumérables
        const replacer = (key: string, value: any) => {
          if (value instanceof Error) {
            const errorObj: any = {};
            Object.getOwnPropertyNames(value).forEach(prop => {
              errorObj[prop] = value[prop];
            });
            return errorObj;
          }
          return value;
        };

        const jsonString = JSON.stringify(error, replacer, 2);
        if (jsonString && jsonString !== '{}' && jsonString !== 'null') {
          console.log('📝 [ErrorHandlingService] Serialized error:', jsonString);
          // Extraire le message principal au lieu d'afficher tout le JSON
          const parsedError = JSON.parse(jsonString);
          if (parsedError.message) {
            return `Erreur: ${parsedError.message}`;
          }
          return `Erreur technique: ${jsonString}`;
        }
      }
    } catch (serializationError) {
      console.warn('⚠️ [ErrorHandlingService] Failed to serialize error:', serializationError);
    }

    // Cas 5: Fallback ultime - extraire les propriétés importantes
    if (typeof error === 'object' && error !== null) {
      const errorProps = Object.getOwnPropertyNames(error);
      console.log('🔧 [ErrorHandlingService] Error properties:', errorProps);
      
      const importantProps = errorProps
        .filter(prop => ['message', 'code', 'details', 'hint', 'statusText', 'status'].includes(prop))
        .map(prop => {
          try {
            return `${prop}: ${error[prop]}`;
          } catch (e) {
            return `${prop}: [Non accessible]`;
          }
        })
        .join(', ');
      
      if (importantProps) {
        return `Erreur: ${importantProps}`;
      }

      // Essayer de récupérer au moins quelques propriétés standard
      const standardProps = ['name', 'message', 'stack', 'cause'];
      const availableProps = standardProps
        .filter(prop => prop in error)
        .map(prop => `${prop}: ${String(error[prop]).slice(0, 100)}`)
        .join(', ');

      if (availableProps) {
        return `Erreur: ${availableProps}`;
      }
    }

    // Cas 6: Dernier recours avec plus d'informations
    const contextMsg = context ? ` lors de ${context}` : '';
    console.error('💀 [ErrorHandlingService] Unhandled error format:', error);
    return `Erreur technique non identifiée${contextMsg}. Consultez la console pour plus de détails.`;
  }

  /**
   * Gère les erreurs PostgreSQL spécifiques
   * @param error - Erreur avec code PostgreSQL
   * @returns Message formaté ou null si non géré
   */
  private static handlePostgresError(error: ErrorDetail): string | null {
    switch (error.code) {
      case '23505': // unique_violation
        return 'Cette entrée existe déjà. Veuillez utiliser des valeurs uniques.';
      case '23502': // not_null_violation
        return 'Champs requis manquants. Veuillez remplir tous les champs obligatoires.';
      case '23503': // foreign_key_violation
        return 'Référence invalide. L\'élément référencé n\'existe pas.';
      case '42501': // insufficient_privilege
        return 'Permissions insuffisantes pour effectuer cette action.';
      case '42703': // undefined_column
        return 'Erreur de structure de données. Contactez l\'administrateur.';
      case '42P01': // undefined_table
        return 'Table non trouvée. Contactez l\'administrateur.';
      default:
        return null;
    }
  }

  /**
   * Gère les erreurs basées sur le message
   * @param message - Message d'erreur
   * @param context - Contexte optionnel
   * @returns Message formaté ou null si non géré
   */
  private static handleMessageError(message: string, context?: string): string | null {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('duplicate key')) {
      return 'Cette entrée existe déjà dans la base de données.';
    }
    
    if (lowerMessage.includes('permission denied')) {
      return 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
    }
    
    if (lowerMessage.includes('connection')) {
      return 'Problème de connexion à la base de données.';
    }
    
    if (lowerMessage.includes('timeout')) {
      return 'Délai d\'attente dépassé. Veuillez réessayer.';
    }
    
    if (lowerMessage.includes('network')) {
      return 'Erreur réseau. Vérifiez votre connexion internet.';
    }

    if (lowerMessage.includes('json')) {
      return 'Format de données invalide. Vérifiez les informations saisies.';
    }

    // Retourner le message original s'il est compréhensible
    if (message && !message.includes('[object Object]')) {
      return message;
    }

    return null;
  }

  /**
   * Valide les données d'un fournisseur
   * @param data - Données du fournisseur à valider
   * @returns Résultat de validation avec erreurs détaillées
   */
  static validateSupplierData(data: any): { isValid: boolean; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    
    // Validation du nom (requis)
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      errors.push({ field: 'name', message: 'Le nom du fournisseur est requis' });
    }
    
    // Validation de l'email (optionnel mais doit être valide si fourni)
    if (data.email && typeof data.email === 'string' && data.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        errors.push({ field: 'email', message: 'Format email invalide' });
      }
    }
    
    // Validation du site web (optionnel mais doit être valide si fourni)
    if (data.website && typeof data.website === 'string' && data.website.trim()) {
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(data.website.trim())) {
        errors.push({ field: 'website', message: 'URL invalide (doit commencer par http:// ou https://)' });
      }
    }
    
    // Validation du téléphone (optionnel mais doit être valide si fourni)
    if (data.phone && typeof data.phone === 'string' && data.phone.trim()) {
      const phoneRegex = /^[\d\s\+\-\(\)\.]+$/;
      if (!phoneRegex.test(data.phone.trim())) {
        errors.push({ field: 'phone', message: 'Format téléphone invalide' });
      }
    }

    // Validation de l'adresse (doit être un objet valide)
    if (data.address) {
      if (typeof data.address !== 'object' || data.address === null) {
        errors.push({ field: 'address', message: 'L\'adresse doit être un objet valide' });
      } else {
        // Validation des champs d'adresse si présents
        const addressFields = ['street', 'city', 'postal_code', 'country'];
        addressFields.forEach(field => {
          if (data.address[field] && typeof data.address[field] !== 'string') {
            errors.push({ field: `address.${field}`, message: `Le champ ${field} doit être une chaîne de caractères` });
          }
        });
      }
    }

    // Validation des informations de livraison
    if (data.delivery_info) {
      if (typeof data.delivery_info !== 'object' || data.delivery_info === null) {
        errors.push({ field: 'delivery_info', message: 'Les informations de livraison doivent être un objet valide' });
      } else {
        // Validation des zones de livraison
        if (data.delivery_info.zones && !Array.isArray(data.delivery_info.zones)) {
          errors.push({ field: 'delivery_info.zones', message: 'Les zones de livraison doivent être un tableau' });
        }
      }
    }

    // Validation des tableaux
    const arrayFields = ['brands_sold', 'product_types', 'specialties', 'certifications'];
    arrayFields.forEach(field => {
      if (data[field] && !Array.isArray(data[field])) {
        errors.push({ field, message: `Le champ ${field} doit être un tableau` });
      }
    });

    // Validation des booléens
    const booleanFields = ['is_verified', 'is_featured'];
    booleanFields.forEach(field => {
      if (data[field] !== undefined && typeof data[field] !== 'boolean') {
        errors.push({ field, message: `Le champ ${field} doit être un booléen` });
      }
    });

    // Validation du minimum_order
    if (data.minimum_order !== undefined && data.minimum_order !== null) {
      const num = Number(data.minimum_order);
      if (isNaN(num) || num < 0) {
        errors.push({ field: 'minimum_order', message: 'Le montant minimum de commande doit être un nombre positif' });
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Prépare les données du fournisseur pour l'envoi à Supabase
   * @param formData - Données du formulaire
   * @returns Données nettoyées et formatées
   */
  static prepareSupplierData(formData: any): any {
    console.log('🧹 [ErrorHandlingService] Preparing supplier data:', formData);
    
    const preparedData = {
      name: this.cleanString(formData.name),
      description: this.cleanString(formData.description) || '',
      email: this.cleanString(formData.email) || '',
      phone: this.cleanString(formData.phone) || '',
      website: this.cleanString(formData.website) || '',
      brands_sold: this.cleanStringArray(formData.brands_sold),
      product_types: this.cleanStringArray(formData.product_types),
      specialties: this.cleanStringArray(formData.specialties),
      certifications: this.cleanStringArray(formData.certifications),
      payment_terms: this.cleanString(formData.payment_terms) || '',
      minimum_order: this.cleanNumber(formData.minimum_order),
      address: this.cleanAddress(formData.address),
      delivery_info: this.cleanDeliveryInfo(formData.delivery_info),
      is_verified: Boolean(formData.is_verified),
      is_featured: Boolean(formData.is_featured),
      status: formData.status || 'active'
    };

    console.log('✨ [ErrorHandlingService] Prepared data:', preparedData);
    return preparedData;
  }

  /**
   * Nettoie une chaîne de caractères
   */
  private static cleanString(value: any): string | null {
    if (!value || typeof value !== 'string') return null;
    const cleaned = value.trim();
    return cleaned === '' ? null : cleaned;
  }

  /**
   * Nettoie un tableau de chaînes depuis une string séparée par des virgules
   */
  private static cleanStringArray(value: any): string[] {
    if (Array.isArray(value)) {
      return value.filter(item => item && typeof item === 'string').map(item => item.trim());
    }
    if (typeof value === 'string') {
      return value.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }

  /**
   * Nettoie un nombre
   */
  private static cleanNumber(value: any): number | null {
    if (value === '' || value === undefined || value === null) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  /**
   * Nettoie l'objet adresse
   */
  private static cleanAddress(address: any): object {
    if (!address || typeof address !== 'object') {
      return { street: '', city: '', postal_code: '', country: 'France' };
    }
    
    return {
      street: this.cleanString(address.street) || '',
      city: this.cleanString(address.city) || '',
      postal_code: this.cleanString(address.postal_code) || '',
      country: this.cleanString(address.country) || 'France'
    };
  }

  /**
   * Nettoie l'objet informations de livraison
   */
  private static cleanDeliveryInfo(deliveryInfo: any): object {
    if (!deliveryInfo || typeof deliveryInfo !== 'object') {
      return { standard: '', express: '', zones: [], cost: '' };
    }
    
    return {
      standard: this.cleanString(deliveryInfo.standard) || '',
      express: this.cleanString(deliveryInfo.express) || '',
      zones: Array.isArray(deliveryInfo.zones) ? deliveryInfo.zones : [],
      cost: this.cleanString(deliveryInfo.cost) || ''
    };
  }
}