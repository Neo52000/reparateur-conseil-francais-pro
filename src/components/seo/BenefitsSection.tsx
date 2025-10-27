import React from 'react';
import { CheckCircle } from 'lucide-react';

interface BenefitsSectionProps {
  city: string;
}

export default function BenefitsSection({ city }: BenefitsSectionProps) {
  const benefits = [
    {
      title: 'Proximité',
      description: `Intervention rapide à ${city}`,
      detail: 'Nos réparateurs locaux interviennent dans un rayon de 10km. Service express disponible sous 2h.'
    },
    {
      title: 'Certification',
      description: 'Réparateurs qualifiés et vérifiés',
      detail: 'Tous nos partenaires sont certifiés et régulièrement évalués sur la qualité de leur travail.'
    },
    {
      title: 'Garantie',
      description: 'Toutes réparations garanties 6 mois',
      detail: 'Pièces et main d\'œuvre garanties. En cas de problème, nous reprenons l\'intervention gratuitement.'
    },
    {
      title: 'Devis gratuit',
      description: 'Diagnostic sans engagement sous 24h',
      detail: 'Recevez un devis détaillé et transparent avant toute intervention. Sans engagement.'
    },
    {
      title: 'Écologie',
      description: 'Réparation = -15kg CO2 vs achat neuf',
      detail: 'Prolongez la durée de vie de votre appareil de 2 ans en moyenne et réduisez votre empreinte carbone.'
    }
  ];

  return (
    <section className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Pourquoi nous choisir à {city} ?
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          5 bonnes raisons de faire confiance à nos réparateurs certifiés
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {benefits.map((benefit, index) => (
          <div 
            key={index}
            className="bg-white rounded-lg p-6 border-l-4 border-blue-600 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-foreground">{benefit.title}</h3>
                <p className="text-sm font-medium text-muted-foreground">{benefit.description}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground mb-2">
              Engagement qualité TopRéparateurs
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Chaque réparateur partenaire est sélectionné selon des critères stricts : certification professionnelle, 
              respect des délais, transparence tarifaire et satisfaction client. Vous bénéficiez ainsi d'un service 
              de confiance, proche de chez vous à {city}.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
