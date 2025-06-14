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
  Shield,
  FileText,
  Calendar,
  User
} from 'lucide-react';
import RepairersMap from '@/components/RepairersMap';
import RepairersList from '@/components/RepairersList';
import SearchFilters from '@/components/SearchFilters';
import { Link } from 'react-router-dom';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode<'map' | 'list'>('map');

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
      {/* Hero Section with Role Selection */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              RepairHub - Votre plateforme de réparation
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Connectez clients et réparateurs pour un service optimal
            </p>
            
            {/* Choix du type d'utilisateur */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="hover:shadow-lg transition-shadow border-blue-200">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="flex items-center justify-center text-blue-800">
                    <User className="h-6 w-6 mr-2" />
                    Je suis un Client
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <CardDescription className="mb-4">
                    Trouvez le meilleur réparateur près de chez vous, comparez les prix et suivez vos réparations.
                  </CardDescription>
                  <ul className="text-sm text-gray-600 mb-6 space-y-2">
                    <li>• Recherche et comparaison de réparateurs</li>
                    <li>• Demande de devis gratuit</li>
                    <li>• Prise de rendez-vous en ligne</li>
                    <li>• Suivi en temps réel</li>
                  </ul>
                  <Link to="/client/auth">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Accéder à l'espace client
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-orange-200">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="flex items-center justify-center text-orange-800">
                    <Smartphone className="h-6 w-6 mr-2" />
                    Je suis un Réparateur
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <CardDescription className="mb-4">
                    Développez votre activité, gérez vos clients et optimisez votre planning.
                  </CardDescription>
                  <ul className="text-sm text-gray-600 mb-6 space-y-2">
                    <li>• Gestion des demandes client</li>
                    <li>• Tableau de bord business</li>
                    <li>• Planning et facturation</li>
                    <li>• Visibilité accrue</li>
                  </ul>
                  <Link to="/repairer/auth">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700">
                      Accéder à l'espace réparateur
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section for visitors */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Recherche rapide de réparateurs
          </h2>
          
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
