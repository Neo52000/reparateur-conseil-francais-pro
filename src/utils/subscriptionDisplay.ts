
import { Repairer } from '@/types/repairer';

export interface DisplayInfo {
  address: string;
  phone: string;
  email: string;
  showQuoteButton: boolean;
  showContactInfo: boolean;
  showClaimBanner: boolean;
}

export const getDisplayInfo = (repairer: Repairer, subscriptionTier = 'free'): DisplayInfo => {
  const isBasicOrHigher = ['basic', 'premium', 'enterprise'].includes(subscriptionTier);
  const isPremiumOrHigher = ['premium', 'enterprise'].includes(subscriptionTier);
  const isFree = subscriptionTier === 'free';
  
  return {
    // Pour les comptes gratuits, masquer complètement l'adresse précise
    address: isFree ? `${repairer.city} (adresse masquée - revendiquez votre fiche)` 
             : isBasicOrHigher ? repairer.address : `${repairer.city} (adresse masquée)`,
    
    // Pour les comptes gratuits, masquer complètement le téléphone
    phone: isFree ? 'Téléphone masqué - revendiquez votre fiche' 
           : isBasicOrHigher ? (repairer.phone || '') : '•••••••••••',
    
    // Pour les comptes gratuits, masquer complètement l'email
    email: isFree ? 'Email masqué - revendiquez votre fiche'
           : isBasicOrHigher ? (repairer.email || '') : '•••••@••••••',
    
    // Pour les comptes gratuits, aucun bouton de devis
    showQuoteButton: isFree ? false : isPremiumOrHigher,
    
    // Pour les comptes gratuits, aucune info de contact
    showContactInfo: isFree ? false : isBasicOrHigher,
    
    // Afficher le banner de revendication pour les comptes gratuits
    showClaimBanner: isFree
  };
};

export const getTierBadge = (tier: string) => {
  switch (tier) {
    case 'basic':
      return { variant: 'outline' as const, className: 'text-blue-600 border-blue-600', label: 'Basique' };
    case 'premium':
      return { variant: 'outline' as const, className: 'text-purple-600 border-purple-600', label: 'Premium' };
    case 'enterprise':
      return { variant: 'outline' as const, className: 'text-yellow-600 border-yellow-600', label: 'Enterprise' };
    default:
      return null;
  }
};
