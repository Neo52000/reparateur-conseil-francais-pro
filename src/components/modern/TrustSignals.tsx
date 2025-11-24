import { ShieldCheck, Clock, Wrench } from 'lucide-react';

const trustFeatures = [
  {
    icon: ShieldCheck,
    title: 'Réparateurs certifiés',
    description: 'Rien que des réparateurs certifiés et vérifiés',
  },
  {
    icon: Clock,
    title: 'Réparation Express',
    description: 'Réparation Express artificiellement assistée',
  },
  {
    icon: Wrench,
    title: 'Garantie incluse',
    description: 'Garantie incluse et calculs vous certifiés',
  },
];

const TrustSignals = () => {
  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-3 gap-8">
          {trustFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 mb-3">
                  <Icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500">
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
