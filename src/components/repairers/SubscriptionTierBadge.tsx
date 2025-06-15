
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getTierInfo } from '@/utils/subscriptionTiers';

interface SubscriptionTierBadgeProps {
  tier: string;
}

const SubscriptionTierBadge: React.FC<SubscriptionTierBadgeProps> = ({ tier }) => {
  const tierInfo = getTierInfo(tier);

  return (
    <div className="flex items-center space-x-2">
      {tierInfo.icon}
      <Badge className={tierInfo.color}>
        {tierInfo.name}
      </Badge>
    </div>
  );
};

export default SubscriptionTierBadge;
