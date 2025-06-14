
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
  Phone,
  Clock,
  Smartphone,
  Shield
} from 'lucide-react';
import RepairersMap from '@/components/RepairersMap';
import RepairersList from '@/components/RepairersList';
import SearchFilters from '@/components/SearchFilters';

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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Shield className="h-8 w-8 text-blue-600 mr-2" />
                <h1 className="text-xl font-bold text-gray-900">TechRepair Advisor</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Devenir partenaire
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trouvez le meilleur réparateur près de chez vous
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Comparez les réparateurs, consultez les avis clients et choisissez selon vos critères
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
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
                  className="pl-10 w-48"
                />
              </div>
              <Button>
                Rechercher
              </Button>
            </div>
          </div>

          {/* Popular Services */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <span className="text-sm text-gray-600 mr-2">Services populaires :</span>
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

        {/* Controls */}
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
    </div>
  );
};

export default Index;
