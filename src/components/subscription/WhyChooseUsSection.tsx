import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Zap, HeadphonesIcon, MapPin, Clock, Star, CreditCard, ShoppingCart, Database, BarChart3, Smartphone } from 'lucide-react';
const WhyChooseUsSection: React.FC = () => {
  const benefits = [{
    icon: <TrendingUp className="h-8 w-8 text-green-500" />,
    title: "Augmentez votre chiffre d'affaires",
    description: "Nos partenaires voient en moyenne une augmentation de 150% de leur clientèle après 3 mois"
  }, {
    icon: <Users className="h-8 w-8 text-blue-500" />,
    title: "Clients qualifiés",
    description: "Nous pré-qualifions tous les clients pour vous garantir des demandes sérieuses et pertinentes"
  }, {
    icon: <MapPin className="h-8 w-8 text-purple-500" />,
    title: "Visibilité locale maximale",
    description: "Apparaissez en premier dans les recherches de votre zone géographique"
  }, {
    icon: <Zap className="h-8 w-8 text-yellow-500" />,
    title: "Réactivité instantanée",
    description: "Recevez les demandes en temps réel et répondez avant vos concurrents"
  }, {
    icon: <HeadphonesIcon className="h-8 w-8 text-indigo-500" />,
    title: "Support dédié 7j/7",
    description: "Une équipe dédiée vous accompagne pour optimiser votre profil et vos performances"
  }, {
    icon: <Star className="h-8 w-8 text-orange-500" />,
    title: "Réputation renforcée",
    description: "Système d'avis clients qui valorise votre expertise et attire de nouveaux clients"
  }];
  return <div className="py-16 bg-gray-50">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow h-full">
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
            </Card>)}
        </div>

        {/* Section modules additionnels */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              📱 Modules spécialisés disponibles
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Étendez vos capacités avec nos modules complémentaires pour une gestion complète
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Module POS */}
            <Card className="border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all hover:border-purple-300">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <CreditCard className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">Module POS - Point de Vente</h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-purple-600">49,90€</span>
                    <p className="text-sm text-gray-500">/mois</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Smartphone className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Terminal de paiement intégré</p>
                      <p className="text-sm text-gray-600">Acceptez les paiements par carte directement sur votre tablette</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Database className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Gestion d'inventaire</p>
                      <p className="text-sm text-gray-600">Suivez vos pièces détachées et accessoires en temps réel</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <BarChart3 className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Rapports de vente</p>
                      <p className="text-sm text-gray-600">Analysez vos performances avec des tableaux de bord détaillés</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-700 font-medium">
                    💡 Parfait pour les ateliers qui souhaitent moderniser leur caisse et optimiser leurs ventes
                  </p>
                  <p className="text-xs text-purple-600 mt-2">
                    Facturation séparée - Compatible avec tous les plans
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Module E-commerce */}
            <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all hover:border-blue-300">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <ShoppingCart className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">Module E-commerce</h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-600">89,90€</span>
                    <p className="text-sm text-gray-500">/mois</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <ShoppingCart className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Boutique en ligne intégrée</p>
                      <p className="text-sm text-gray-600">Vendez vos produits et services directement en ligne</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Database className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Gestion des commandes</p>
                      <p className="text-sm text-gray-600">Interface simple pour traiter et suivre vos commandes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Base client unifiée</p>
                      <p className="text-sm text-gray-600">Centralisez vos clients physiques et en ligne</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium">
                    🛒 Idéal pour étendre votre activité au-delà de l'atelier et toucher plus de clients
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    Facturation séparée - Compatible avec tous les plans
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        <div className="text-center mt-16">
          <div className="bg-blue-600 text-white p-6 rounded-lg inline-block">
            <h3 className="text-xl font-bold mb-2">🎯 Objectif : Votre réussite</h3>
            <p className="text-blue-100">
              Nous ne réussissons que si vous réussissez. C'est pourquoi nous mettons tout en œuvre 
              pour maximiser votre visibilité et vos revenus.
            </p>
          </div>
        </div>
      </div>
    </div>;
};
export default WhyChooseUsSection;