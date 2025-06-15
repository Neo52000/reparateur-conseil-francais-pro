
import { RepairerDB } from '@/hooks/useRepairers';

export interface DisplayInfo {
  address: string;
  phone: string;
  email: string;
  showQuoteButton: boolean;
  showContactInfo: boolean;
  showClaimBanner: boolean;
}

export const getDisplayInfo = (repairer: RepairerDB, subscriptionTier = 'free'): DisplayInfo => {
  const isBasicOrHigher = ['basic', 'premium', 'enterprise'].includes(subscriptionTier);
  const isPremiumOrHigher = ['premium', 'enterprise'].includes(subscriptionTier);
  
  return {
    address: isBasicOrHigher ? repairer.address : `${repairer.city} (adresse masquée)`,
    phone: isBasicOrHigher ? repairer.phone : '•••••••••••',
    email: isBasicOrHigher ? repairer.email : '•••••@••••••',
    showQuoteButton: isPremiumOrHigher,
    showContactInfo: isBasicOrHigher,
    showClaimBanner: subscriptionTier === 'free'
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
