
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Star, Trash2, Phone, MapPin } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useQuoteAndAppointment } from '@/hooks/useQuoteAndAppointment';

const ClientFavoritesTab: React.FC = () => {
  const { favorites, loading, removeFromFavorites } = useFavorites();
  const { handleRequestQuote } = useQuoteAndAppointment();

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleRemoveFavorite = (repairerId: string) => {
    removeFromFavorites(repairerId);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2" />
            Réparateurs favoris
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">Chargement de vos favoris...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Heart className="h-5 w-5 mr-2" />
          Réparateurs favoris ({favorites.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {favorites.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">Aucun réparateur favori</p>
            <p className="text-sm text-gray-400">
              Explorez notre réseau et ajoutez vos réparateurs préférés
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {favorite.repairer_profile.business_name || favorite.repairer_profile.name}
                  </h3>
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {favorite.repairer_profile.city} ({favorite.repairer_profile.postal_code})
                    </span>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= (favorite.repairer_profile.rating || 4.8) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium">
                        {favorite.repairer_profile.rating || 4.8}
                      </span>
                      <span className="ml-1 text-sm text-gray-600">
                        ({favorite.repairer_profile.review_count || 0} avis)
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => handleRequestQuote(favorite.repairer_id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    Demander un devis
                  </Button>
                  
                  <Button 
                    onClick={() => handleCall(favorite.repairer_profile.phone)}
                    variant="outline"
                    size="sm"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Appeler
                  </Button>
                  
                  <Button 
                    onClick={() => handleRemoveFavorite(favorite.repairer_id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientFavoritesTab;
