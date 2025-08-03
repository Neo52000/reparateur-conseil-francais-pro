import CryptoJS from 'crypto-js';

interface SecureData {
  encrypted: string;
  iv: string;
  timestamp: number;
}

interface ValidationRule {
  field: string;
  type: 'required' | 'email' | 'number' | 'positive' | 'length' | 'pattern';
  value?: any;
  message: string;
}

class SecurityService {
  private readonly encryptionKey: string;
  private readonly sessionKey: string;

  constructor() {
    // Générer une clé de session unique
    this.sessionKey = this.generateSessionKey();
    // Clé de chiffrement basée sur des données du navigateur (empreinte)
    this.encryptionKey = this.generateEncryptionKey();
  }

  // Chiffrement local des données sensibles
  encryptData(data: any): SecureData {
    const dataString = JSON.stringify(data);
    const iv = CryptoJS.lib.WordArray.random(16);
    
    const encrypted = CryptoJS.AES.encrypt(dataString, this.encryptionKey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return {
      encrypted: encrypted.toString(),
      iv: iv.toString(),
      timestamp: Date.now()
    };
  }

  // Déchiffrement des données
  decryptData(secureData: SecureData): any {
    try {
      const decrypted = CryptoJS.AES.decrypt(secureData.encrypted, this.encryptionKey, {
        iv: CryptoJS.enc.Hex.parse(secureData.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }

  // Validation des données POS
  validatePOSData(data: any, rules: ValidationRule[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = data[rule.field];

      switch (rule.type) {
        case 'required':
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors.push(rule.message);
          }
          break;

        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (value && !emailRegex.test(value)) {
            errors.push(rule.message);
          }
          break;

        case 'number':
          if (value && isNaN(Number(value))) {
            errors.push(rule.message);
          }
          break;

        case 'positive':
          if (value && Number(value) <= 0) {
            errors.push(rule.message);
          }
          break;

        case 'length':
          if (value && value.length !== rule.value) {
            errors.push(rule.message);
          }
          break;

        case 'pattern':
          if (value && !rule.value.test(value)) {
            errors.push(rule.message);
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Règles de validation communes pour le POS
  getTransactionValidationRules(): ValidationRule[] {
    return [
      { field: 'amount', type: 'required', message: 'Le montant est requis' },
      { field: 'amount', type: 'positive', message: 'Le montant doit être positif' },
      { field: 'paymentMethod', type: 'required', message: 'Le mode de paiement est requis' },
      { field: 'items', type: 'required', message: 'Au moins un article est requis' }
    ];
  }

  getCustomerValidationRules(): ValidationRule[] {
    return [
      { field: 'name', type: 'required', message: 'Le nom est requis' },
      { field: 'email', type: 'email', message: 'Email invalide' },
      { field: 'phone', type: 'pattern', value: /^[0-9+\-\s()]+$/, message: 'Numéro de téléphone invalide' }
    ];
  }

  // Sécurisation des sessions POS
  createSecureSession(userId: string, terminalId: string): string {
    const sessionData = {
      userId,
      terminalId,
      timestamp: Date.now(),
      random: Math.random().toString(36)
    };

    const token = CryptoJS.HmacSHA256(JSON.stringify(sessionData), this.sessionKey).toString();
    return `${Buffer.from(JSON.stringify(sessionData)).toString('base64')}.${token}`;
  }

  validateSession(sessionToken: string): { isValid: boolean; data?: any } {
    try {
      const [dataB64, signature] = sessionToken.split('.');
      const sessionData = JSON.parse(Buffer.from(dataB64, 'base64').toString());
      
      const expectedSignature = CryptoJS.HmacSHA256(JSON.stringify(sessionData), this.sessionKey).toString();
      
      if (signature !== expectedSignature) {
        return { isValid: false };
      }

      // Vérifier l'expiration (24h)
      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - sessionData.timestamp > maxAge) {
        return { isValid: false };
      }

      return { isValid: true, data: sessionData };
    } catch (error) {
      return { isValid: false };
    }
  }

  // Audit trail sécurisé
  createAuditEntry(action: string, userId: string, data?: any): string {
    const auditData = {
      action,
      userId,
      timestamp: Date.now(),
      data: data ? this.hashSensitiveData(data) : null,
      integrity: this.generateIntegrityHash(action, userId, Date.now())
    };

    return JSON.stringify(auditData);
  }

  // Hashage des données sensibles pour l'audit
  private hashSensitiveData(data: any): any {
    const sensitiveFields = ['cardNumber', 'cvv', 'pin', 'password'];
    const hashedData = { ...data };

    sensitiveFields.forEach(field => {
      if (hashedData[field]) {
        hashedData[field] = CryptoJS.SHA256(hashedData[field]).toString().substring(0, 8) + '...';
      }
    });

    return hashedData;
  }

  // Génération d'empreinte de navigateur pour clé de chiffrement
  private generateEncryptionKey(): string {
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      'pos-secure-key-v1'
    ].join('|');

    return CryptoJS.SHA256(fingerprint).toString();
  }

  private generateSessionKey(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  private generateIntegrityHash(action: string, userId: string, timestamp: number): string {
    return CryptoJS.HmacSHA256(`${action}:${userId}:${timestamp}`, this.encryptionKey).toString();
  }

  // Nettoyage sécurisé des données sensibles
  secureCleanup() {
    // Nettoyer les variables sensibles
    if ((window as any).securityService) {
      delete (window as any).securityService;
    }
    
    // Effacer le localStorage sensible
    const sensitivePrefixes = ['pos_session_', 'pos_secure_', 'pos_temp_'];
    Object.keys(localStorage).forEach(key => {
      if (sensitivePrefixes.some(prefix => key.startsWith(prefix))) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const securityService = new SecurityService();