
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { subscriptionService } from '@/services/subscriptionService';
import { useToast } from '@/hooks/use-toast';
import { useFeatureManagement } from '@/hooks/useFeatureManagement';

// Nouveaux composants
import HeroSection from '@/components/subscription/HeroSection';
import SocialProofSection from '@/components/subscription/SocialProofSection';
import WhyChooseUsSection from '@/components/subscription/WhyChooseUsSection';
import ContactAdvisorModal from '@/components/subscription/ContactAdvisorModal';
import FAQSection from '@/components/subscription/FAQSection';
import SocialShareSection from '@/components/subscription/SocialShareSection';
import PrivacyNotice from '@/components/subscription/PrivacyNotice';

// Composants refactorisés
import PlansHeader from '@/components/subscription/PlansHeader';
import PlanToggle from '@/components/subscription/PlanToggle';
import PlansGrid from '@/components/subscription/PlansGrid';
import PlansFooter from '@/components/subscription/PlansFooter';

type SubscriptionPlan = Tables<'subscription_plans'>;

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
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Utiliser le hook avec synchronisation temps réel
  const { planConfigs, planFeatureMatrix, loading: featureLoading } = useFeatureManagement();

  const effectiveUserEmail = userEmail || user?.email || 'demo@example.com';

  // Convertir les planConfigs en format Plan
  const plans: Plan[] = planConfigs.map((config) => {
    const planFeatures = planFeatureMatrix.filter(
      item => item.planAccess[config.planName] === true
    );
    
    return {
      id: config.planName,
      name: config.planName,
      price_monthly: config.planPriceMonthly,
      price_yearly: config.planPriceYearly,
      features: Object.keys(config.features).filter(key => config.features[key]),
      enabledFeatures: planFeatures.map(pf => ({
        feature_key: pf.feature.featureKey,
        feature_name: pf.feature.featureName,
        category: pf.feature.category,
        description: pf.feature.description
      }))
    };
  });

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    const result = await subscriptionService.getUserSubscription(effectiveUserEmail);
    if (result.success && result.subscription) {
      setCurrentPlan(result.subscription.subscription_tier);
    }
  };

  const handleSubscribe = async (planId: string, selectedModules: { pos: boolean; ecommerce: boolean }, totalPrice: number) => {
    console.log('handleSubscribe called with planId:', planId);
    console.log('selectedModules:', selectedModules);
    console.log('totalPrice:', totalPrice);
    console.log('isYearly:', isYearly);
    console.log('repairerId:', repairerId);
    console.log('effectiveUserEmail:', effectiveUserEmail);
    
    setLoading(true);
    
    try {
      console.log('Calling supabase function create-subscription...');
      
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          planId,
          billingCycle: isYearly ? 'yearly' : 'monthly',
          repairerId,
          email: effectiveUserEmail,
          selectedModules,
          totalPrice,
        },
      });

      console.log('Supabase function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la création de la souscription. Veuillez contacter le support.",
          variant: "destructive"
        });
        return;
      }

      if (data?.url) {
        console.log('Opening payment URL:', data.url);
        window.open(data.url, '_blank');
        toast({
          title: "Redirection vers le paiement",
          description: "Vous êtes redirigé vers la page de paiement sécurisée.",
        });
      } else {
        console.error('No payment URL received from function');
        toast({
          title: "Information",
          description: "Contactez-nous au 07 45 06 21 62 pour finaliser votre abonnement.",
        });
      }
    } catch (error) {
      console.error('Error in handleSubscribe:', error);
      toast({
        title: "Erreur technique",
        description: "Une erreur technique est survenue. Contactez le support au contact@topreparateurs.fr",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/repairer/dashboard');
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
      <div id="plans-section" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto p-6">
          <PlansHeader
            showBackButton={showBackButton}
            currentPlan={currentPlan}
            onBackClick={handleBackClick}
          />
          
          <PlanToggle
            isYearly={isYearly}
            onToggle={setIsYearly}
          />

           <PlansGrid
             plans={plans}
             isYearly={isYearly}
             currentPlan={currentPlan}
             loading={loading || featureLoading}
             onSubscribe={handleSubscribe}
           />

          <PlansFooter />
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
