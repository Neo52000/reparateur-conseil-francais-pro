
import React from 'react';
import { Crown, Star, Zap } from 'lucide-react';

interface SubscriptionBadgeProps {
  tier: string;
  size?: 'sm' | 'md';
}

const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({ tier, size = 'sm' }) => {
  const getBadgeInfo = (tier: string) => {
    switch (tier) {
      case 'basic':
        return {
          icon: <Star className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} text-blue-600`} />,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600',
          label: 'Basic'
        };
      case 'premium':
        return {
          icon: <Crown className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} text-purple-600`} />,
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-600',
          label: 'Premium'
        };
      case 'enterprise':
        return {
          icon: <Zap className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} text-yellow-600`} />,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-600',
          label: 'Enterprise'
        };
      default:
        return null;
    }
  };

  const badgeInfo = getBadgeInfo(tier);

  if (!badgeInfo) return null;

  return (
    <div className={`
      inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
      ${badgeInfo.bgColor} ${badgeInfo.textColor}
    `}>
      {badgeInfo.icon}
      <span>{badgeInfo.label}</span>
    </div>
  );
};

export default SubscriptionBadge;
