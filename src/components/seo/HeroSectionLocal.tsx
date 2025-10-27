import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Clock, Shield } from 'lucide-react';

interface HeroSectionLocalProps {
  seoPage: any;
  serviceType: string;
  city: string;
}

export default function HeroSectionLocal({ seoPage, serviceType, city }: HeroSectionLocalProps) {
  return (
    <section className="relative bg-blue-950 text-white pt-32 pb-20 overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-gray-900/90"></div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-orange-500" />
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-1.5 text-sm">
                {seoPage.city}
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {seoPage.h1_title || seoPage.title}
            </h1>

            <p className="text-xl text-white/90 leading-relaxed max-w-2xl">
              {seoPage.meta_description}
            </p>

            <div className="flex flex-wrap gap-4">
              <Badge variant="secondary" className="bg-white/10 border-white/20 text-white px-4 py-2 text-base">
                <Star className="h-4 w-4 mr-2 text-yellow-400 fill-current" />
                {seoPage.repairer_count} réparateurs
              </Badge>
              <Badge variant="secondary" className="bg-white/10 border-white/20 text-white px-4 py-2 text-base">
                <Clock className="h-4 w-4 mr-2" />
                Note {seoPage.average_rating}/5
              </Badge>
              <Badge variant="secondary" className="bg-white/10 border-white/20 text-white px-4 py-2 text-base">
                <Shield className="h-4 w-4 mr-2" />
                Certifiés
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all px-8 py-6 text-lg"
              >
                Devis gratuit
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 px-8 py-6 text-lg"
              >
                Voir les réparateurs
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 pt-4 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Garantie 6 mois</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Intervention rapide</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Paiement sécurisé</span>
              </div>
            </div>
          </div>

          {/* Right Column - Image or Stats */}
          <div className="hidden lg:block">
            {seoPage.hero_image_url ? (
              <img 
                src={seoPage.hero_image_url} 
                alt={`Réparation ${serviceType} ${city}`}
                className="rounded-lg shadow-2xl w-full h-auto object-cover"
                loading="eager"
              />
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-white/10 rounded-lg">
                    <div className="text-4xl font-bold text-orange-500">{seoPage.repairer_count}</div>
                    <div className="text-sm mt-2 text-white/80">Réparateurs certifiés</div>
                  </div>
                  <div className="text-center p-6 bg-white/10 rounded-lg">
                    <div className="text-4xl font-bold text-orange-500">{seoPage.average_rating}</div>
                    <div className="text-sm mt-2 text-white/80">Note moyenne</div>
                  </div>
                  <div className="text-center p-6 bg-white/10 rounded-lg">
                    <div className="text-4xl font-bold text-orange-500">24h</div>
                    <div className="text-sm mt-2 text-white/80">Délai moyen</div>
                  </div>
                  <div className="text-center p-6 bg-white/10 rounded-lg">
                    <div className="text-4xl font-bold text-orange-500">6 mois</div>
                    <div className="text-sm mt-2 text-white/80">Garantie</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
