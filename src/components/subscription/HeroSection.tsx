
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Shield, Users } from 'lucide-react';

interface HeroSectionProps {
  onContactAdvisor: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onContactAdvisor }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <Badge className="mb-4 bg-green-100 text-green-800">
          ✅ 1200+ réparateurs nous font confiance
        </Badge>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Développez votre activité de réparation
          <span className="text-blue-600"> avec plus de clients</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Rejoignez la plateforme leader qui connecte les réparateurs professionnels 
          avec des milliers de clients. Augmentez votre visibilité et développez 
          votre chiffre d'affaires dès aujourd'hui.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button size="lg" onClick={onContactAdvisor} className="bg-green-600 hover:bg-green-700">
            📞 Parler à un conseiller gratuitement
          </Button>
          <Button size="lg" variant="outline">
            🚀 Choisir mon plan
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3">
            <Star className="h-8 w-8 text-yellow-500" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">4.8/5 de satisfaction</div>
              <div className="text-sm text-gray-600">Avis clients vérifiés</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">+150% de clients</div>
              <div className="text-sm text-gray-600">En moyenne après 3 mois</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-green-500" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Support 7j/7</div>
              <div className="text-sm text-gray-600">Équipe dédiée</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
