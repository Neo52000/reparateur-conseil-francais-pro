
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Filter,
  Star,
  Clock,
  Smartphone,
  Shield
} from 'lucide-react';
import RepairersMap from '@/components/RepairersMap';
import RepairersList from '@/components/RepairersList';
import SearchFilters from '@/components/SearchFilters';
import Footer from '@/components/Footer';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const quickStats = [
    { label: 'Réparateurs partenaires', value: '150+', icon: Smartphone },
    { label: 'Avis clients', value: '12,500+', icon: Star },
    { label: 'Villes couvertes', value: '85', icon: MapPin },
    { label: 'Temps de réponse moyen', value: '< 2h', icon: Clock },
  ];

  const popularServices = [
    'Écran cassé', 'Batterie', 'Réparation eau', 'Connecteur charge', 'Appareil photo', 'Haut-parleur'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Hero Section avec image pleine largeur et recherche dessus */}
      <div className="relative h-screen bg-cover bg-center" style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')"
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-white px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              RepairHub
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Trouvez le meilleur réparateur près de chez vous
            </p>
          </div>

          {/* Barre de recherche sur l'image */}
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Recherche rapide de réparateurs
              </h2>
              
              <div className="flex flex-col space-y-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Rechercher un service (ex: écran cassé iPhone 14)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <MapPin className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Ville ou code postal"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button className="w-full" size="lg">
                  Rechercher
                </Button>
              </div>

              {/* Popular Services */}
              <div className="mt-6 space-y-2">
                <span className="text-sm text-gray-600">Services populaires :</span>
                <div className="flex flex-wrap gap-2">
                  {popularServices.map((service, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-blue-100"
                    >
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Controls and Map/List */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'map' ? "default" : "outline"}
              onClick={() => setViewMode('map')}
              size="sm"
            >
              Carte
            </Button>
            <Button
              variant={viewMode === 'list' ? "default" : "outline"}
              onClick={() => setViewMode('list')}
              size="sm"
            >
              Liste
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6">
            <SearchFilters />
          </div>
        )}

        {/* Main Content - Carte */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {viewMode === 'map' ? (
            <>
              <div className="lg:col-span-2">
                <RepairersMap />
              </div>
              <div>
                <RepairersList compact />
              </div>
            </>
          ) : (
            <div className="lg:col-span-3">
              <RepairersList />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
