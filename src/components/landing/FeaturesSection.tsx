import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Receipt, Store, MapPin, RotateCcw } from 'lucide-react';

const features = [
  {
    icon: MapPin,
    emoji: "📍",
    title: "Annuaire et référencement local", 
    description: "Apparaissez en 1ère page Google quand vos clients cherchent un réparateur près de chez eux.",
    benefits: ["Visibilité Google garantie", "Fiche d'entreprise optimisée", "Géolocalisation précise"]
  },
  {
    icon: Store,
    emoji: "⭐", 
    title: "Profil réparateur enrichi",
    description: "Créez votre vitrine professionnelle avec photos, avis clients et spécialités détaillées.",
    benefits: ["Photos avant/après", "Avis clients vérifiés", "Spécialités par marque"]
  },
  {
    icon: Receipt,
    emoji: "🧾",
    title: "Outils métier avancés",
    description: "POS certifié NF525, gestion des devis et suivi des réparations en option.",
    benefits: ["Conformité garantie", "Devis en ligne", "Gestion planning"]
  },
  {
    icon: RotateCcw,
    emoji: "🔁",
    title: "Support QualiRépar",
    description: "Module de gestion GesCo pour automatiser vos demandes de bonus en option.",
    benefits: ["Bonus automatiques", "Suivi centralisé", "Reporting complet"]
  }
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Maximisez votre visibilité et trouvez plus de clients
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Focus sur l'essentiel : être trouvé par vos clients. Les outils métier s'ajoutent selon vos besoins.
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