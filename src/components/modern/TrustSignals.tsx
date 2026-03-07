import { ShieldCheck, Clock, Wrench } from 'lucide-react';

const trustFeatures = [
  {
    icon: ShieldCheck,
    title: 'Réparateurs vérifiés',
    description: 'Tous nos réparateurs sont vérifiés et évalués par notre équipe',
  },
  {
    icon: Clock,
    title: 'Réparation express',
    description: 'La plupart des réparations effectuées en moins de 30 minutes',
  },
  {
    icon: Wrench,
    title: 'Garantie 6 mois',
    description: 'Toutes les réparations sont garanties 6 mois minimum',
  },
];

const TrustSignals = () => {
  return (
    <section className="py-12 bg-card border-y border-border" aria-label="Nos engagements qualité">
      <div className="container mx-auto px-6 lg:px-10">
        <h2 className="sr-only">Pourquoi choisir TopRéparateurs pour votre réparation</h2>
        <div className="grid md:grid-cols-3 gap-8" role="list">
          {trustFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="text-center"
                role="listitem"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                  <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustSignals;
