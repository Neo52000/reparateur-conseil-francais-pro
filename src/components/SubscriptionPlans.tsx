
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Star, Zap, Crown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { subscriptionService } from '@/services/subscriptionService';

// Nouveaux composants
import HeroSection from '@/components/subscription/HeroSection';
import SocialProofSection from '@/components/subscription/SocialProofSection';
import WhyChooseUsSection from '@/components/subscription/WhyChooseUsSection';
import ContactAdvisorModal from '@/components/subscription/ContactAdvisorModal';
import FAQSection from '@/components/subscription/FAQSection';
import SocialShareSection from '@/components/subscription/SocialShareSection';
import PrivacyNotice from '@/components/subscription/PrivacyNotice';

type SubscriptionPlan = Tables<'subscription_plans'>;

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
}

interface SubscriptionPlansProps {
  repairerId?: string;
  userEmail?: string;
  showBackButton?: boolean;
}

const SubscriptionPlans = ({ 
  repairerId = 'demo', 
  userEmail, 
  showBackButton = false 
}: SubscriptionPlansProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const effectiveUserEmail = userEmail || user?.email || 'demo@example.com';

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price_monthly', { ascending: true });

    if (data && !error) {
      const convertedPlans: Plan[] = data.map((plan: SubscriptionPlan) => ({
        id: plan.id,
        name: plan.name,
        price_monthly: plan.price_monthly,
        price_yearly: plan.price_yearly,
        features: Array.isArray(plan.features) ? plan.features as string[] : []
      }));
      setPlans(convertedPlans);
    }
  };

  const fetchCurrentSubscription = async () => {
    const result = await subscriptionService.getUserSubscription(effectiveUserEmail);
    if (result.success && result.subscription) {
      setCurrentPlan(result.subscription.subscription_tier);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          planId,
          billingCycle: isYearly ? 'yearly' : 'monthly',
          repairerId,
          email: effectiveUserEmail,
        },
      });

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        console.error('Error creating subscription:', error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-white">
      {/* Section héro */}
      <HeroSection onContactAdvisor={() => setIsContactModalOpen(true)} />
      
      {/* Preuves sociales */}
      <SocialProofSection />
      
      {/* Pourquoi nous choisir */}
      <WhyChooseUsSection />

      {/* Section des plans */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto p-6">
          {showBackButton && (
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => navigate('/repairer/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour au tableau de bord
              </Button>
            </div>
          )}

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos plans d'abonnement
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Choisissez le plan qui correspond à vos besoins et à votre budget
            </p>
            
            {currentPlan && currentPlan !== 'free' && (
              <div className="mb-6">
                <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
                  Plan actuel : {currentPlan}
                </Badge>
              </div>
            )}
            
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Mensuel
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
              />
              <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Annuel
              </span>
              {isYearly && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  -10% de réduction
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${getCardStyle(plan.name)} hover:shadow-xl transition-shadow`}>
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

                  <Button
                    className="w-full"
                    variant={plan.name === 'Premium' && !isCurrentUserPlan(plan.name) ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading || isCurrentUserPlan(plan.name)}
                  >
                    {getButtonText(plan.name, plan.price_monthly)}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Tous les plans peuvent être annulés à tout moment. 
              Les changements prennent effet immédiatement.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <FAQSection />
      
      {/* Partage social */}
      <SocialShareSection />
      
      {/* Notice de confidentialité */}
      <PrivacyNotice />

      {/* Modal de contact conseiller */}
      <ContactAdvisorModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
};

export default SubscriptionPlans;
