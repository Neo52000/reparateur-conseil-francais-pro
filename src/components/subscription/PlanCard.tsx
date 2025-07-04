
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown, CreditCard, ShoppingCart } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
}

interface PlanCardProps {
  plan: Plan;
  isYearly: boolean;
  currentPlan: string;
  loading: boolean;
  onSubscribe: (planId: string) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isYearly,
  currentPlan,
  loading,
  onSubscribe
}) => {
  const getIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'gratuit': return null;
      case 'basique': return <Star className="h-5 w-5 text-blue-600" />;
      case 'premium': return <Zap className="h-5 w-5 text-purple-600" />;
      case 'enterprise': return <Crown className="h-5 w-5 text-yellow-600" />;
      default: return null;
    }
  };

  const getCardStyle = (planName: string) => {
    const isCurrentPlan = planName.toLowerCase() === currentPlan;
    const baseStyle = isCurrentPlan ? 'border-2 border-blue-500 bg-blue-50' : '';
    
    switch (planName.toLowerCase()) {
      case 'premium': return `${baseStyle} border-purple-200 shadow-lg`;
      case 'enterprise': return `${baseStyle} border-yellow-200 shadow-lg`;
      default: return baseStyle;
    }
  };

  const getButtonText = (planName: string, price: number) => {
    const isCurrentPlan = planName.toLowerCase() === currentPlan;
    
    if (isCurrentPlan) return 'Plan actuel';
    if (price === 0) return 'Plan gratuit';
    return 'Choisir ce plan';
  };

  const isCurrentUserPlan = (planName: string) => {
    return planName.toLowerCase() === currentPlan;
  };

  return (
    <Card className={`relative ${getCardStyle(plan.name)} hover:shadow-xl transition-shadow`}>
      {plan.name === 'Premium' && !isCurrentUserPlan(plan.name) && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-purple-600 text-white">
            Populaire
          </Badge>
        </div>
      )}

      {isCurrentUserPlan(plan.name) && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-600 text-white">
            Plan actuel
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          {getIcon(plan.name)}
          <CardTitle className="ml-2 text-xl">{plan.name}</CardTitle>
        </div>
        
        <div className="space-y-1">
          <div className="text-3xl font-bold text-gray-900">
            {isYearly ? plan.price_yearly.toFixed(2) : plan.price_monthly.toFixed(2)}€
          </div>
          <div className="text-sm text-gray-500">
            {plan.price_monthly === 0 ? 'Gratuit pour toujours' : 
             isYearly ? 'par an' : 'par mois'}
          </div>
          {isYearly && plan.price_monthly > 0 && (
            <div className="text-xs text-green-600">
              Économisez {((plan.price_monthly * 12) - plan.price_yearly).toFixed(2)}€/an
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Section modules additionnels optionnels */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-gray-700">Modules optionnels</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Au choix</span>
          </div>
          
          <ul className="space-y-3">
            <li className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start">
                <CreditCard className="h-4 w-4 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Module POS</span>
                  <p className="text-xs text-gray-500">Point de vente & inventaire</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-purple-600">+49,90€</span>
                <p className="text-xs text-gray-500">/mois</p>
              </div>
            </li>
            <li className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start">
                <ShoppingCart className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Module E-commerce</span>
                  <p className="text-xs text-gray-500">Boutique en ligne intégrée</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-blue-600">+89,90€</span>
                <p className="text-xs text-gray-500">/mois</p>
              </div>
            </li>
          </ul>
          
          <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-center text-blue-700 font-medium">
              💡 Modules optionnels - Ajoutez-les selon vos besoins
            </p>
            <p className="text-xs text-center text-blue-600 mt-1">
              Facturation séparée - Activables à tout moment
            </p>
          </div>
        </div>

        <Button
          className="w-full"
          variant={plan.name === 'Premium' && !isCurrentUserPlan(plan.name) ? 'default' : 'outline'}
          onClick={() => onSubscribe(plan.id)}
          disabled={loading || isCurrentUserPlan(plan.name)}
        >
          {loading ? 'Traitement...' : getButtonText(plan.name, plan.price_monthly)}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlanCard;
