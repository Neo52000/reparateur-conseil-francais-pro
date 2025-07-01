import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, ArrowDown } from 'lucide-react';

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
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white py-20">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-4xl mx-auto text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Développez votre activité avec TopRéparateurs
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-blue-100">
          Rejoignez notre réseau de réparateurs professionnels et boostez votre visibilité
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button
            onClick={onContactAdvisor}
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Phone className="mr-2 h-5 w-5" />
            Parler à un conseiller
          </Button>
          
          <Button
            onClick={scrollToPlans}
            variant="outline"
            size="lg"
            className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 text-lg backdrop-blur-sm"
          >
            Voir nos plans
            <ArrowDown className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold text-yellow-300 mb-2">+500</div>
            <div className="text-blue-100">Réparateurs partenaires</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold text-yellow-300 mb-2">+10k</div>
            <div className="text-blue-100">Réparations par mois</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold text-yellow-300 mb-2">98%</div>
            <div className="text-blue-100">Clients satisfaits</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
