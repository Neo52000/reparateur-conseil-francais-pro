
import React from 'react';
import PlanCard from './PlanCard';

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
}

interface PlansGridProps {
  plans: Plan[];
  isYearly: boolean;
  currentPlan: string;
  loading: boolean;
  onSubscribe: (planId: string, selectedModules: { pos: boolean; ecommerce: boolean }, totalPrice: number) => void;
}

const PlansGrid: React.FC<PlansGridProps> = ({
  plans,
  isYearly,
  currentPlan,
  loading,
  onSubscribe
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isYearly={isYearly}
          currentPlan={currentPlan}
          loading={loading}
          onSubscribe={onSubscribe}
        />
      ))}
    </div>
  );
};

export default PlansGrid;
