
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, ArrowUp } from 'lucide-react';

interface RepairerDashboardPlanCardProps {
  currentPlan: string;
  userEmail?: string;
  userId?: string;
  onUpgradePlan: () => void;
}

const RepairerDashboardPlanCard: React.FC<RepairerDashboardPlanCardProps> = ({
  currentPlan,
  userEmail,
  userId,
  onUpgradePlan
}) => {
  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'Basique';
      case 'premium':
        return 'Premium';
      case 'enterprise':
        return 'Enterprise';
      default:
        return 'Gratuit';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'border-l-blue-500';
      case 'premium':
        return 'border-l-purple-500';
      case 'enterprise':
        return 'border-l-yellow-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <Card className={`mb-6 border-l-4 ${getPlanColor(currentPlan)}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="h-6 w-6 text-gray-500" />
            <div>
              <h3 className="font-semibold text-gray-900">
                Plan actuel : {getPlanDisplayName(currentPlan)}
              </h3>
              <p className="text-sm text-gray-600">
                {currentPlan === 'free' 
                  ? 'Passez à un plan payant pour accéder à plus de fonctionnalités'
                  : 'Vous bénéficiez des fonctionnalités avancées'
                }
              </p>
              {userEmail === 'demo@demo.fr' && (
                <p className="text-xs text-blue-600 mt-1">
                  Debug: User ID = {userId} | Email = {userEmail} | Plan = {currentPlan}
                </p>
              )}
            </div>
          </div>
          {currentPlan === 'free' && (
            <Button onClick={onUpgradePlan} className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4" />
              Changer de plan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RepairerDashboardPlanCard;
