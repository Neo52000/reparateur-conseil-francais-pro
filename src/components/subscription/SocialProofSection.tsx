
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Quote, Star } from 'lucide-react';

const SocialProofSection: React.FC = () => {
  const testimonials = [
    {
      name: "Marc Dubois",
      business: "Réparation Mobile Plus",
      city: "Lyon",
      rating: 5,
      comment: "Depuis que j'ai rejoint la plateforme, j'ai doublé mon chiffre d'affaires. Les clients arrivent régulièrement et sont de qualité.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Sophie Martin",
      business: "TechRepair Pro",
      city: "Paris",
      rating: 5,
      comment: "Interface intuitive et support client exceptionnel. Je recommande vivement à tous mes collègues réparateurs.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c5ad?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Ahmed Benali",
      business: "Mobile Expert",
      city: "Marseille",
      rating: 5,
      comment: "Grâce à cette plateforme, j'ai pu développer ma clientèle et professionnaliser mon activité. Un vrai game-changer !",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    }
  ];

  const stats = [
    { number: "1200+", label: "Réparateurs actifs" },
    { number: "50K+", label: "Réparations réalisées" },
    { number: "98%", label: "Taux de satisfaction" },
    { number: "24h", label: "Temps de réponse moyen" }
  ];

  return (
    <div className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Statistiques */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Rejoignez une communauté qui grandit
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Des milliers de réparateurs développent leur activité avec nous
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Témoignages */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Ce que disent nos partenaires
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Quote className="h-8 w-8 text-blue-500 mr-3" />
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-6 italic">
                    "{testimonial.comment}"
                  </p>
                  
                  <div className="flex items-center">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.business}</div>
                      <div className="text-sm text-gray-500">{testimonial.city}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Labels de confiance */}
        <div className="text-center">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <Badge variant="outline" className="px-4 py-2">
              🏆 Certifié Qualité
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              🔒 Données sécurisées
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              📊 Conforme RGPD
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              ⚡ Support réactif
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialProofSection;
