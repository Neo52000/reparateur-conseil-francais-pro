import { ShieldCheck, Clock, Wrench } from 'lucide-react';

const trustFeatures = [
  {
    icon: ShieldCheck,
    title: 'Certifié & Vérifié',
    description: 'Tous nos réparateurs sont vérifiés et certifiés pour garantir la qualité de service',
  },
  {
    icon: Clock,
    title: 'Réparation Express',
    description: 'Intervention rapide avec des délais de réparation optimisés selon vos besoins',
  },
  {
    icon: Wrench,
    title: 'Garantie incluse',
    description: 'Toutes les réparations sont garanties pour votre tranquillité d\'esprit',
  },
];

const TrustSignals = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {trustFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="text-center space-y-4 p-8 rounded-2xl hover:bg-muted/50 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground font-heading">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
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
