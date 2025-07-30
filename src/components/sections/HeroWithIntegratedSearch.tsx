import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin, Smartphone, Tablet, Laptop, Watch, Gamepad2, MoreHorizontal, ArrowRight } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import LocationSearchModal from '@/components/modals/LocationSearchModal';
import MapModal from '@/components/modals/MapModal';

interface SearchCriteria {
  deviceType: string;
  brand: string;
  model: string;
  repairType: string;
  city: string;
  postalCode: string;
}

interface HeroWithIntegratedSearchProps {
  onQuickSearch: (searchCriteria: SearchCriteria) => void;
  onMapSearch: () => void;
}

const HeroWithIntegratedSearch: React.FC<HeroWithIntegratedSearchProps> = ({
  onQuickSearch,
  onMapSearch
}) => {
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('');
  const [isLocationSearchModalOpen, setIsLocationSearchModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  
  const { deviceTypes, loading } = useCatalog();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLocationSearch = (searchCriteria: SearchCriteria) => {
    onQuickSearch(searchCriteria);
  };

  const handleMapModalClose = () => {
    setIsMapModalOpen(false);
  };

  const getDeviceIcon = (name: string) => {
    const normalizedName = name.toLowerCase();
    if (normalizedName.includes('smartphone') || normalizedName.includes('téléphone')) {
      return Smartphone;
    } else if (normalizedName.includes('tablette') || normalizedName.includes('tablet')) {
      return Tablet;
    } else if (normalizedName.includes('ordinateur') || normalizedName.includes('laptop')) {
      return Laptop;
    } else if (normalizedName.includes('montre') || normalizedName.includes('watch')) {
      return Watch;
    } else if (normalizedName.includes('console') || normalizedName.includes('jeux')) {
      return Gamepad2;
    }
    return MoreHorizontal;
  };

  const handleDeviceTypeSelect = (deviceTypeId: string) => {
    if (!user) {
      // Redirection directe vers la page d'authentification
      window.location.href = '/auth';
      return;
    }
    
    setSelectedDeviceType(deviceTypeId);
    // Continuer avec le processus de recherche avancée
  };

  const handleAdvancedSearchToggle = () => {
    setShowAdvancedSearch(!showAdvancedSearch);
  };

  const handleQuickSearchClick = () => {
    if (!user) {
      // Redirection directe vers la page d'authentification
      window.location.href = '/auth';
      return;
    }
    setIsLocationSearchModalOpen(true);
  };

  try {
    return (
      <div className="relative min-h-screen bg-cover bg-center" style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')"
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        <div className="relative z-20 flex flex-col justify-center items-center min-h-screen text-white px-4 sm:px-6 lg:px-8 py-20">
          <div className="w-full max-w-6xl">
            {/* Section Hero principale */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Trouvez un réparateur de smartphone en 2 clics
              </h1>
              
              <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
                Les meilleurs réparateurs, les meilleurs délais et les meilleurs avis partout en France
              </p>

              {/* Boutons principaux */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button 
                  onClick={handleQuickSearchClick}
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-3"
                >
                  <Search className="h-6 w-6" />
                  Recherche rapide
                </Button>

                <Button 
                  onClick={() => setIsMapModalOpen(true)}
                  size="lg" 
                  variant="outline" 
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-3"
                >
                  <MapPin className="h-6 w-6" />
                  Voir la carte
                </Button>

                <Button 
                  onClick={handleAdvancedSearchToggle}
                  size="lg" 
                  variant="outline" 
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-3"
                >
                  <Smartphone className="h-6 w-6" />
                  Recherche détaillée
                  <ArrowRight className={`h-4 w-4 transition-transform ${showAdvancedSearch ? 'rotate-90' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Section de recherche avancée intégrée */}
            {showAdvancedSearch && (
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Recherche personnalisée
                    </h2>
                    <p className="text-gray-600">
                      Sélectionnez le type de produit pour commencer
                    </p>
                    {!user && (
                      <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-orange-800 font-medium">
                          🔐 Connexion requise pour accéder à la recherche détaillée
                        </p>
                        <Button 
                          onClick={() => window.location.href = '/auth'}
                          className="mt-2 bg-orange-600 hover:bg-orange-700"
                        >
                          Se connecter / S'inscrire
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Grille des types de produits */}
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement des produits...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {deviceTypes.map((deviceType) => {
                        const IconComponent = getDeviceIcon(deviceType.name);
                        const isSelected = selectedDeviceType === deviceType.id;
                        
                        return (
                          <Card
                            key={deviceType.id}
                            className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                              isSelected 
                                ? 'ring-2 ring-blue-600 bg-blue-50 border-blue-600' 
                                : 'hover:border-blue-300 hover:shadow-md'
                            } ${!user ? 'opacity-60' : ''}`}
                            onClick={() => handleDeviceTypeSelect(deviceType.id)}
                          >
                            <div className="text-center">
                              <IconComponent 
                                className={`h-8 w-8 mx-auto mb-3 ${
                                  isSelected ? 'text-blue-600' : 'text-gray-600'
                                }`} 
                              />
                              <h4 className={`font-medium text-sm ${
                                isSelected ? 'text-blue-600' : 'text-gray-900'
                              }`}>
                                {deviceType.name}
                              </h4>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}

                  {/* Affichage conditionnel des statistiques */}
                  <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">2847</p>
                      <p className="text-sm text-blue-800">Réparateurs</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">4.8</p>
                      <p className="text-sm text-green-800">Note moyenne</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">24h</p>
                      <p className="text-sm text-purple-800">Délai moyen</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">€49</p>
                      <p className="text-sm text-orange-800">Prix moyen</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Modals */}
        <LocationSearchModal 
          isOpen={isLocationSearchModalOpen} 
          onClose={() => setIsLocationSearchModalOpen(false)} 
          onSearch={handleLocationSearch} 
        />

        <MapModal 
          isOpen={isMapModalOpen} 
          onClose={handleMapModalClose} 
        />
      </div>
    );
  } catch (error) {
    console.error('Erreur critique dans HeroWithIntegratedSearch:', error);
    return (
      <div className="relative h-[70vh] bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mt-4">Chargement en cours...</p>
        </div>
      </div>
    );
  }
};

export default HeroWithIntegratedSearch;