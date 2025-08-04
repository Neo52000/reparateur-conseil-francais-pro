import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Phone, Mail, Globe, Verified } from 'lucide-react';
import { Supplier } from '@/hooks/useSuppliersDirectory';

interface SupplierCardProps {
  supplier: Supplier;
  onViewDetails: (id: string) => void;
}

export const SupplierCard = ({ supplier, onViewDetails }: SupplierCardProps) => {
  const renderRating = (rating: number, reviewCount: number) => {
    return (
      <div className="flex items-center gap-1">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {rating.toFixed(1)} ({reviewCount})
        </span>
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardContent className="p-6 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {supplier.logo_url ? (
              <img
                src={supplier.logo_url}
                alt={`Logo ${supplier.name}`}
                className="w-12 h-12 object-contain rounded-lg"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-600">
                  {supplier.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{supplier.name}</h3>
                {supplier.is_verified && (
                  <Verified className="h-5 w-5 text-blue-500" />
                )}
              </div>
              {supplier.is_featured && (
                <Badge variant="secondary" className="text-xs">
                  Recommandé
                </Badge>
              )}
            </div>
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {supplier.description}
        </p>

        <div className="space-y-3">
          {supplier.rating > 0 && (
            <div>{renderRating(supplier.rating, supplier.review_count)}</div>
          )}

          {supplier.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {supplier.specialties.slice(0, 3).map((specialty) => (
                <Badge key={specialty} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {supplier.specialties.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{supplier.specialties.length - 3}
                </Badge>
              )}
            </div>
          )}

          {supplier.brands_sold.length > 0 && (
            <div>
              <span className="text-sm font-medium">Marques : </span>
              <span className="text-sm text-muted-foreground">
                {supplier.brands_sold.slice(0, 3).join(', ')}
                {supplier.brands_sold.length > 3 && (
                  <span> et {supplier.brands_sold.length - 3} autres</span>
                )}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {supplier.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>{supplier.phone}</span>
              </div>
            )}
            {supplier.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{supplier.email}</span>
              </div>
            )}
            {supplier.website && (
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span>Site web</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button 
          onClick={() => onViewDetails(supplier.id)}
          className="w-full"
          variant="outline"
        >
          Voir les détails
        </Button>
      </CardFooter>
    </Card>
  );
};