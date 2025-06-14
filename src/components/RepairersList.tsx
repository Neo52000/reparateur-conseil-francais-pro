
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  Euro,
  ExternalLink,
  Heart
} from 'lucide-react';

interface RepairersListProps {
  compact?: boolean;
}

// Mock data étendue
const mockRepairers = [
  {
    id: 1,
    name: "TechFix Pro",
    address: "123 Rue de la République, 75001 Paris",
    distance: "0.5 km",
    rating: 4.8,
    reviewCount: 245,
    services: ["iPhone", "Samsung", "iPad", "Xiaomi"],
    specialties: ["Écran", "Batterie", "Réparation eau"],
    priceRange: "€€",
    responseTime: "< 1h",
    isOpen: true,
    openUntil: "19h00",
    phone: "01 42 36 54 78",
    website: "www.techfixpro.fr",
    image: "/placeholder.svg",
    verified: true,
    promotions: ["Premier diagnostic gratuit"]
  },
  {
    id: 2,
    name: "Mobile Repair Center",
    address: "45 Avenue Victor Hugo, 69002 Lyon",
    distance: "1.2 km",
    rating: 4.6,
    reviewCount: 182,
    services: ["iPhone", "Huawei", "OnePlus", "Google Pixel"],
    specialties: ["Connecteur", "Caméra", "Haut-parleur"],
    priceRange: "€",
    responseTime: "< 2h",
    isOpen: true,
    openUntil: "18h30",
    phone: "04 78 92 45 67",
    website: "www.mobilerepair-lyon.fr",
    image: "/placeholder.svg",
    verified: true,
    promotions: []
  },
  {
    id: 3,
    name: "QuickFix Mobile",
    address: "78 Boulevard de la Canebière, 13001 Marseille",
    distance: "2.1 km",
    rating: 4.9,
    reviewCount: 156,
    services: ["iPhone", "Samsung", "Google Pixel", "Nothing"],
    specialties: ["Réparation express", "Pièces premium"],
    priceRange: "€€€",
    responseTime: "< 30min",
    isOpen: false,
    openUntil: "Fermé - Ouvre à 9h00",
    phone: "04 91 54 32 18",
    website: "www.quickfix-marseille.com",
    image: "/placeholder.svg",
    verified: true,
    promotions: ["Garantie 2 ans", "Réparation en 30min"]
  }
];

const RepairersList: React.FC<RepairersListProps> = ({ compact = false }) => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const RepairerCard = ({ repairer }: { repairer: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex space-x-4">
          {/* Image */}
          <div className="flex-shrink-0">
            <img
              src={repairer.image}
              alt={repairer.name}
              className="w-16 h-16 bg-gray-200 rounded-lg object-cover"
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {repairer.name}
                  </h3>
                  {repairer.verified && (
                    <Badge variant="secondary" className="text-xs">
                      Vérifié
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center mt-1">
                  {renderStars(repairer.rating)}
                  <span className="ml-2 text-sm text-gray-600">
                    {repairer.reviewCount} avis
                  </span>
                </div>

                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="truncate">{repairer.address}</span>
                  <span className="ml-2 font-medium">{repairer.distance}</span>
                </div>

                {/* Services */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {repairer.services.slice(0, compact ? 2 : 4).map((service: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                  {repairer.services.length > (compact ? 2 : 4) && (
                    <Badge variant="outline" className="text-xs">
                      +{repairer.services.length - (compact ? 2 : 4)}
                    </Badge>
                  )}
                </div>

                {/* Quick Info */}
                <div className="flex items-center space-x-4 mt-3 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-green-600" />
                    <span className="text-green-600">{repairer.responseTime}</span>
                  </div>
                  <div className="flex items-center">
                    <Euro className="h-4 w-4 mr-1 text-gray-600" />
                    <span className="text-gray-600">{repairer.priceRange}</span>
                  </div>
                  <div className={`flex items-center ${repairer.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                    <div className={`w-2 h-2 rounded-full mr-1 ${repairer.isOpen ? 'bg-green-600' : 'bg-red-600'}`} />
                    <span className="text-xs">{repairer.openUntil}</span>
                  </div>
                </div>

                {/* Promotions */}
                {repairer.promotions.length > 0 && (
                  <div className="mt-2">
                    {repairer.promotions.map((promo: string, index: number) => (
                      <Badge key={index} className="mr-1 bg-orange-100 text-orange-800 text-xs">
                        {promo}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-2 ml-4">
                <Button size="sm">
                  Voir profil
                </Button>
                <Button size="sm" variant="outline">
                  <Phone className="h-4 w-4 mr-1" />
                  Appeler
                </Button>
                {!compact && (
                  <Button size="sm" variant="ghost">
                    <Heart className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {compact && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {mockRepairers.length} réparateurs trouvés
          </h3>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-1" />
            Voir tout
          </Button>
        </div>
      )}

      {mockRepairers.map((repairer) => (
        <RepairerCard key={repairer.id} repairer={repairer} />
      ))}

      {!compact && (
        <div className="text-center py-6">
          <Button variant="outline">
            Charger plus de résultats
          </Button>
        </div>
      )}
    </div>
  );
};

export default RepairersList;
