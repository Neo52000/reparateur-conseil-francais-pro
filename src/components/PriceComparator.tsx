
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, Euro, TrendingUp } from 'lucide-react';

const PriceComparator = () => {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedIssue, setSelectedIssue] = useState('');

  const brands = ['iPhone', 'Samsung', 'Xiaomi', 'Huawei'];
  const models = {
    'iPhone': ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro'],
    'Samsung': ['Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23 Ultra']
  };
  const issues = ['Écran cassé', 'Batterie', 'Connecteur charge', 'Boutons', 'Appareil photo'];

  // Données mockées des prix
  const priceData = [
    {
      repairer: 'TechRepair Pro',
      price: 180,
      originalPrice: 220,
      rating: 4.9,
      distance: 0.8,
      delay: '2h',
      warranty: '6 mois',
      inStock: true,
      promo: true
    },
    {
      repairer: 'Phone Fix Express',
      price: 195,
      originalPrice: 195,
      rating: 4.7,
      distance: 1.2,
      delay: '1j',
      warranty: '3 mois',
      inStock: true,
      promo: false
    },
    {
      repairer: 'iRepairation',
      price: 210,
      originalPrice: 210,
      rating: 4.8,
      distance: 2.1,
      delay: '4h',
      warranty: '12 mois',
      inStock: false,
      promo: false
    },
    {
      repairer: 'Mobile Service',
      price: 165,
      originalPrice: 165,
      rating: 4.6,
      distance: 3.5,
      delay: '2j',
      warranty: '6 mois',
      inStock: true,
      promo: false
    }
  ];

  const marketStats = {
    avgPrice: 188,
    minPrice: 165,
    maxPrice: 210,
    priceRange: '165€ - 210€'
  };

  return (
    <div className="space-y-6">
      {/* Configuration de la recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Euro className="h-5 w-5 mr-2" />
            Comparateur de prix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Marque</label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Modèle</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {selectedBrand && models[selectedBrand as keyof typeof models]?.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Type de panne</label>
              <Select value={selectedIssue} onValueChange={setSelectedIssue}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {issues.map(issue => (
                    <SelectItem key={issue} value={issue}>{issue}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques du marché */}
      {selectedBrand && selectedModel && selectedIssue && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Analyse du marché
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Prix moyen</p>
                <p className="text-2xl font-bold text-blue-600">{marketStats.avgPrice}€</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Prix minimum</p>
                <p className="text-2xl font-bold text-green-600">{marketStats.minPrice}€</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Prix maximum</p>
                <p className="text-2xl font-bold text-red-600">{marketStats.maxPrice}€</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Fourchette</p>
                <p className="text-lg font-bold text-gray-900">{marketStats.priceRange}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparaison des prix */}
      {selectedBrand && selectedModel && selectedIssue && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Résultats de comparaison</h3>
          {priceData.map((item, index) => (
            <Card key={index} className={`${index === 0 ? 'ring-2 ring-blue-500' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{item.repairer}</h3>
                      {index === 0 && <Badge>Meilleur choix</Badge>}
                      {item.promo && <Badge variant="destructive">Promo</Badge>}
                      {!item.inStock && <Badge variant="outline">Sur commande</Badge>}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span>{item.rating}/5</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                        <span>{item.distance} km</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-1" />
                        <span>{item.delay}</span>
                      </div>
                      <div className="text-gray-600">
                        Garantie: {item.warranty}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      {item.promo && (
                        <span className="text-sm text-gray-500 line-through">
                          {item.originalPrice}€
                        </span>
                      )}
                      <span className="text-2xl font-bold text-green-600">
                        {item.price}€
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {item.price < marketStats.avgPrice ? 
                        `${marketStats.avgPrice - item.price}€ sous la moyenne` : 
                        `${item.price - marketStats.avgPrice}€ au-dessus de la moyenne`
                      }
                    </p>
                    <div className="space-x-2">
                      <Button size="sm">
                        Demander un devis
                      </Button>
                      <Button size="sm" variant="outline">
                        Contacter
                      </Button>
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

export default PriceComparator;
