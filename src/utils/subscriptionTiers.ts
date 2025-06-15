
import { Crown, Star, Zap } from 'lucide-react';

export interface TierInfo {
  name: string;
  color: string;
  icon: React.ReactNode | null;
}

export const getTierInfo = (tier: string): TierInfo => {
  switch (tier) {
    case 'free':
      return { name: 'Gratuit', color: 'bg-gray-100 text-gray-800', icon: null };
    case 'basic':
      return { name: 'Basique', color: 'bg-blue-100 text-blue-800', icon: <Star className="h-4 w-4" /> };
    case 'premium':
      return { name: 'Premium', color: 'bg-purple-100 text-purple-800', icon: <Zap className="h-4 w-4" /> };
    case 'enterprise':
      return { name: 'Enterprise', color: 'bg-yellow-100 text-yellow-800', icon: <Crown className="h-4 w-4" /> };
    default:
      return { name: 'Inconnu', color: 'bg-gray-100 text-gray-800', icon: null };
  }
};
