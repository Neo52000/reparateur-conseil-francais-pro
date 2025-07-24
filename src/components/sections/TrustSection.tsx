import React from 'react';
import { Shield, Users, Clock, Award, CreditCard, CheckCircle } from 'lucide-react';

const TrustSection: React.FC = () => {
  const trustBadges = [
    {
      icon: Shield,
      title: "Paiement sécurisé",
      description: "Vos données sont protégées"
    },
    {
      icon: Users,
      title: "Réparateurs vérifiés",
      description: "Professionnels certifiés"
    },
    {
      icon: Clock,
      title: "Garantie 6 mois",
      description: "Sur toutes les réparations"
    },
    {
      icon: Award,
      title: "Qualité garantie",
      description: "Service de confiance"
    }
  ];

  const testimonials = [
    {
      text: "Service rapide, téléphone réparé en 1h. Merci !",
      author: "Laura",
      city: "Paris"
    },
    {
      text: "Bon rapport qualité-prix, je recommande.",
      author: "Thomas",
      city: "Lyon"
    },
    {
      text: "Excellent service client et réparation parfaite !",
      author: "Marie",
      city: "Marseille"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Badges de confiance */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pourquoi choisir TopRéparateurs ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une plateforme de confiance pour tous vos besoins de réparation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {trustBadges.map((badge, index) => {
            const IconComponent = badge.icon;
            return (
              <div key={index} className="text-center group">
                <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {badge.title}
                  </h3>
                  <p className="text-gray-600">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Avantages clés */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
            <span className="text-gray-800 font-medium">Comparaison instantanée</span>
          </div>
          <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
            <span className="text-gray-800 font-medium">Réparateurs vérifiés</span>
          </div>
          <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
            <span className="text-gray-800 font-medium">Rendez-vous ou dépôt express</span>
          </div>
          <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
            <CreditCard className="h-6 w-6 text-green-500 flex-shrink-0" />
            <span className="text-gray-800 font-medium">Paiement sécurisé</span>
          </div>
          <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
            <Shield className="h-6 w-6 text-green-500 flex-shrink-0" />
            <span className="text-gray-800 font-medium">Garantie 6 mois</span>
          </div>
        </div>

        {/* Témoignages */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Ce que disent nos clients
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-4xl text-blue-600 mb-4">"</div>
                <p className="text-gray-700 mb-4 italic">
                  {testimonial.text}
                </p>
                <div className="text-sm text-gray-500">
                  — {testimonial.author} ({testimonial.city})
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;