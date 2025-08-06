
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';

interface ClientTestimonialsSectionProps {
  businessName: string;
}

// Mock testimonials - in real app this would come from reviews API
const mockTestimonials = [
  {
    id: 1,
    name: "Marie L.",
    rating: 5,
    comment: "Service rapide et efficace ! Mon iPhone a été réparé en 30 minutes, comme neuf. Je recommande vivement !",
    service: "Réparation écran iPhone",
    date: "Il y a 2 jours",
    verified: true
  },
  {
    id: 2,
    name: "Thomas K.",
    rating: 5,
    comment: "Excellent travail sur ma console PS5. Le technicien a pris le temps d'expliquer le problème et la réparation.",
    service: "Réparation console",
    date: "Il y a 1 semaine",
    verified: true
  },
  {
    id: 3,
    name: "Sophie M.",
    rating: 4,
    comment: "Prix correct et délai respecté. Mon ordinateur portable fonctionne parfaitement maintenant.",
    service: "Réparation PC portable",
    date: "Il y a 2 semaines",
    verified: false
  }
];

const ClientTestimonialsSection: React.FC<ClientTestimonialsSectionProps> = ({ businessName }) => {
  const averageRating = 4.8;
  const totalReviews = 127;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Avis clients</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-2 font-semibold text-lg">{averageRating}</span>
          </div>
          <span className="text-gray-600">({totalReviews} avis)</span>
        </div>
      </div>

      {/* Rating Summary */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{averageRating}/5</div>
              <div className="text-sm text-gray-600">Note moyenne</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">98%</div>
              <div className="text-sm text-gray-600">Clients satisfaits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{totalReviews}</div>
              <div className="text-sm text-gray-600">Avis vérifiés</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mockTestimonials.map((testimonial) => (
          <Card key={testimonial.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{testimonial.name}</span>
                      {testimonial.verified && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Vérifié
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{testimonial.date}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-gray-700 mb-3 leading-relaxed">{testimonial.comment}</p>
              
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {testimonial.service}
                </Badge>
                <div className="flex items-center text-xs text-gray-500">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Avis vérifié
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold text-lg mb-2">Rejoignez nos clients satisfaits !</h3>
          <p className="text-gray-600 mb-4">
            Plus de {totalReviews} clients ont fait confiance à {businessName} pour leurs réparations.
          </p>
          <div className="flex justify-center space-x-3">
            <Badge className="bg-green-100 text-green-800 px-3 py-1">
              ✓ Garantie 6 mois
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
              ✓ Devis gratuit
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 px-3 py-1">
              ✓ Intervention rapide
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientTestimonialsSection;
