import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Search, MapPin, ChevronLeft, ChevronRight, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LocationSearchModal from '@/components/modals/LocationSearchModal';
import MapModal from '@/components/modals/MapModal';
import DeviceTypeStep from '@/components/search/steps/DeviceTypeStep';
import BrandStep from '@/components/search/steps/BrandStep';
import ModelStep from '@/components/search/steps/ModelStep';
import RepairTypeStep from '@/components/search/steps/RepairTypeStep';
import LocationStep from '@/components/search/steps/LocationStep';
import SearchResultsWithPricing from '@/components/search/SearchResultsWithPricing';
import { SearchStepData } from '@/components/search/AdvancedProductSearch';
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
  const {
    user
  } = useAuth();
  const navigate = useNavigate();

  // État pour les modales de recherche rapide
  const [isLocationSearchModalOpen, setIsLocationSearchModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // État pour la recherche personnalisée
  const [showPersonalizedSearch, setShowPersonalizedSearch] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [searchData, setSearchData] = useState<Partial<SearchStepData>>({
    location: {
      city: '',
      radius: 30
    }
  });
  const [showResults, setShowResults] = useState(false);
  const steps = [{
    title: 'Type de produit',
    component: DeviceTypeStep
  }, {
    title: 'Marque',
    component: BrandStep
  }, {
    title: 'Modèle',
    component: ModelStep
  }, {
    title: 'Type de panne',
    component: RepairTypeStep
  }, {
    title: 'Localisation',
    component: LocationStep
  }];
  const handleLocationSearch = (searchCriteria: SearchCriteria) => {
    onQuickSearch(searchCriteria);
  };
  const handlePersonalizedSearchClick = () => {
    if (!user) {
      // Stocker l'intention de recherche personnalisée
      localStorage.setItem('pendingPersonalizedSearch', 'true');
      navigate('/client-auth');
      return;
    }
    setShowPersonalizedSearch(true);
  };
  const handleStepData = (stepData: Partial<SearchStepData>) => {
    setSearchData(prev => ({
      ...prev,
      ...stepData
    }));
  };
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  const handleSearch = () => {
    setShowResults(true);
  };
  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return !!searchData.deviceTypeId;
      case 1:
        return !!searchData.brandId;
      case 2:
        return !!searchData.modelId;
      case 3:
        return !!searchData.repairTypeId;
      case 4:
        return !!searchData.location?.city;
      default:
        return false;
    }
  };
  const progress = (currentStep + 1) / steps.length * 100;
  const CurrentStepComponent = steps[currentStep]?.component;

  // Écouter l'événement de restauration de recherche personnalisée
  useEffect(() => {
    const handleRestorePersonalizedSearch = () => {
      if (user) {
        setShowPersonalizedSearch(true);
      }
    };
    window.addEventListener('restorePersonalizedSearch', handleRestorePersonalizedSearch);
    return () => {
      window.removeEventListener('restorePersonalizedSearch', handleRestorePersonalizedSearch);
    };
  }, [user]);

  // Affichage des résultats de recherche
  if (showResults) {
    return <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SearchResultsWithPricing searchData={searchData as SearchStepData} onBack={() => {
          setShowResults(false);
          setShowPersonalizedSearch(true);
        }} />
        </div>
      </div>;
  }

  // Affichage de la recherche personnalisée
  if (showPersonalizedSearch) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button variant="outline" onClick={() => setShowPersonalizedSearch(false)} className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>

          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Recherche personnalisée
                </h2>
                <p className="text-gray-600">
                  Trouvez le réparateur parfait en 5 étapes simples
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">
                    Étape {currentStep + 1} sur {steps.length}
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {steps[currentStep]?.title}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Step Content */}
              <div className="min-h-[300px] mb-8">
                {CurrentStepComponent && <CurrentStepComponent searchData={searchData} onDataChange={handleStepData} />}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0} className="flex items-center gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>

                {currentStep === steps.length - 1 ? <Button onClick={handleSearch} disabled={!isStepValid()} className="flex items-center gap-2 bg-primary hover:bg-primary/90">
                    Rechercher
                    <ChevronRight className="h-4 w-4" />
                  </Button> : <Button onClick={handleNext} disabled={!isStepValid()} className="flex items-center gap-2">
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </Button>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>;
  }

  // Affichage du Hero principal
  return <div className="relative h-[70vh] hero-bg">
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <div className="relative z-20 flex flex-col justify-center items-center h-full text-white px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-slate-50">
            Trouvez un réparateur de smartphone près de chez vous en 2 clics
          </h1>
          
          <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Les meilleurs réparateurs, les meilleurs délais et les meilleurs avis 
            Partout en France
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button onClick={() => setIsLocationSearchModalOpen(true)} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-3">
              <Search className="h-6 w-6" />
              Recherche rapide
            </Button>

            <Button onClick={handlePersonalizedSearchClick} size="lg" className="bg-success-button hover:bg-success-button/90 text-success-button-foreground px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-3">
              {user ? <User className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
              Recherche personnalisée
              {!user && <span className="text-sm text-success-button-foreground/90">(Connexion requise)</span>}
            </Button>

            <Button onClick={() => setIsMapModalOpen(true)} size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-3">
              <MapPin className="h-6 w-6" />
              Voir la carte
            </Button>
          </div>

          {!user && <div className="bg-blue-600/20 backdrop-blur-sm border border-blue-400/30 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-100">
                <Lock className="h-4 w-4 inline mr-2" />
                Connectez-vous pour accéder à la recherche personnalisée avec des recommandations adaptées à vos besoins
              </p>
            </div>}
        </div>
      </div>

      <LocationSearchModal isOpen={isLocationSearchModalOpen} onClose={() => setIsLocationSearchModalOpen(false)} onSearch={handleLocationSearch} />

      <MapModal isOpen={isMapModalOpen} onClose={() => setIsMapModalOpen(false)} />
    </div>;
};
export default HeroWithIntegratedSearch;