
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Star, Zap, Crown, CreditCard, ShoppingCart, Lock, ArrowUp, Euro } from 'lucide-react';
import { useModuleAccess } from '@/hooks/useFeatureAccess';
import { useOptionalModules } from '@/hooks/useOptionalModules';

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
  const { modules, isModuleAvailableForPlan } = useOptionalModules();
  const [selectedModules, setSelectedModules] = useState({
    pos: false,
    ecommerce: false,
    buyback: false,
    advertising: false
  });

  // Mapper les noms de plans
  const planNameMap = {
    'Gratuit': 'gratuit',
    'Basique': 'basic', 
    'Premium': 'premium',
    'Enterprise': 'enterprise'
  };
  
  const planKey = planNameMap[plan.name as keyof typeof planNameMap] || 'gratuit';
  
  // Obtenir les modules configurés et leurs prix
  const getModuleInfo = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return null;
    
    return {
      available: isModuleAvailableForPlan(moduleId, planKey),
      pricing: module.pricing,
      name: module.name,
      description: module.description
    };
  };

  const calculateTotalPrice = () => {
    const basePlan = isYearly ? plan.price_yearly : plan.price_monthly;
    let totalModulesPrice = 0;
    
    // Calculer le prix pour chaque module sélectionné
    Object.entries(selectedModules).forEach(([moduleId, isSelected]) => {
      if (isSelected) {
        const moduleInfo = getModuleInfo(moduleId);
        if (moduleInfo?.available && moduleInfo.pricing) {
          totalModulesPrice += isYearly ? moduleInfo.pricing.yearly : moduleInfo.pricing.monthly;
        }
      }
    });
    
    return basePlan + totalModulesPrice;
  };

  const getModulesCount = () => {
    return Object.entries(selectedModules).filter(([moduleId, isSelected]) => {
      if (!isSelected) return false;
      const moduleInfo = getModuleInfo(moduleId);
      return moduleInfo?.available;
    }).length;
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
    <Card className={`relative ${getCardStyle(plan.name)} hover:shadow-xl transition-shadow plan-card-dynamic`}>
      {plan.name === 'Premium' && !isCurrentUserPlan(plan.name) && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-purple-600 text-white plan-badge-dynamic">
            Populaire
          </Badge>
        </div>
      )}

      {isCurrentUserPlan(plan.name) && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-600 text-white plan-badge-dynamic">
            Plan actuel
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          {getIcon(plan.name)}
          <CardTitle className="ml-2 text-base sm:text-lg lg:text-xl plan-title-dynamic">{plan.name}</CardTitle>
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 plan-price-dynamic">
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
                  <span className="text-xs sm:text-sm lg:text-base text-gray-600 plan-feature-dynamic">{feature.feature_name}</span>
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
                <span className="text-xs sm:text-sm lg:text-base text-gray-600 plan-feature-dynamic">{feature}</span>
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
            {/* Modules configurés dynamiquement */}
            {modules.filter(module => module.isActive && ['pos', 'ecommerce', 'buyback', 'advertising'].includes(module.id)).map(module => {
              const moduleInfo = getModuleInfo(module.id);
              const isAvailable = moduleInfo?.available || false;
              const moduleKey = module.id as keyof typeof selectedModules;
              
              const getModuleIcon = (moduleId: string) => {
                switch (moduleId) {
                  case 'pos': return <CreditCard className="h-4 w-4 mr-2 flex-shrink-0" />;
                  case 'ecommerce': return <ShoppingCart className="h-4 w-4 mr-2 flex-shrink-0" />;
                  case 'buyback': return <Euro className="h-4 w-4 mr-2 flex-shrink-0" />;
                  case 'advertising': return <Zap className="h-4 w-4 mr-2 flex-shrink-0" />;
                  default: return <CreditCard className="h-4 w-4 mr-2 flex-shrink-0" />;
                }
              };
              
              const getModuleColor = (moduleId: string) => {
                switch (moduleId) {
                  case 'pos': return 'purple-600';
                  case 'ecommerce': return 'blue-600';
                  case 'buyback': return 'green-600';
                  case 'advertising': return 'red-600';
                  default: return 'gray-600';
                }
              };
              
              return isAvailable ? (
                <div key={module.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                  <Checkbox
                    id={`${module.id}-${plan.id}`}
                    checked={selectedModules[moduleKey] || false}
                    onCheckedChange={(checked) => 
                      setSelectedModules(prev => ({ ...prev, [moduleKey]: !!checked }))
                    }
                    className={`data-[state=checked]:bg-${getModuleColor(module.id)} data-[state=checked]:border-${getModuleColor(module.id)}`}
                  />
                  <div className="flex items-center flex-1 min-w-0">
                    <div className={`text-${getModuleColor(module.id)}`}>
                      {getModuleIcon(module.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <label htmlFor={`${module.id}-${plan.id}`} className="text-sm font-medium text-gray-900 cursor-pointer block">
                        {module.name}
                      </label>
                      <p className="text-xs text-gray-600">{module.description.split(' ').slice(0, 4).join(' ')}...</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {module.pricing.monthly === 0 ? (
                      <span className="text-sm font-semibold text-green-600">Inclus</span>
                    ) : (
                      <>
                        <span className={`text-sm font-semibold text-${getModuleColor(module.id)}`}>
                          +{isYearly ? module.pricing.yearly.toFixed(2) : module.pricing.monthly.toFixed(2)}€
                        </span>
                        <p className="text-xs text-gray-500">{isYearly ? '/an' : '/mois'}</p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div key={module.id} className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg border opacity-60">
                  <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="text-gray-400">
                      {getModuleIcon(module.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-500 block">
                        {module.name}
                      </span>
                      <p className="text-xs text-gray-500">Disponible avec {module.availableForPlans.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <ArrowUp className="h-4 w-4 text-orange-500" />
                  </div>
                </div>
              );
            })}
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
                    {Object.entries(selectedModules).map(([moduleId, isSelected]) => {
                      if (!isSelected) return null;
                      const moduleInfo = getModuleInfo(moduleId);
                      if (!moduleInfo?.available) return null;
                      const module = modules.find(m => m.id === moduleId);
                      if (!module) return null;
                      
                      return (
                        <span key={moduleId} className={`px-2 py-1 rounded-full ${
                          module.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                          module.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                          module.color === 'green' ? 'bg-green-100 text-green-700' :
                          module.color === 'red' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {module.name}
                        </span>
                      );
                    })}
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
          className="w-full plan-button-dynamic"
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
