import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DeviceTypeStep from './steps/DeviceTypeStep';
import BrandStep from './steps/BrandStep';
import ModelStep from './steps/ModelStep';
import RepairTypeStep from './steps/RepairTypeStep';
import LocationStep from './steps/LocationStep';
import SearchResultsWithPricing from './SearchResultsWithPricing';

export interface SearchStepData {
  deviceTypeId: string;
  deviceTypeName: string;
  brandId: string;
  brandName: string;
  modelId: string;
  modelName: string;
  repairTypeId: string;
  repairTypeName: string;
  location: {
    city: string;
    lat?: number;
    lng?: number;
    radius: number;
  };
}

const AdvancedProductSearch: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [searchData, setSearchData] = useState<Partial<SearchStepData>>({
    location: { city: '', radius: 30 }
  });
  const [showResults, setShowResults] = useState(false);

  const steps = [
    { title: 'Type de produit', component: DeviceTypeStep },
    { title: 'Marque', component: BrandStep },
    { title: 'Modèle', component: ModelStep },
    { title: 'Type de panne', component: RepairTypeStep },
    { title: 'Localisation', component: LocationStep }
  ];

  const handleStepData = (stepData: Partial<SearchStepData>) => {
    setSearchData(prev => ({ ...prev, ...stepData }));
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
      case 0: return !!searchData.deviceTypeId;
      case 1: return !!searchData.brandId;
      case 2: return !!searchData.modelId;
      case 3: return !!searchData.repairTypeId;
      case 4: return !!searchData.location?.city;
      default: return false;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep]?.component;

  if (showResults) {
    return (
      <SearchResultsWithPricing 
        searchData={searchData as SearchStepData}
        onBack={() => setShowResults(false)}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
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
            {CurrentStepComponent && (
              <CurrentStepComponent
                searchData={searchData}
                onDataChange={handleStepData}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleSearch}
                disabled={!isStepValid()}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              >
                Rechercher
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex items-center gap-2"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedProductSearch;