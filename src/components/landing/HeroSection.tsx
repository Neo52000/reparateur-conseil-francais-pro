import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
  onWatchDemo: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onWatchDemo }) => {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-electric-blue via-electric-blue-dark to-electric-blue overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-vibrant-orange rounded-full mix-blend-overlay"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Boostez votre visibilité locale avec{' '}
            <span className="text-vibrant-orange">TopRéparateurs</span>
          </h1>
          
          <p className="text-xl sm:text-2xl mb-8 text-electric-blue-light leading-relaxed">
            Rejoignez le 1er annuaire de réparateurs en France et apparaissez en tête des recherches locales de vos clients.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-vibrant-orange hover:bg-vibrant-orange-dark text-white px-8 py-4 text-lg font-semibold group"
            >
              Démarrer gratuitement
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              onClick={onWatchDemo}
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-electric-blue px-8 py-4 text-lg font-semibold group"
            >
              <Play className="mr-2 w-5 h-5" />
              Voir la démo
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-electric-blue-light">
            <div>
              <div className="text-2xl font-bold text-white">2500+</div>
              <div className="text-sm">Réparateurs actifs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">98%</div>
              <div className="text-sm">Satisfaction client</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">NF525</div>
              <div className="text-sm">Certifié</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">7j/7</div>
              <div className="text-sm">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;