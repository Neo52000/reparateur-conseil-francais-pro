import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  promo?: boolean;
  badge?: string;
  recommended?: boolean;
}

interface DynamicPricingSectionProps {
  onSelectPlan: (planId: string) => void;
}

const DynamicPricingSection: React.FC<DynamicPricingSectionProps> = ({ onSelectPlan }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('plans-api', {
        body: { timestamp: Date.now() }
      });
      
      if (error) throw error;
      
      if (data?.success && data?.plans) {
        // Les plans arrivent déjà triés et avec la logique de recommandation depuis l'API
        setPlans(data.plans);
        console.log('Plans loaded:', data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (plan: Plan) => {
    return isYearly ? plan.price_yearly : plan.price_monthly;
  };

  const getSavings = (plan: Plan) => {
    if (!isYearly) return null;
    const monthlyTotal = plan.price_monthly * 12;
    const savings = monthlyTotal - plan.price_yearly;
    return savings > 0 ? savings : null;
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-muted-foreground">Chargement des tarifs...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/30" id="plans-section">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Choisissez le plan qui vous convient
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Commencez gratuitement et évoluez selon vos besoins
          </p>
          
          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Mensuel
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isYearly ? 'bg-electric-blue' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annuel
            </span>
            {isYearly && (
              <Badge className="bg-vibrant-orange text-white">
                Jusqu'à 2 mois offerts
              </Badge>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full justify-items-center">
          {plans.map((plan) => {
            const price = getPrice(plan);
            const savings = getSavings(plan);
            
            return (
              <Card 
                key={plan.id} 
                className={`relative transition-all duration-300 hover:shadow-xl ${
                  plan.recommended ? 'border-2 border-electric-blue shadow-lg scale-105' : 'hover:shadow-lg'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-electric-blue text-white px-4 py-1 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Recommandé
                    </Badge>
                  </div>
                )}
                
                {plan.promo && plan.badge && (
                  <div className="absolute -top-2 -right-2">
                    <Badge className="bg-vibrant-orange text-white px-3 py-1 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold text-foreground mb-2">
                    {plan.name}
                  </CardTitle>
                  
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-foreground">
                      {price === 0 ? 'Gratuit' : `${price}€`}
                    </div>
                    {price > 0 && (
                      <div className="text-sm text-muted-foreground">
                        /{isYearly ? 'an' : 'mois'}
                      </div>
                    )}
                    {savings && (
                      <div className="text-sm text-vibrant-orange font-medium mt-1">
                        Économisez {savings}€/an
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-electric-blue mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => onSelectPlan(plan.id)}
                    className={`w-full ${
                      plan.recommended 
                        ? 'bg-electric-blue hover:bg-electric-blue-dark' 
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}
                  >
                    {price === 0 ? 'Commencer gratuitement' : 'Choisir ce plan'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          </div>
        </div>

        {/* Additional info */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground text-sm">
            Tous les plans incluent un essai gratuit de 7 jours • Sans engagement • Support 7j/7
          </p>
        </div>
      </div>
    </section>
  );
};

export default DynamicPricingSection;