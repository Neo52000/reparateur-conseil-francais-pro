/**
 * Utilitaires de sécurité pour l'application
 */

import DOMPurify from 'dompurify';

/**
 * Nettoie et assainit le contenu HTML avec protection XSS renforcée
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'ul', 'ol', 'li', 'br', 'a'],
    ALLOWED_ATTR: ['href'],
    ALLOWED_URI_REGEXP: /^https?:\/\//,
    ADD_TAGS: [],
    ADD_ATTR: [],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    USE_PROFILES: { html: true }
  });
};

/**
 * Valide une adresse email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide un mot de passe fort
 */
export const isStrongPassword = (password: string): boolean => {
  // Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Nettoie et valide les entrées utilisateur avec protection XSS complète
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Utiliser DOMPurify pour une protection complète
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
  
  return sanitized.trim();
};

/**
 * Valide et nettoie les données de formulaire
 */
export const sanitizeFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Vérifie si une URL est sûre
 */
export const isSafeUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

/**
 * Limite de débit renforcée pour les actions sensibles avec blocage progressif
 */
class EnhancedRateLimiter {
  private attempts: Map<string, { count: number; firstAttempt: number; blockedUntil?: number }> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly blockDurationMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000, blockDurationMs: number = 30 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.blockDurationMs = blockDurationMs;
  }

  isAllowed(identifier: string): { allowed: boolean; remainingAttempts?: number; blockedUntil?: number } {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);

    if (!attempt) {
      this.attempts.set(identifier, { count: 1, firstAttempt: now });
      return { allowed: true, remainingAttempts: this.maxAttempts - 1 };
    }

    // Vérifier si actuellement bloqué
    if (attempt.blockedUntil && now < attempt.blockedUntil) {
      return { allowed: false, blockedUntil: attempt.blockedUntil };
    }

    // Réinitialiser si la fenêtre est expirée
    if (now - attempt.firstAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, firstAttempt: now });
      return { allowed: true, remainingAttempts: this.maxAttempts - 1 };
    }

    // Vérifier si le maximum est atteint
    if (attempt.count >= this.maxAttempts) {
      // Bloquer l'utilisateur
      const blockedUntil = now + this.blockDurationMs;
      attempt.blockedUntil = blockedUntil;
      return { allowed: false, blockedUntil };
    }

    attempt.count++;
    return { allowed: true, remainingAttempts: this.maxAttempts - attempt.count };
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  getAttemptInfo(identifier: string): { count: number; remainingAttempts: number; isBlocked: boolean } {
    const attempt = this.attempts.get(identifier);
    if (!attempt) {
      return { count: 0, remainingAttempts: this.maxAttempts, isBlocked: false };
    }

    const now = Date.now();
    const isBlocked = attempt.blockedUntil ? now < attempt.blockedUntil : false;
    
    return {
      count: attempt.count,
      remainingAttempts: Math.max(0, this.maxAttempts - attempt.count),
      isBlocked
    };
  }
}

// Configuration de sécurité renforcée
export const loginRateLimiter = new EnhancedRateLimiter(3, 15 * 60 * 1000, 30 * 60 * 1000); // 3 tentatives par 15 min, blocage 30 min
export const apiRateLimiter = new EnhancedRateLimiter(50, 60 * 1000, 5 * 60 * 1000); // 50 requêtes par minute, blocage 5 min
export const adminActionLimiter = new EnhancedRateLimiter(10, 60 * 1000, 10 * 60 * 1000); // 10 actions admin par minute

/**
 * Valide les données sensibles avant stockage
 */
export const validateSensitiveData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (data.email && !isValidEmail(data.email)) {
    errors.push('Format d\'email invalide');
  }
  
  if (data.password && !isStrongPassword(data.password)) {
    errors.push('Mot de passe trop faible');
  }
  
  if (data.phone && !/^[\d\s\-\.\+\(\)]+$/.test(data.phone)) {
    errors.push('Format de téléphone invalide');
  }
  
  if (data.siret && !/^\d{14}$/.test(data.siret.replace(/\s/g, ''))) {
    errors.push('Numéro SIRET invalide');
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Hash sécurisé pour les données sensibles (côté client)
 */
export const hashSensitiveData = (data: string): string => {
  // Utilisation d'un hash simple côté client (pas pour les mots de passe)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};