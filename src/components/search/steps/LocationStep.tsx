import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';
import type { SearchStepData } from '../AdvancedProductSearch';

interface LocationStepProps {
  searchData: Partial<SearchStepData>;
  onDataChange: (data: Partial<SearchStepData>) => void;
}

const LocationStep: React.FC<LocationStepProps> = ({
  searchData,
  onDataChange
}) => {
  const [isGeolocating, setIsGeolocating] = useState(false);

  const radiusOptions = [
    { value: 10, label: '10 km' },
    { value: 20, label: '20 km' },
    { value: 30, label: '30 km' },
    { value: 50, label: '50 km' },
    { value: 100, label: '100 km' }
  ];

  const handleCityChange = (city: string) => {
    onDataChange({
      location: {
        ...searchData.location,
        city,
        lat: undefined,
        lng: undefined
      }
    });
  };

  const handleRadiusChange = (radius: string) => {
    onDataChange({
      location: {
        ...searchData.location,
        radius: parseInt(radius)
      }
    });
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }

    setIsGeolocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding pour obtenir la ville
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=pk.eyJ1IjoiaXJlcGFyLWZyIiwiYSI6ImNseWFqNGJ2czFkdTUya3B6dXNmc2hrYWUifQ.yJwNky1VqL2yefgKJk3CQw&types=place`
          );
          
          if (response.ok) {
            const data = await response.json();
            const city = data.features[0]?.place_name || 'Position actuelle';
            
            onDataChange({
              location: {
                city,
                lat: latitude,
                lng: longitude,
                radius: searchData.location?.radius || 30
              }
            });
          }
        } catch (error) {
          console.error('Error with reverse geocoding:', error);
          onDataChange({
            location: {
              city: 'Position actuelle',
              lat: latitude,
              lng: longitude,
              radius: searchData.location?.radius || 30
            }
          });
        } finally {
          setIsGeolocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Impossible d\'obtenir votre position. Veuillez saisir votre ville manuellement.');
        setIsGeolocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  return (
    <div className="max-w-md mx-auto">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
        Où chercher des réparateurs ?
      </h3>
      
      <div className="space-y-6">
        {/* Ville */}
        <div>
          <Label htmlFor="city">Ville ou code postal</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="city"
              placeholder="Ex: Paris, 75001, Lyon..."
              value={searchData.location?.city || ''}
              onChange={(e) => handleCityChange(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleGeolocation}
              disabled={isGeolocating}
              className="flex items-center gap-2"
            >
              {isGeolocating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              ) : (
                <Navigation className="h-4 w-4" />
              )}
            </Button>
          </div>
          {searchData.location?.lat && searchData.location?.lng && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Position détectée automatiquement
            </p>
          )}
        </div>

        {/* Rayon de recherche */}
        <div>
          <Label htmlFor="radius">Rayon de recherche</Label>
          <Select 
            value={searchData.location?.radius?.toString() || '30'} 
            onValueChange={handleRadiusChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un rayon" />
            </SelectTrigger>
            <SelectContent>
              {radiusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Résumé de la recherche */}
        {searchData.location?.city && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-800 font-medium">Zone de recherche configurée</p>
                <p className="text-blue-700 text-sm mt-1">
                  Recherche dans un rayon de {searchData.location?.radius || 30} km autour de {searchData.location.city}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Résumé complet de la recherche */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Résumé de votre recherche :</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Produit :</strong> {searchData.deviceTypeName}</li>
            <li>• <strong>Marque :</strong> {searchData.brandName}</li>
            <li>• <strong>Modèle :</strong> {searchData.modelName}</li>
            <li>• <strong>Problème :</strong> {searchData.repairTypeName}</li>
            <li>• <strong>Zone :</strong> {searchData.location?.city} ({searchData.location?.radius || 30} km)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LocationStep;