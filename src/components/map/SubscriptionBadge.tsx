
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
          icon: <Star className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} text-electric-blue`} />,
          bgColor: 'bg-electric-blue-light',
          textColor: 'text-electric-blue',
          label: 'Basic'
        };
      case 'premium':
        return {
          icon: <Crown className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} text-vibrant-orange`} />,
          bgColor: 'bg-vibrant-orange-light',
          textColor: 'text-vibrant-orange',
          label: 'Premium'
        };
      case 'enterprise':
        return {
          icon: <Zap className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} text-accent-foreground`} />,
          bgColor: 'bg-accent',
          textColor: 'text-accent-foreground',
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
