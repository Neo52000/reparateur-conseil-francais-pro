
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Star } from 'lucide-react';

interface Favorite {
  id: string;
  name: string;
  rating: number;
  specialty: string;
}

interface ClientFavoritesTabProps {
  favorites: Favorite[];
}

const ClientFavoritesTab: React.FC<ClientFavoritesTabProps> = ({ favorites }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Heart className="h-5 w-5 mr-2" />
          Réparateurs favoris
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">{favorite.name}</h3>
                <p className="text-sm text-gray-600">Spécialité: {favorite.specialty}</p>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="text-sm">{favorite.rating}</span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Contacter
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientFavoritesTab;
