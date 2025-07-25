
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Star, Zap, Crown, CreditCard, ShoppingCart, Lock, ArrowUp } from 'lucide-react';
import { useModuleAccess } from '@/hooks/useFeatureAccess';

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  enabledFeatures?: {
    feature_key: string;
    feature_name: string;
    category: string;
    description?: string;
  }[];
}

interface PlanCardProps {
  plan: Plan;
  isYearly: boolean;
  currentPlan: string;
  loading: boolean;
  onSubscribe: (planId: string, selectedModules: { pos: boolean; ecommerce: boolean }, totalPrice: number) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isYearly,
  currentPlan,
  loading,
  onSubscribe
}) => {
  const [selectedModules, setSelectedModules] = useState({
    pos: false,
    ecommerce: false
  });

  // Vérifier l'accès aux modules selon le plan sélectionné
  const planNameMap = {
    'Gratuit': 'gratuit',
    'Basique': 'basique', 
    'Premium': 'premium',
    'Enterprise': 'enterprise'
  };
  
  // Simuler l'accès selon le plan en cours d'affichage
  const posAccessForPlan = ['premium', 'enterprise'].includes(planNameMap[plan.name as keyof typeof planNameMap] || '');
  const ecommerceAccessForPlan = ['premium', 'enterprise'].includes(planNameMap[plan.name as keyof typeof planNameMap] || '');

  const modulesPricing = {
    pos: { monthly: 49.90, yearly: 499.00 },
    ecommerce: { monthly: 89.90, yearly: 890.00 }
  };

  const calculateTotalPrice = () => {
    const basePlan = isYearly ? plan.price_yearly : plan.price_monthly;
    const posPrice = (posAccessForPlan && selectedModules.pos) ? (isYearly ? modulesPricing.pos.yearly : modulesPricing.pos.monthly) : 0;
    const ecommercePrice = (ecommerceAccessForPlan && selectedModules.ecommerce) ? (isYearly ? modulesPricing.ecommerce.yearly : modulesPricing.ecommerce.monthly) : 0;
    return basePlan + posPrice + ecommercePrice;
  };

  const getModulesCount = () => {
    let count = 0;
    if (posAccessForPlan && selectedModules.pos) count++;
    if (ecommerceAccessForPlan && selectedModules.ecommerce) count++;
    return count;
  };
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
            {calculateTotalPrice().toFixed(2)}€
          </div>
          <div className="text-sm text-gray-500">
            {plan.price_monthly === 0 ? 'Gratuit pour toujours' : 
             isYearly ? 'par an' : 'par mois'}
          </div>
          {getModulesCount() > 0 && (
            <div className="text-xs text-blue-600">
              Inclut {getModulesCount()} module{getModulesCount() > 1 ? 's' : ''} optionnel{getModulesCount() > 1 ? 's' : ''}
            </div>
          )}
          {isYearly && plan.price_monthly > 0 && (
            <div className="text-xs text-green-600">
              Économie sur le plan de base: {((plan.price_monthly * 12) - plan.price_yearly).toFixed(2)}€/an
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {/* Afficher d'abord les fonctionnalités spécifiques du plan */}
          {plan.enabledFeatures && plan.enabledFeatures.length > 0 ? (
            plan.enabledFeatures.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm text-gray-600">{feature.feature_name}</span>
                  {feature.description && (
                    <div className="text-xs text-gray-500 mt-0.5">{feature.description}</div>
                  )}
                </div>
              </li>
            ))
          ) : (
            // Fallback sur les anciennes fonctionnalités si pas de nouvelles
            plan.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-600">{feature}</span>
              </li>
            ))
          )}
        </ul>

        {/* Section modules optionnels avec checkboxes */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-gray-700">Modules optionnels</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Personnalisez votre plan</span>
          </div>
          
          <div className="space-y-3">
            {/* Module POS - conditionnel selon le plan */}
            {posAccessForPlan ? (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                <Checkbox
                  id={`pos-${plan.id}`}
                  checked={selectedModules.pos}
                  onCheckedChange={(checked) => 
                    setSelectedModules(prev => ({ ...prev, pos: !!checked }))
                  }
                  className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <div className="flex items-center flex-1 min-w-0">
                  <CreditCard className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label htmlFor={`pos-${plan.id}`} className="text-sm font-medium text-gray-900 cursor-pointer block">
                      Module POS
                    </label>
                    <p className="text-xs text-gray-600">Point de vente & inventaire</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-semibold text-purple-600">
                    +{isYearly ? modulesPricing.pos.yearly.toFixed(2) : modulesPricing.pos.monthly.toFixed(2)}€
                  </span>
                  <p className="text-xs text-gray-500">{isYearly ? '/an' : '/mois'}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg border opacity-60">
                <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex items-center flex-1 min-w-0">
                  <CreditCard className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-500 block">
                      Module POS
                    </span>
                    <p className="text-xs text-gray-500">Disponible avec Premium+</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <ArrowUp className="h-4 w-4 text-orange-500" />
                </div>
              </div>
            )}

            {/* Module E-commerce - conditionnel selon le plan */}
            {ecommerceAccessForPlan ? (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                <Checkbox
                  id={`ecommerce-${plan.id}`}
                  checked={selectedModules.ecommerce}
                  onCheckedChange={(checked) => 
                    setSelectedModules(prev => ({ ...prev, ecommerce: !!checked }))
                  }
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <div className="flex items-center flex-1 min-w-0">
                  <ShoppingCart className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label htmlFor={`ecommerce-${plan.id}`} className="text-sm font-medium text-gray-900 cursor-pointer block">
                      Module E-commerce
                    </label>
                    <p className="text-xs text-gray-600">Boutique en ligne intégrée</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-semibold text-blue-600">
                    +{isYearly ? modulesPricing.ecommerce.yearly.toFixed(2) : modulesPricing.ecommerce.monthly.toFixed(2)}€
                  </span>
                  <p className="text-xs text-gray-500">{isYearly ? '/an' : '/mois'}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg border opacity-60">
                <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex items-center flex-1 min-w-0">
                  <ShoppingCart className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-500 block">
                      Module E-commerce
                    </span>
                    <p className="text-xs text-gray-500">Disponible avec Premium+</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <ArrowUp className="h-4 w-4 text-orange-500" />
                </div>
              </div>
            )}
          </div>

          {/* Récapitulatif du prix */}
          {getModulesCount() > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Plan {plan.name} + {getModulesCount()} module{getModulesCount() > 1 ? 's' : ''}
                  </p>
                  <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-2">
                    {posAccessForPlan && selectedModules.pos && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">POS</span>}
                    {ecommerceAccessForPlan && selectedModules.ecommerce && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">E-commerce</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {calculateTotalPrice().toFixed(2)}€
                  </p>
                  <p className="text-xs text-gray-500">{isYearly ? '/an' : '/mois'}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-center text-gray-600">
              💡 Modules activables à tout moment depuis votre tableau de bord
            </p>
          </div>
        </div>

        <Button
          className="w-full"
          variant={plan.name === 'Premium' && !isCurrentUserPlan(plan.name) ? 'default' : 'outline'}
          onClick={() => onSubscribe(plan.id, selectedModules, calculateTotalPrice())}
          disabled={loading || isCurrentUserPlan(plan.name)}
        >
          {loading ? 'Traitement...' : getButtonText(plan.name, plan.price_monthly)}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlanCard;
