import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Phone, Clock, Euro, MessageSquare } from 'lucide-react';
import { SearchIntegrationService } from '@/services/pricing/searchIntegrationService';
import { useToast } from '@/hooks/use-toast';
import type { SearchStepData } from './AdvancedProductSearch';

interface SearchResultsWithPricingProps {
  searchData: SearchStepData;
  onBack: () => void;
}

interface RepairerResult {
  repairer_id: string;
  business_name: string;
  city: string;
  address: string;
  phone?: string;
  email?: string;
  custom_price?: number;
  has_predefined_pricing: boolean;
  margin_percentage?: number;
  notes?: string;
  location: {
    lat: number;
    lng: number;
  };
  distance?: number;
}

const SearchResultsWithPricing: React.FC<SearchResultsWithPricingProps> = ({
  searchData,
  onBack
}) => {
  const [results, setResults] = useState<RepairerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceStats, setPriceStats] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      try {
        // Recherche des réparateurs avec leurs prix
        const searchFilters = {
          deviceModelId: searchData.modelId,
          repairTypeId: searchData.repairTypeId,
          location: searchData.location.lat && searchData.location.lng ? {
            lat: searchData.location.lat,
            lng: searchData.location.lng,
            radius: searchData.location.radius
          } : undefined
        };

        const repairers = await SearchIntegrationService.searchRepairersByRepairType(
          searchData.modelId,
          searchData.repairTypeId,
          searchFilters.location
        );

        // Enrichir avec l'information de disponibilité des prix
        const enrichedResults = repairers.map((repairer: any) => ({
          ...repairer,
          has_predefined_pricing: !!repairer.custom_price,
          distance: searchFilters.location ? calculateDistance(
            searchFilters.location.lat,
            searchFilters.location.lng,
            repairer.location.lat,
            repairer.location.lng
          ) : undefined
        }));

        // Trier par disponibilité des prix puis par prix/distance
        const sortedResults = enrichedResults.sort((a: RepairerResult, b: RepairerResult) => {
          // Priorité aux réparateurs avec prix pré-définis
          if (a.has_predefined_pricing && !b.has_predefined_pricing) return -1;
          if (!a.has_predefined_pricing && b.has_predefined_pricing) return 1;
          
          // Si les deux ont des prix, trier par prix
          if (a.has_predefined_pricing && b.has_predefined_pricing) {
            return (a.custom_price || 0) - (b.custom_price || 0);
          }
          
          // Sinon trier par distance
          return (a.distance || 0) - (b.distance || 0);
        });

        setResults(sortedResults);

        // Récupérer les statistiques de prix
        const stats = await SearchIntegrationService.getPriceStatistics(
          searchData.modelId,
          searchData.repairTypeId
        );
        setPriceStats(stats);

      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Erreur de recherche",
          description: "Impossible de récupérer les résultats. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [searchData, toast]);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleRequestQuote = async (repairer: RepairerResult) => {
    try {
      // Logique pour demander un devis (24h timer)
      // TODO: Implémenter l'envoi de demande de devis avec délai 24h
      toast({
        title: "Demande envoyée",
        description: `Votre demande a été envoyée à ${repairer.business_name}. Ils ont 24h pour répondre.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleInstantOrder = (repairer: RepairerResult) => {
    // Logique pour commande immédiate avec prix affiché
    toast({
      title: "Redirection vers la commande",
      description: `Redirection vers la commande chez ${repairer.business_name}`,
    });
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Recherche en cours...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Nouvelle recherche
        </Button>
        
        <div className="text-right">
          <h2 className="text-xl font-semibold text-gray-900">
            {results.length} réparateur{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
          </h2>
          <p className="text-sm text-gray-600">
            {searchData.repairTypeName} • {searchData.brandName} {searchData.modelName}
          </p>
        </div>
      </div>

      {/* Statistiques de prix */}
      {priceStats && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Fourchette de prix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">{priceStats.min}€</p>
                <p className="text-sm text-blue-700">Prix minimum</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">{Math.round(priceStats.average)}€</p>
                <p className="text-sm text-blue-700">Prix moyen</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">{priceStats.max}€</p>
                <p className="text-sm text-blue-700">Prix maximum</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">{priceStats.count}</p>
                <p className="text-sm text-blue-700">Prix disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats */}
      {results.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600 mb-4">
              Aucun réparateur trouvé pour cette recherche.
            </p>
            <Button onClick={onBack} variant="outline">
              Modifier la recherche
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {results.map((repairer) => (
            <Card key={repairer.repairer_id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {repairer.business_name}
                      </h3>
                      
                      {repairer.has_predefined_pricing ? (
                        <Badge className="bg-green-100 text-green-800">
                          Prix immédiat
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Devis sur demande
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {repairer.city}
                        {repairer.distance && (
                          <span className="ml-1">• {Math.round(repairer.distance)} km</span>
                        )}
                      </div>
                      
                      {repairer.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {repairer.phone}
                        </div>
                      )}
                    </div>

                    {repairer.notes && (
                      <p className="text-sm text-gray-600 mb-3">
                        {repairer.notes}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    {repairer.has_predefined_pricing && repairer.custom_price ? (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Euro className="h-5 w-5 text-green-600" />
                          <span className="text-2xl font-bold text-green-600">
                            {repairer.custom_price}€
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">Prix fixe</p>
                      </div>
                    ) : (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Clock className="h-5 w-5 text-orange-600" />
                          <span className="text-lg font-medium text-orange-600">
                            24h
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">Délai de réponse</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {repairer.has_predefined_pricing ? (
                        <>
                          <Button
                            onClick={() => handleInstantOrder(repairer)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Commander
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleRequestQuote(repairer)}
                            className="flex items-center gap-1"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Devis
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleRequestQuote(repairer)}
                          className="flex items-center gap-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Demander un devis
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResultsWithPricing;