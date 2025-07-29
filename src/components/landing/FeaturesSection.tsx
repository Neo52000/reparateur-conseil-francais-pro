import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Receipt, Store, MapPin, RotateCcw } from 'lucide-react';

const features = [
  {
    icon: Receipt,
    emoji: "🧾",
    title: "POS certifié NF525",
    description: "Encaissez, facturez et gérez vos produits en toute conformité.",
    benefits: ["Conformité garantie", "Factures automatiques", "Gestion stock"]
  },
  {
    icon: Store,
    emoji: "🛍️", 
    title: "Votre boutique en ligne",
    description: "Créez votre vitrine locale en quelques clics, sans compétence technique.",
    benefits: ["Installation rapide", "Design professionnel", "Paiement sécurisé"]
  },
  {
    icon: MapPin,
    emoji: "📍",
    title: "Référencement local intelligent", 
    description: "Apparaissez en tête des recherches locales selon vos spécialités.",
    benefits: ["Visibilité Google", "Pages optimisées", "Avis clients"]
  },
  {
    icon: RotateCcw,
    emoji: "🔁",
    title: "Suivi QualiRépar intégré",
    description: "Automatisez vos remboursements de bonus grâce à notre module GesCo.",
    benefits: ["Bonus automatiques", "Suivi centralisé", "Reporting complet"]
  }
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Tout ce dont vous avez besoin pour développer votre activité
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Une solution complète qui s'adapte à vos besoins et grandit avec votre business
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-electric-blue">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-electric-blue-light rounded-xl flex items-center justify-center text-2xl">
                      {feature.emoji}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-electric-blue transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-electric-blue rounded-full"></div>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;