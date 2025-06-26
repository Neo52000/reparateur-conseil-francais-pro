
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Star } from 'lucide-react';

interface HeroSectionProps {
  onContactAdvisor: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onContactAdvisor }) => {
  const scrollToPlans = () => {
    const plansSection = document.getElementById('plans-section');
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-orange-600 text-white py-20">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Développez votre activité de réparation
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
          Rejoignez la première plateforme française qui met en relation 
          les clients avec des réparateurs qualifiés près de chez eux
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            onClick={scrollToPlans}
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold text-lg px-8 py-4"
          >
            Choisir mon plan
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button 
            onClick={onContactAdvisor}
            size="lg" 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold text-lg px-8 py-4"
          >
            Parler à un conseiller
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="font-semibold mb-2">+5000 clients satisfaits</h3>
            <p className="text-blue-100">Chaque mois sur notre plateforme</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8" />
            </div>
            <h3 className="font-semibold mb-2">Note moyenne 4.8/5</h3>
            <p className="text-blue-100">Satisfaction client garantie</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <ArrowRight className="h-8 w-8" />
            </div>
            <h3 className="font-semibold mb-2">Inscription gratuite</h3>
            <p className="text-blue-100">Commencez dès aujourd'hui</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
