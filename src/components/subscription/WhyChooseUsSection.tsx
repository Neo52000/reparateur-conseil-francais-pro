
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  TrendingUp, 
  Shield, 
  Users, 
  Zap, 
  HeadphonesIcon, 
  MapPin,
  Clock,
  Star
} from 'lucide-react';

const WhyChooseUsSection: React.FC = () => {
  const benefits = [
    {
      icon: <TrendingUp className="h-8 w-8 text-green-500" />,
      title: "Augmentez votre chiffre d'affaires",
      description: "Nos partenaires voient en moyenne une augmentation de 150% de leur clientèle après 3 mois"
    },
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: "Clients qualifiés",
      description: "Nous pré-qualifions tous les clients pour vous garantir des demandes sérieuses et pertinentes"
    },
    {
      icon: <MapPin className="h-8 w-8 text-purple-500" />,
      title: "Visibilité locale maximale",
      description: "Apparaissez en premier dans les recherches de votre zone géographique"
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      title: "Réactivité instantanée",
      description: "Recevez les demandes en temps réel et répondez avant vos concurrents"
    },
    {
      icon: <Shield className="h-8 w-8 text-red-500" />,
      title: "Paiements sécurisés",
      description: "Système de paiement intégré avec protection anti-fraude et garantie de paiement"
    },
    {
      icon: <HeadphonesIcon className="h-8 w-8 text-indigo-500" />,
      title: "Support dédié 7j/7",
      description: "Une équipe dédiée vous accompagne pour optimiser votre profil et vos performances"
    },
    {
      icon: <Clock className="h-8 w-8 text-teal-500" />,
      title: "Gestion simplifiée",
      description: "Planning intégré, facturation automatique et suivi des réparations en un clic"
    },
    {
      icon: <Star className="h-8 w-8 text-orange-500" />,
      title: "Réputation renforcée",
      description: "Système d'avis clients qui valorise votre expertise et attire de nouveaux clients"
    }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pourquoi choisir notre plateforme ?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Découvrez tous les avantages qui font de nous le partenaire idéal 
            pour développer votre activité de réparation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow h-full">
              <CardContent className="p-6 text-center h-full flex flex-col">
                <div className="mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm flex-grow">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-blue-600 text-white p-6 rounded-lg inline-block">
            <h3 className="text-xl font-bold mb-2">🎯 Objectif : Votre réussite</h3>
            <p className="text-blue-100">
              Nous ne réussissons que si vous réussissez. C'est pourquoi nous mettons tout en œuvre 
              pour maximiser votre visibilité et vos revenus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUsSection;
