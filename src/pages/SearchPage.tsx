import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Phone, Star } from 'lucide-react';

// Mock data for demo
const mockRepairers = [
  {
    id: '1',
    name: 'TechRepair Pro',
    address: '123 rue de la République, 75001 Paris',
    phone: '01 23 45 67 89',
    rating: 4.8,
    reviewCount: 127,
    specialties: ['iPhone', 'Samsung', 'Écran'],
    distance: '0.5 km'
  },
  {
    id: '2',
    name: 'Mobile Fix Express',
    address: '456 avenue des Champs, 75008 Paris',
    phone: '01 98 76 54 32',
    rating: 4.6,
    reviewCount: 89,
    specialties: ['Android', 'Batterie', 'Réparation rapide'],
    distance: '1.2 km'
  },
  {
    id: '3',
    name: 'SmartPhone Clinic',
    address: '789 boulevard Saint-Germain, 75006 Paris',
    phone: '01 11 22 33 44',
    rating: 4.9,
    reviewCount: 203,
    specialties: ['Toutes marques', 'Diagnostic', 'Garantie'],
    distance: '2.1 km'
  }
];

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = () => {
    // TODO: Implement actual search logic
    console.log('Searching for:', searchTerm, 'in', location);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Trouvez votre réparateur</h1>
        <p className="text-muted-foreground">
          Recherchez un réparateur de smartphone près de chez vous
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type de réparation</label>
              <Input
                placeholder="Ex: écran cassé, batterie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Localisation</label>
              <Input
                placeholder="Ville ou code postal"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Réparateurs trouvés ({mockRepairers.length})
        </h2>
        
        {mockRepairers.map((repairer) => (
          <Card key={repairer.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold">{repairer.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {repairer.address}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Phone className="w-4 h-4 mr-1" />
                      {repairer.phone}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="font-medium">{repairer.rating}</span>
                      <span className="text-sm text-muted-foreground ml-1">
                        ({repairer.reviewCount} avis)
                      </span>
                    </div>
                    <Badge variant="outline">{repairer.distance}</Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {repairer.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="ml-4 space-y-2">
                  <Button className="w-full">
                    Demander un devis
                  </Button>
                  <Button variant="outline" className="w-full">
                    Voir le profil
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;